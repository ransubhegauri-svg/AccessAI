/**
 * AccessAI Native WebRTC Video Calling Service
 * Connects Teacher (Host Broadcaster) and Student (Receiver) peer-to-peer.
 * Uses MeetingChannel as the zero-backend signaling transport.
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" }
  ]
};

export class WebRtcManager {
  constructor({ meetingChannel, isHost = false, onRemoteStream = () => {}, onConnectionState = () => {} }) {
    this.channel = meetingChannel;
    this.isHost = isHost;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionState = onConnectionState;

    this.localStream = null;
    this.localMediaPromise = null;
    this.remoteStream = null;
    this.peers = new Map(); // peerId -> RTCPeerConnection
    this.candidateQueues = new Map(); // peerId -> RTCIceCandidate[]
    this.unsubscribeSignal = null;
    this.isDestroyed = false;

    this._initSignalListener();
  }

  _initSignalListener() {
    this.unsubscribeSignal = this.channel.onSignal(async (signalData, senderId) => {
      if (this.isDestroyed || !signalData) return;

      try {
        if (signalData.type === "offer") {
          await this._handleOffer(signalData, senderId);
        } else if (signalData.type === "answer") {
          await this._handleAnswer(signalData, senderId);
        } else if (signalData.type === "candidate") {
          await this._handleCandidate(signalData, senderId);
        }
      } catch (err) {
        console.warn("[WebRTC] Signal handling error:", err);
      }
    });
  }

  /**
   * Acquire local webcam and mic (Teacher host, or voluntary student camera)
   */
  startLocalMedia({ video = true, audio = true } = {}) {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error("Camera / Microphone mediaDevices not supported in this environment"));
    }

    this.localMediaPromise = (async () => {
      try {
        const videoConstraints = video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 16 / 9 },
          frameRate: { ideal: 30 }
        } : false;

        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
          });
        } catch (strictErr) {
          console.warn("[WebRTC] Strict constraints failed, falling back to basic media:", strictErr);
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: video ? true : false,
            audio: audio ? true : false
          });
        }

        // Lock hardware / browser digital zoom and auto-framing to 1.0x (stable)
        try {
          const videoTrack = this.localStream.getVideoTracks()[0];
          if (videoTrack && videoTrack.getCapabilities) {
            const caps = videoTrack.getCapabilities();
            if (caps.zoom) {
              await videoTrack.applyConstraints({
                advanced: [{ zoom: caps.zoom.min || 1 }]
              }).catch(() => {});
            }
          }
        } catch (zoomErr) {}

        // Attach tracks to any already-created peer connections
        for (const [peerId, pc] of this.peers.entries()) {
          const senders = pc.getSenders ? pc.getSenders() : [];
          this.localStream.getTracks().forEach((track) => {
            const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
            if (!alreadyAdded && pc.addTrack) {
              try {
                pc.addTrack(track, this.localStream);
              } catch (e) {}
            }
          });

          // Send offer now that media tracks are attached
          if (this.isHost) {
            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              });
              await pc.setLocalDescription(offer);
              this.channel.sendSignal(peerId, {
                type: "offer",
                sdp: offer.sdp
              });
            } catch (e) {}
          }
        }

        return this.localStream;
      } catch (err) {
        console.error("[WebRTC] Failed to acquire local media:", err);
        throw err;
      }
    })();

    return this.localMediaPromise;
  }

  getLocalStream() {
    return this.localStream;
  }

  /**
   * Dynamically attaches or updates local media stream (e.g. voluntary student camera)
   * and triggers WebRTC renegotiation with connected peers.
   */
  async addLocalStream(stream) {
    if (!stream) return;
    this.localStream = stream;

    // Apply digital zoom constraint 1.0x to avoid hardware auto-framing jumps
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities) {
        const caps = videoTrack.getCapabilities();
        if (caps.zoom) {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: caps.zoom.min || 1 }]
          }).catch(() => {});
        }
      }
    } catch (e) {}

    // Add or replace tracks for all existing peers
    for (const [peerId, pc] of this.peers.entries()) {
      try {
        const senders = pc.getSenders ? pc.getSenders() : [];
        let needsRenegotiation = false;

        stream.getTracks().forEach((track) => {
          const existingSender = senders.find((s) => s.track && s.track.kind === track.kind);
          if (existingSender) {
            existingSender.replaceTrack(track).catch(() => {});
          } else if (pc.addTrack) {
            try {
              pc.addTrack(track, stream);
              needsRenegotiation = true;
            } catch (addErr) {}
          }
        });

        if (needsRenegotiation && pc.signalingState === "stable") {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);
          this.channel.sendSignal(peerId, {
            type: "offer",
            sdp: offer.sdp
          });
        }
      } catch (err) {
        console.warn(`[WebRTC] Error adding local stream to peer ${peerId}:`, err);
      }
    }
  }

  /**
   * Removes local media tracks when camera is toggled off
   */
  removeLocalStream() {
    this.peers.forEach((pc, peerId) => {
      try {
        const senders = pc.getSenders ? pc.getSenders() : [];
        senders.forEach((sender) => {
          if (sender.track && sender.track.kind === "video") {
            try {
              pc.removeTrack(sender);
            } catch (e) {}
          }
        });
      } catch (e) {}
    });
    this.localStream = null;
  }

  /**
   * Initiates a WebRTC connection to a peer
   */
  async connectToPeer(peerId) {
    if (this.isDestroyed || !peerId || peerId === this.channel.currentUserId) return;
    if (this.peers.has(peerId)) return;

    // Await localMediaPromise so initial offer always carries video tracks!
    if (this.localMediaPromise && !this.localStream) {
      try {
        await this.localMediaPromise;
      } catch (e) {}
    }

    if (this.isDestroyed || this.peers.has(peerId)) return;

    const pc = this._createPeerConnection(peerId);

    // If host has local media, add tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localStream);
        } catch (e) {}
      });
    }

    // Host creates and sends offer
    if (this.isHost) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);

        this.channel.sendSignal(peerId, {
          type: "offer",
          sdp: offer.sdp
        });
      } catch (err) {
        console.error(`[WebRTC] Failed to create offer for peer ${peerId}:`, err);
      }
    }
  }

  _createPeerConnection(peerId) {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peers.set(peerId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.channel.sendSignal(peerId, {
          type: "candidate",
          candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      this.onConnectionState(pc.iceConnectionState, peerId);
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC] Track (${event.track?.kind}) received from peer ${peerId}`);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(this.remoteStream, peerId);
      } else {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
        this.onRemoteStream(this.remoteStream, peerId);
      }
    };

    return pc;
  }

  async _handleOffer(signal, senderId) {
    let pc = this.peers.get(senderId);
    if (!pc) {
      pc = this._createPeerConnection(senderId);
    }

    // Resolve offer glare: if client is waiting for its own offer, rollback in favor of host offer
    if (pc.signalingState !== "stable") {
      if (!this.isHost && pc.signalingState === "have-local-offer") {
        try {
          await pc.setLocalDescription({ type: "rollback" });
        } catch (e) {}
      }
    }

    // Attach local stream tracks if available
    if (this.localStream) {
      const senders = pc.getSenders ? pc.getSenders() : [];
      this.localStream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
        if (!alreadyAdded && pc.addTrack) {
          try {
            pc.addTrack(track, this.localStream);
          } catch (e) {}
        }
      });
    }

    await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: signal.sdp }));

    // Flush any queued ICE candidates received prior to offer description
    const queuedOfferCandidates = this.candidateQueues.get(senderId) || [];
    for (const c of queuedOfferCandidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
    }
    this.candidateQueues.delete(senderId);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.channel.sendSignal(senderId, {
      type: "answer",
      sdp: answer.sdp
    });
  }

  async _handleAnswer(signal, senderId) {
    const pc = this.peers.get(senderId);
    if (!pc) return;
    if (pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: signal.sdp }));

      // Flush any queued ICE candidates received prior to answer description
      const queuedAnswerCandidates = this.candidateQueues.get(senderId) || [];
      for (const c of queuedAnswerCandidates) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
      }
      this.candidateQueues.delete(senderId);
    }
  }

  async _handleCandidate(signal, senderId) {
    const pc = this.peers.get(senderId);
    if (!pc) return;

    // If remote description is not yet set, queue candidate to avoid WebRTC exception
    if (!pc.remoteDescription || !pc.remoteDescription.type) {
      if (!this.candidateQueues.has(senderId)) {
        this.candidateQueues.set(senderId, []);
      }
      this.candidateQueues.get(senderId).push(signal.candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    } catch (e) {
      console.warn("[WebRTC] Could not add ICE candidate:", e);
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.unsubscribeSignal) {
      this.unsubscribeSignal();
    }

    this.peers.forEach((pc) => {
      try {
        pc.close();
      } catch (e) {}
    });
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.localStream = null;
    }
    this.remoteStream = null;
  }
}

export default WebRtcManager;

