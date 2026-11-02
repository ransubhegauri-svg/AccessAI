/**
 * AccessAI Two-Way Accessible Meeting Communication Service
 * Real-time messaging, WebRTC signaling & dynamic presence bus.
 * 
 * Supports:
 * - Multi-transport broadcast: BroadcastChannel (cross-tab) + localStorage fallback + Supabase Realtime
 * - WebRTC SDP & ICE candidate signaling
 * - Dynamic participant discovery and presence heartbeats
 * - Live speech-to-text broadcast (continuous teacher captions)
 * - Sign language & accessible keyboard chat
 */

import { supabase } from "./supabase";
import { Peer } from "peerjs";

const STORAGE_PREFIX = "accessai_meeting_msg_";

export class MeetingChannel {
  constructor(meetingId = "accessai-room-101", currentUser = null) {
    this.meetingId = meetingId;
    this.currentUser = currentUser || {
      id: `user-${Date.now().toString(36)}`,
      name: "Participant",
      mode: "student"
    };
    this.currentUserId = this.currentUser.id || this.currentUser.uid;

    this.subscribers = new Set();
    this.signalSubscribers = new Set();
    this.participantSubscribers = new Set();
    this.seenMessageIds = new Set();

    this.broadcastChannel = null;
    this.supabaseChannel = null;
    this.storageHandler = null;
    this.eventSource = null;
    this.signalingUrl = null;
    this.cloudWs = null;
    this.pingInterval = null;

    // Cross-Device Cloud Transport using PeerJS (guarantees cross-device WebRTC & presence across mobile and desktop)
    this.peer = null;
    this.activePeerConns = new Map();
    this.isPeerReady = false;
    this.peerRetryTimer = null;
    this.isDestroyed = false;

    this.safeRoom = String(this.meetingId || "accessai-room-402").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    this.hostPeerId = `accessai_room_${this.safeRoom}_teacher`;
    const isTeacher = this.currentUser.role === "teacher" || this.currentUser.mode === "teacher";
    this.isTeacher = isTeacher;
    this.peerId = isTeacher
      ? this.hostPeerId
      : `accessai_room_${this.safeRoom}_student_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Active participants mapped by ID
    this.participantsMap = new Map();

    // Register self
    const selfParticipant = {
      id: this.currentUserId,
      name: this.currentUser.displayName || this.currentUser.name || "Participant",
      mode: this.currentUser.mode || (this.currentUser.role === "teacher" ? "teacher" : "deaf_mute"),
      role: this.currentUser.role === "teacher" ? "Teacher / Host" : "Student Participant",
      status: "connected",
      isSelf: true,
      lastSeen: Date.now()
    };
    this.participantsMap.set(this.currentUserId, selfParticipant);

    this._initChannel();

    // Announce presence after channel mounts
    setTimeout(() => {
      this.announcePresence("joined");
      this.pingParticipants();
    }, 150);

    // Periodic heartbeat to guarantee peer discovery across devices/reloads
    if (typeof window !== "undefined") {
      this.pingInterval = setInterval(() => {
        this.pingParticipants();
      }, 4000);
      this._boundUnload = () => this.destroy();
      window.addEventListener("beforeunload", this._boundUnload);
    }
  }

  _initChannel() {
    // 1. Browser BroadcastChannel for instant zero-latency multi-tab sync
    if (typeof window !== "undefined" && window.BroadcastChannel) {
      try {
        this.broadcastChannel = new BroadcastChannel(`accessai_meeting_${this.meetingId}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            this._handleIncoming(event.data);
          }
        };
      } catch (err) {
        console.warn("[MeetingChannel] BroadcastChannel error:", err);
      }
    }

    // 2. Storage event fallback for cross-window sync
    if (typeof window !== "undefined") {
      this.storageHandler = (event) => {
        if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
          try {
            const data = JSON.parse(event.newValue);
            if (data && data.meetingId === this.meetingId) {
              this._handleIncoming(data);
            }
          } catch (e) {}
        }
      };
      window.addEventListener("storage", this.storageHandler);
    }

    // 3. Supabase Realtime broadcast channel
    try {
      if (supabase && supabase.channel) {
        this.supabaseChannel = supabase
          .channel(`meeting:${this.meetingId}`)
          .on("broadcast", { event: "message" }, (payload) => {
            if (payload && payload.payload) {
              this._handleIncoming(payload.payload);
            }
          })
          .subscribe();
      }
    } catch (e) {
      console.warn("[MeetingChannel] Supabase realtime channel skipped:", e);
    }

    // 4. Cloud PeerJS Data Transport (Guarantees Real-Time Cross-Device Connectivity without Rate Limits)
    this._initPeerCloud();

    // 5. Local Dev Network Transport via SSE Signaling Server (Port 5001)
    if (typeof window !== "undefined") {
      try {
        const isHttps = window.location.protocol === "https:";
        const host = window.location.hostname || "localhost";
        const port = process.env.REACT_APP_SIGNALING_PORT || 5001;
        const defaultUrl = `http://${host}:${port}`;
        const signalingUrl = process.env.REACT_APP_SIGNALING_URL || defaultUrl;
        this.signalingUrl = signalingUrl;

        // Never attempt plain http EventSource on https deployments (prevents Mixed Content blocks)
        const isMixedContent = isHttps && signalingUrl.startsWith("http:");

        if (typeof EventSource !== "undefined" && !isMixedContent) {
          const sseUrl = `${signalingUrl}/events?room=${encodeURIComponent(this.meetingId)}&userId=${encodeURIComponent(this.currentUserId)}`;
          this.eventSource = new EventSource(sseUrl);
          this.eventSource.onopen = () => {
            this.announcePresence("joined");
            this.pingParticipants();
          };
          this.eventSource.onmessage = (event) => {
            if (event && event.data) {
              try {
                const parsed = JSON.parse(event.data);
                if (parsed && parsed.messageType === "system_connected") {
                  this.announcePresence("joined");
                  this.pingParticipants();
                } else if (parsed && parsed.messageType) {
                  this._handleIncoming(parsed);
                }
              } catch (e) {}
            }
          };
          this.eventSource.onerror = () => {
            // Silently fall back to cloudWs, BroadcastChannel, and localStorage
          };
        }
      } catch (err) {
        console.warn("[MeetingChannel] Network signaling init skipped:", err);
      }
    }
  }

  _initPeerCloud() {
    if (typeof window === "undefined") return;
    const hasRTC = Boolean(window.RTCPeerConnection || window.webkitRTCPeerConnection);
    if (!hasRTC) return;

    try {
      const peer = new Peer(this.peerId, {
        host: "0.peerjs.com",
        secure: true,
        port: 443,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" }
          ]
        }
      });
      this.peer = peer;

      peer.on("open", (id) => {
        console.log(`[MeetingChannel] PeerJS cloud signaling ready: ${id}`);
        this.isPeerReady = true;
        if (!this.isTeacher) {
          this._connectPeerToHost();
        }
        this.announcePresence("joined");
        this.pingParticipants();
      });

      peer.on("connection", (conn) => {
        console.log(`[MeetingChannel] Incoming peer data connection from ${conn.peer}`);
        this._setupDataConnection(conn);
      });

      peer.on("error", (err) => {
        console.warn("[MeetingChannel] Peer error:", err?.type || err?.message);
        if (err?.type === "unavailable-id" && this.isTeacher) {
          console.warn("[MeetingChannel] Teacher host peer ID in use, retrying in 2s...");
          if (!this.isDestroyed) {
            try { peer.destroy(); } catch (e) {}
            clearTimeout(this.peerRetryTimer);
            this.peerRetryTimer = setTimeout(() => this._initPeerCloud(), 2000);
          }
        } else if (err?.type === "peer-unavailable" && !this.isTeacher) {
          if (!this.isDestroyed) {
            clearTimeout(this.peerRetryTimer);
            this.peerRetryTimer = setTimeout(() => this._connectPeerToHost(), 2000);
          }
        }
      });
    } catch (err) {
      console.warn("[MeetingChannel] PeerJS init error:", err);
    }
  }

  _connectPeerToHost() {
    if (!this.peer || this.peer.destroyed || this.isTeacher) return;
    if (this.activePeerConns.has(this.hostPeerId)) {
      const existing = this.activePeerConns.get(this.hostPeerId);
      if (existing && existing.open) return;
    }

    try {
      const conn = this.peer.connect(this.hostPeerId, { reliable: true });
      this._setupDataConnection(conn);
    } catch (err) {
      console.warn("[MeetingChannel] Connect to host error:", err);
    }
  }

  _setupDataConnection(conn) {
    if (!conn) return;
    this.activePeerConns.set(conn.peer, conn);

    const handleOpen = () => {
      console.log(`[MeetingChannel] DataConnection open with ${conn.peer}`);
      this.announcePresence("joined");
      this.pingParticipants();
    };

    if (conn.open) {
      handleOpen();
    } else {
      conn.on("open", handleOpen);
    }

    conn.on("data", (data) => {
      if (data && typeof data === "object") {
        this._handleIncoming(data);
      } else if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          this._handleIncoming(parsed);
        } catch (e) {}
      }
    });

    conn.on("close", () => {
      this.activePeerConns.delete(conn.peer);
      if (!this.isTeacher && !this.isDestroyed) {
        clearTimeout(this.peerRetryTimer);
        this.peerRetryTimer = setTimeout(() => this._connectPeerToHost(), 2000);
      }
    });

    conn.on("error", () => {
      this.activePeerConns.delete(conn.peer);
    });
  }

  _handleIncoming(msg) {
    if (!msg || !msg.messageType) return;
    const key = msg.id || `${msg.timestamp}_${msg.senderId}_${msg.messageType}_${msg.text || ""}`;
    if (this.seenMessageIds.has(key)) return;
    this.seenMessageIds.add(key);
    if (this.seenMessageIds.size > 250) {
      const first = this.seenMessageIds.values().next().value;
      this.seenMessageIds.delete(first);
    }

    const isFromSelf = msg.senderId === this.currentUserId;

    // 1. WebRTC Signaling Dispatch
    if (msg.messageType === "webrtc_signal") {
      if (!isFromSelf) {
        const isTarget = !msg.targetId || msg.targetId === "broadcast" || msg.targetId === this.currentUserId;
        if (isTarget) {
          this.signalSubscribers.forEach((cb) => {
            try {
              cb(msg.signal, msg.senderId, msg);
            } catch (err) {
              console.error("[MeetingChannel] Signal subscriber error:", err);
            }
          });
        }
      }
      return;
    }

    // 2. Dynamic Presence Handling
    if (msg.messageType === "presence_announce") {
      if (!isFromSelf && msg.participant) {
        this.participantsMap.set(msg.participant.id, {
          ...msg.participant,
          isSelf: false,
          lastSeen: Date.now()
        });
        this._notifyParticipants();

        // If newly joined, reply with our own presence pong
        if (msg.status === "joined") {
          this.announcePresence("present", msg.senderId);
        }
      }
      return;
    }

    if (msg.messageType === "presence_ping") {
      if (!isFromSelf) {
        this.announcePresence("present", msg.senderId);
      }
      return;
    }

    if (msg.messageType === "presence_leave") {
      if (!isFromSelf && msg.senderId) {
        this.participantsMap.delete(msg.senderId);
        this._notifyParticipants();
      }
      return;
    }

    // 3. Regular meeting messages (chat, speech_to_text, sign_to_text)
    this.subscribers.forEach((callback) => {
      try {
        callback(msg);
      } catch (err) {
        console.error("[MeetingChannel] Message subscriber error:", err);
      }
    });
  }

  _broadcast(message) {
    // 1. Direct PeerJS Cross-Device DataConnection Delivery (guarantees cross-device sync)
    if (this.activePeerConns && this.activePeerConns.size > 0) {
      this.activePeerConns.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send(message);
          } catch (e) {}
        }
      });
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {}
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, JSON.stringify(message));
      } catch (e) {}
    }

    // Local dev signaling server fallback (Skip if on https and signalingUrl is http)
    if (this.signalingUrl && typeof fetch !== "undefined") {
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const isMixed = isHttps && this.signalingUrl.startsWith("http:");
      if (!isMixed) {
        try {
          fetch(`${this.signalingUrl}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
          }).catch(() => {});
        } catch (e) {}
      }
    }

    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: "broadcast",
          event: "message",
          payload: message
        });
      } catch (e) {}
    }
  }

  /**
   * Broadcasts typed text from participant
   */
  sendTextMessage(text, extra = {}) {
    if (!text || !text.trim()) return null;

    const message = {
      id: `txt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      senderName: this.currentUser.displayName || this.currentUser.name || "Participant",
      senderMode: this.currentUser.mode || "deaf_mute",
      messageType: "text_message",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      ...extra
    };

    this._broadcast(message);
    this._handleIncoming(message);
    return message;
  }

  /**
   * Broadcasts gesture detection results
   */
  sendSignMessage(text, confidence = 0.95, extra = {}) {
    if (!text || !text.trim()) return null;

    const message = {
      id: `sgn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      senderName: this.currentUser.displayName || this.currentUser.name || "Deaf Participant",
      senderMode: "deaf_mute",
      messageType: "sign_to_text",
      text: text.trim(),
      confidence: Math.round(confidence * 100) / 100,
      timestamp: new Date().toISOString(),
      ...extra
    };

    this._broadcast(message);
    this._handleIncoming(message);
    return message;
  }

  /**
   * Broadcasts live speech-to-text captions (Teacher speaking)
   */
  sendSpeechCaption(text, isFinal = true, extra = {}) {
    if (!text || !text.trim()) return null;

    const message = {
      id: `stt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      senderName: this.currentUser.displayName || this.currentUser.name || "Instructor",
      senderMode: this.currentUser.mode || "teacher",
      messageType: "speech_to_text",
      text: text.trim(),
      isFinal,
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      ...extra
    };

    this._broadcast(message);
    this._handleIncoming(message);
    return message;
  }

  /**
   * Transmits WebRTC signaling messages (SDP offer, answer, ICE candidate)
   */
  sendSignal(targetId, signalData) {
    const message = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      senderName: this.currentUser.displayName || this.currentUser.name || "Participant",
      targetId: targetId || "broadcast",
      messageType: "webrtc_signal",
      signal: signalData,
      timestamp: new Date().toISOString()
    };

    this._broadcast(message);
  }

  /**
   * Announces or confirms user presence in room
   */
  announcePresence(status = "joined", targetId = null) {
    const myInfo = this.participantsMap.get(this.currentUserId);
    if (!myInfo) return;

    const message = {
      id: `prs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      targetId: targetId || "broadcast",
      messageType: "presence_announce",
      status,
      participant: myInfo,
      timestamp: new Date().toISOString()
    };

    this._broadcast(message);
  }

  pingParticipants() {
    const message = {
      id: `png-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: this.currentUserId,
      messageType: "presence_ping",
      timestamp: new Date().toISOString()
    };
    this._broadcast(message);
  }

  _notifyParticipants() {
    const list = this.getParticipants();
    this.participantSubscribers.forEach((cb) => {
      try {
        cb(list);
      } catch (e) {}
    });
  }

  /**
   * Simulates an incoming message for testing/demonstration
   */
  simulateHearingResponse(text = "Hello! I can hear your sign language clearly.") {
    const message = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      meetingId: this.meetingId,
      senderId: "partner-hearing-01",
      senderName: "Abled Participant",
      senderMode: "hearing",
      messageType: "speech_to_text",
      text,
      confidence: 0.98,
      timestamp: new Date().toISOString()
    };

    this._broadcast(message);
    this._handleIncoming(message);
    return message;
  }

  onMessage(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  onSignal(callback) {
    this.signalSubscribers.add(callback);
    return () => this.signalSubscribers.delete(callback);
  }

  onParticipantsChange(callback) {
    this.participantSubscribers.add(callback);
    // Emit initial list immediately
    callback(this.getParticipants());
    return () => this.participantSubscribers.delete(callback);
  }

  getParticipants() {
    // If only self, also supply the relay bot for accessibility status indicator
    const list = Array.from(this.participantsMap.values());
    const hasRelay = list.some((p) => p.id === "ai-interpreter-relay");
    if (!hasRelay) {
      list.push({
        id: "ai-interpreter-relay",
        name: "AccessAI Relay Bot",
        mode: "ai_relay",
        role: "Two-Way AI Interpreter",
        status: "active",
        isSelf: false
      });
    }
    return list;
  }

  destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Broadcast leave event
    try {
      const leaveMsg = {
        id: `lev-${Date.now()}`,
        meetingId: this.meetingId,
        senderId: this.currentUserId,
        messageType: "presence_leave",
        timestamp: new Date().toISOString()
      };
      this._broadcast(leaveMsg);
    } catch (e) {}

    this.isDestroyed = true;
    if (typeof window !== "undefined" && this._boundUnload) {
      window.removeEventListener("beforeunload", this._boundUnload);
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.peerRetryTimer) {
      clearTimeout(this.peerRetryTimer);
    }
    if (this.activePeerConns) {
      this.activePeerConns.forEach((conn) => {
        try { conn.close(); } catch (e) {}
      });
      this.activePeerConns.clear();
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (e) {}
    }
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }
    if (this.storageHandler && typeof window !== "undefined") {
      window.removeEventListener("storage", this.storageHandler);
    }
    if (this.supabaseChannel && supabase && supabase.removeChannel) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch (e) {}
    }
    this.subscribers.clear();
    this.signalSubscribers.clear();
    this.participantSubscribers.clear();
  }
}

export default MeetingChannel;
