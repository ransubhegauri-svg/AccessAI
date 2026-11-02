import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MeetingChannel } from "../services/meetingChannel";
import { WebRtcManager } from "../services/webrtcManager";
import { TeacherTranscriber } from "../services/teacherTranscriber";
import { SignLanguageMeetingEngine } from "../services/signLanguageMeetingEngine";
import { speechService } from "../services/speechSynthesisService";

export default function TeacherMeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const meetingId = roomId || "accessai-room-402";

  // Stream & Hardware States
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [captionsActive, setCaptionsActive] = useState(true);
  const [transcriberStatus, setTranscriberStatus] = useState("idle"); // idle | listening | error
  const [transcriberError, setTranscriberError] = useState(null);
  const [speechLanguage, setSpeechLanguage] = useState("en-IN");
  const [micVolume, setMicVolume] = useState(0);
  const [manualCaptionText, setManualCaptionText] = useState("");
  const [currentCaption, setCurrentCaption] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [ttsStudentAudio, setTtsStudentAudio] = useState(true);

  // Remote Student Stream & Two-Way Video Layout States
  const [remoteStudentStream, setRemoteStudentStream] = useState(null);
  const [remoteStudentActive, setRemoteStudentActive] = useState(false);
  const [videoLayout, setVideoLayout] = useState("split"); // 'split' | 'student_focus' | 'teacher_focus'
  const [latestStudentSign, setLatestStudentSign] = useState(null);
  const remoteStudentVideoRef = useRef(null);

  // Participants & Messages
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcementText, setAnnouncementText] = useState("");

  // Refs
  const localVideoRef = useRef(null);
  const channelRef = useRef(null);
  const webrtcRef = useRef(null);
  const transcriberRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioAnimRef = useRef(null);
  const gestureCanvasRef = useRef(null);
  const gestureEngineRef = useRef(null);

  const [gestureActive, setGestureActive] = useState(true);
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [gestureHoldProgress, setGestureHoldProgress] = useState(0);

  const teacherSessionId = useRef(
    `teacher-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  ).current;

  // Ensure remote student video stream is always attached to DOM element
  useEffect(() => {
    if (remoteStudentVideoRef.current && remoteStudentStream) {
      remoteStudentVideoRef.current.srcObject = remoteStudentStream;
      remoteStudentVideoRef.current.muted = true;
      remoteStudentVideoRef.current.play().catch(() => {});
    }
  }, [remoteStudentStream, remoteStudentActive, videoLayout]);

  const captionsActiveRef = useRef(captionsActive);
  useEffect(() => {
    captionsActiveRef.current = captionsActive;
  }, [captionsActive]);

  const ttsStudentAudioRef = useRef(ttsStudentAudio);
  useEffect(() => {
    ttsStudentAudioRef.current = ttsStudentAudio;
  }, [ttsStudentAudio]);

  const teacherName = user?.displayName || user?.user_metadata?.name || "Prof. Ananya Rao";

  useEffect(() => {
    // 1. Initialize Meeting Communication Channel
    const channel = new MeetingChannel(meetingId, {
      id: teacherSessionId,
      name: teacherName,
      role: "teacher",
      mode: "teacher"
    });
    channelRef.current = channel;

    // Listen for incoming messages from students (text, signs, quick responses)
    const unsubMsg = channel.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);

      // Pop up floating student sign overlay badge
      if (msg.messageType === "sign_to_text") {
        setLatestStudentSign(msg);
        setTimeout(() => setLatestStudentSign(null), 6000);
      }

      // Speak incoming student messages aloud for the teacher if enabled
      if (ttsStudentAudioRef.current && (msg.messageType === "text_message" || msg.messageType === "sign_to_text")) {
        speechService.speak(`${msg.senderName} says: ${msg.text}`);
      }
    });

    // Listen for signal events (such as camera_state updates)
    const unsubSignal = channel.onSignal((signalData) => {
      if (signalData && signalData.type === "camera_state") {
        setRemoteStudentActive(!!signalData.active);
      }
    });

    // Listen for dynamic participant presence changes
    const unsubPart = channel.onParticipantsChange((partList) => {
      setParticipants(partList);

      // Connect WebRTC to newly joined student peers
      partList.forEach((p) => {
        if (!p.isSelf && p.id !== "ai-interpreter-relay" && webrtcRef.current) {
          webrtcRef.current.connectToPeer(p.id);
        }
      });
    });

    // 2. Initialize Native WebRTC Video Broadcaster & Receiver
    const webrtc = new WebRtcManager({
      meetingChannel: channel,
      isHost: true,
      onRemoteStream: (stream, peerId) => {
        console.log(`[TeacherStudio] Remote student stream received from peer ${peerId}`);
        setRemoteStudentStream(stream);
        setRemoteStudentActive(true);
      },
      onConnectionState: (state, peerId) => {
        console.log(`[TeacherStudio] Peer ${peerId} connection state:`, state);
        if (state === "disconnected" || state === "failed" || state === "closed") {
          setRemoteStudentActive(false);
        }
      }
    });
    webrtcRef.current = webrtc;

    // Start local camera and mic
    webrtc.startLocalMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Live Audio Visualizer to verify real microphone sound decibels
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass && stream && stream.getAudioTracks().length > 0) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateVolume = () => {
              if (!audioContextRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const vol = Math.min(100, Math.round((avg / 40) * 100));
              setMicVolume(vol);
              audioAnimRef.current = requestAnimationFrame(updateVolume);
            };
            audioAnimRef.current = requestAnimationFrame(updateVolume);
          }
        } catch (audioErr) {
          console.warn("[TeacherStudio] Audio analyser setup error:", audioErr);
        }
      })
      .catch((err) => {
        console.warn("[TeacherStudio] Camera/Mic access warning:", err);
      });

    // 3. Initialize Teacher Continuous Speech Transcriber
    const transcriber = new TeacherTranscriber({
      language: speechLanguage,
      onCaption: (text, isFinal) => {
        setCurrentCaption(text);
        if (captionsActiveRef.current && channelRef.current) {
          channelRef.current.sendSpeechCaption(text, isFinal);
        }
      },
      onStateChange: (state, errorMsg) => {
        setTranscriberStatus(state);
        setTranscriberError(errorMsg);
      }
    });
    transcriberRef.current = transcriber;
    transcriber.start();

    return () => {
      unsubMsg();
      unsubSignal();
      unsubPart();
      if (audioAnimRef.current) {
        cancelAnimationFrame(audioAnimRef.current);
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e) {}
        audioContextRef.current = null;
      }
      channel.destroy();
      webrtc.destroy();
      transcriber.destroy();
    };
  }, [meetingId, teacherName, user]);

  // 4. Initialize MediaPipe Tasks-Vision Gesture Recognition on Teacher Video
  useEffect(() => {
    if (!cameraActive || !gestureActive) {
      if (gestureEngineRef.current) {
        gestureEngineRef.current.stopCamera();
      }
      setDetectedGesture(null);
      setGestureHoldProgress(0);
      return;
    }

    const engine = new SignLanguageMeetingEngine({
      onSignDetected: (data) => {
        if (data && data.gesture && data.gesture !== "None" && data.confidence >= 65) {
          setDetectedGesture(data);
        } else {
          setDetectedGesture(null);
        }
      },
      onSentenceUpdated: (phrase, vocab) => {
        const text = phrase || (vocab ? vocab.phrase : "");
        if (text) {
          setCurrentCaption(text);
          if (channelRef.current) {
            channelRef.current.sendSpeechCaption(text, true);
          }
        }
      },
      onHoldProgress: (percent) => {
        setGestureHoldProgress(percent);
      }
    });

    gestureEngineRef.current = engine;

    engine.initialize().then(() => {
      if (localVideoRef.current && gestureCanvasRef.current) {
        engine.attachExistingVideo(localVideoRef.current, gestureCanvasRef.current);
      }
    }).catch((err) => {
      console.warn("[TeacherStudio] MediaPipe GestureRecognizer init warning:", err);
    });

    return () => {
      if (engine) engine.stopCamera();
    };
  }, [cameraActive, gestureActive]);

  // Toggle Camera
  const handleToggleCamera = () => {
    const nextState = !cameraActive;
    setCameraActive(nextState);
    if (webrtcRef.current) {
      webrtcRef.current.toggleVideo(nextState);
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    const nextState = !micActive;
    setMicActive(nextState);
    if (webrtcRef.current) {
      webrtcRef.current.toggleAudio(nextState);
    }
    if (transcriberRef.current) {
      if (nextState) {
        transcriberRef.current.start();
      } else {
        transcriberRef.current.stop();
      }
    }
  };

  // Toggle MediaPipe Gesture Recognition
  const handleToggleGesture = () => {
    setGestureActive((prev) => !prev);
  };

  // Toggle Captions Broadcast
  const handleToggleCaptions = () => {
    const nextState = !captionsActive;
    setCaptionsActive(nextState);
    if (nextState && transcriberRef.current && micActive) {
      transcriberRef.current.start();
    }
  };

  // Copy student invite link
  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/meeting?room=${encodeURIComponent(meetingId)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Broadcast text announcement
  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim() || !channelRef.current) return;

    channelRef.current.sendTextMessage(announcementText.trim(), {
      isTeacherAnnouncement: true,
      senderMode: "teacher"
    });
    setAnnouncementText("");
  };

  const handleLanguageChange = (newLang) => {
    setSpeechLanguage(newLang);
    if (transcriberRef.current) {
      transcriberRef.current.setLanguage(newLang);
    }
  };

  const handleRestartTranscriber = () => {
    setTranscriberError(null);
    if (transcriberRef.current) {
      transcriberRef.current.restart();
    }
  };

  const handleBroadcastManualCaption = (textToBroadcast) => {
    const text = (typeof textToBroadcast === "string" ? textToBroadcast : manualCaptionText).trim();
    if (!text) return;
    setCurrentCaption(text);
    if (channelRef.current) {
      channelRef.current.sendSpeechCaption(text, true);
    }
    setManualCaptionText("");
  };

  const handleEndMeeting = () => {
    navigate("/teacher");
  };

  const studentParticipant = participants.find((p) => !p.isSelf && p.id !== "ai-interpreter-relay");
  const latestStudentMsg = messages.filter((m) => m.senderId !== (user?.uid || user?.id || "teacher-host")).slice(-1)[0];

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 font-sans flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="h-16 px-6 bg-[#0d162e] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined !text-xl">cast_for_education</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                Teacher Video Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Broadcast
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Room ID: <span className="text-sky-400">{meetingId}</span> • Host: {teacherName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyInviteLink}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy accessible link for Deaf/Mute students"
          >
            <span className="material-symbols-outlined !text-base">
              {copiedLink ? "check" : "link"}
            </span>
            <span>{copiedLink ? "Link Copied!" : "Copy Student Link"}</span>
          </button>

          <button
            onClick={handleEndMeeting}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined !text-base">call_end</span>
            <span>End Meeting</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Video Broadcast & Live Caption Preview (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {/* Stage Controls & Layout Selector Toolbar */}
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400 text-sm">video_camera_front</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Two-Way Meeting Visual Stage
              </span>
              {remoteStudentActive && remoteStudentStream ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Student Video Live</span>
                </span>
              ) : studentParticipant ? (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{studentParticipant.name} (Zero-Mic Mode)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for Student</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setVideoLayout("split")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  videoLayout === "split" ? "bg-sky-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
                title="Side-by-Side View (Both Teacher and Student)"
              >
                Side-by-Side (1:1)
              </button>
              <button
                type="button"
                onClick={() => setVideoLayout("student_focus")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  videoLayout === "student_focus" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
                title="Focus on Student Video"
              >
                Focus Student
              </button>
              <button
                type="button"
                onClick={() => setVideoLayout("teacher_focus")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  videoLayout === "teacher_focus" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
                title="Focus on Teacher Video"
              >
                Focus Teacher
              </button>
            </div>
          </div>

          {/* Dynamic Video Stage Container */}
          <div className={
            videoLayout === "split"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0"
              : "relative w-full aspect-video max-h-[460px] bg-black rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center shrink-0"
          }>
            {/* ── Tile 1: Teacher (You) Broadcast Video Feed ── */}
            <div className={
              videoLayout === "split"
                ? "relative w-full aspect-video max-h-[380px] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center shrink-0"
                : videoLayout === "teacher_focus"
                ? "w-full h-full relative flex items-center justify-center overflow-hidden"
                : "absolute bottom-3 right-3 w-48 aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/70 shadow-2xl z-30 flex items-center justify-center bg-black"
            }>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  cameraActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* MediaPipe 21-point Hand Skeleton Overlay Canvas */}
              <canvas
                ref={gestureCanvasRef}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transform -scale-x-100 ${
                  gestureActive && cameraActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* MediaPipe Active Gesture Recognition Floating Pill */}
              {detectedGesture && gestureActive && cameraActive && videoLayout !== "student_focus" && (
                <div className="absolute top-12 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/85 backdrop-blur-md border border-cyan-500/50 text-cyan-200 text-xs shadow-xl animate-fadeIn">
                  <span className="text-sm">{detectedGesture.metadata?.icon || "🖐️"}</span>
                  <span className="font-bold text-white text-[11px]">{detectedGesture.metadata?.label || detectedGesture.gesture}</span>
                  <span className="text-[9px] text-cyan-300 font-mono">({detectedGesture.confidence}%)</span>
                  {gestureHoldProgress > 0 && (
                    <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden ml-1 border border-cyan-500/30">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-75" style={{ width: `${gestureHoldProgress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined !text-2xl">videocam_off</span>
                  </div>
                  <p className="text-sm font-medium">Camera is turned off</p>
                </div>
              )}

              {/* Top overlay badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Teacher Broadcast (You) • Broadcasting to Students</span>
                </span>
                {gestureActive && videoLayout !== "student_focus" && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 backdrop-blur-md text-cyan-200 text-[10px] font-medium border border-cyan-400/20 hidden sm:flex items-center gap-1">
                    <span className="material-symbols-outlined !text-xs text-cyan-400">sign_language</span>
                    <span>MediaPipe</span>
                  </span>
                )}
              </div>

              {/* Teacher Bottom Controls Dock (Inside Teacher Tile) */}
              {videoLayout !== "student_focus" && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl z-20">
                  <button
                    onClick={handleToggleMic}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      micActive ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white hover:bg-rose-500"
                    }`}
                    title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    <span className="material-symbols-outlined !text-lg">
                      {micActive ? "mic" : "mic_off"}
                    </span>
                  </button>

                  {/* Real-time Microphone Decibel Visualizer */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 border border-slate-700/60" title={`Mic input volume: ${micVolume}%`}>
                    <div className="flex items-end gap-0.5 h-3 w-8">
                      <span className={`w-1 rounded-xs transition-all duration-75 ${micVolume > 5 ? "bg-emerald-400 h-2" : "bg-slate-600 h-1"}`} />
                      <span className={`w-1 rounded-xs transition-all duration-75 ${micVolume > 20 ? "bg-emerald-400 h-2.5" : "bg-slate-600 h-1"}`} />
                      <span className={`w-1 rounded-xs transition-all duration-75 ${micVolume > 40 ? "bg-emerald-400 h-3" : "bg-slate-600 h-1"}`} />
                      <span className={`w-1 rounded-xs transition-all duration-75 ${micVolume > 65 ? "bg-amber-400 h-3" : "bg-slate-600 h-1"}`} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-300 min-w-[20px]">{`${micVolume}%`}</span>
                  </div>

                  <button
                    onClick={handleToggleCamera}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      cameraActive ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white hover:bg-rose-500"
                    }`}
                    title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    <span className="material-symbols-outlined !text-lg">
                      {cameraActive ? "videocam" : "videocam_off"}
                    </span>
                  </button>

                  <button
                    onClick={handleToggleCaptions}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      captionsActive ? "bg-sky-600 text-white hover:bg-sky-500" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                    title={captionsActive ? "Disable Live Captions" : "Enable Live Captions"}
                  >
                    <span className="material-symbols-outlined !text-lg">closed_caption</span>
                  </button>

                  <button
                    onClick={handleToggleGesture}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      gestureActive ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-md" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                    title={gestureActive ? "Disable MediaPipe Gestures" : "Enable MediaPipe Gestures"}
                  >
                    <span className="material-symbols-outlined !text-lg">sign_language</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Tile 2: Student Live Video Feed & Presence Card ── */}
            <div className={
              videoLayout === "split"
                ? "relative w-full aspect-video max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center shrink-0"
                : videoLayout === "student_focus"
                ? "w-full h-full relative flex items-center justify-center overflow-hidden"
                : "absolute bottom-3 right-3 w-48 aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/70 shadow-2xl z-30 flex items-center justify-center bg-slate-950"
            }>
              <video
                ref={remoteStudentVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  remoteStudentActive && remoteStudentStream ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                }`}
              />

              {/* Status Header Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${remoteStudentActive ? "bg-emerald-400 animate-pulse" : studentParticipant ? "bg-sky-400" : "bg-amber-400"}`} />
                  <span>Remote Student: {studentParticipant?.name || "Student Participant"} (Live WebRTC P2P)</span>
                </span>
                {remoteStudentActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="material-symbols-outlined !text-xs">sign_language</span>
                    <span>Live ASL Video</span>
                  </span>
                )}
              </div>

              {/* Live Student Sign Overlay Badge */}
              {latestStudentSign && remoteStudentActive && (
                <div className="absolute bottom-3 left-3 right-3 z-30 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined !text-sm text-cyan-400">sign_language</span>
                    <span>Student Sign: &quot;{latestStudentSign.text}&quot;</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                    {Math.round((latestStudentSign.confidence || 0.95) * 100)}%
                  </span>
                </div>
              )}

              {/* If Student Video is NOT streaming: Show Accessible Presence Card or Waiting State */}
              {(!remoteStudentActive || !remoteStudentStream) && (
                <div className="flex flex-col items-center justify-center p-6 text-center gap-3 w-full h-full bg-radial from-slate-900 to-slate-950">
                  {studentParticipant ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl text-indigo-400 shadow-lg">
                        🤟
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                          <span>{studentParticipant.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-mono">Connected</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
                          Zero-Mic Accessibility Mode • Student camera currently off
                        </p>
                      </div>

                      {latestStudentMsg ? (
                        <div className="w-full max-w-xs p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-left flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm text-sky-400 mt-0.5">chat_bubble</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-400 block truncate">Latest student response:</span>
                            <span className="text-xs text-white font-medium block truncate">"{latestStudentMsg.text}"</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Student communicates using real-time text and voluntary ASL camera signs.
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined !text-xl text-amber-400 animate-pulse">hourglass_top</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Waiting for Student to Join</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                          Share this meeting room link with your student to start two-way video:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined !text-sm">content_copy</span>
                        <span>{copiedLink ? "Link Copied!" : "Copy Student Join Link"}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Persistent Controls Dock when in student_focus layout */}
            {videoLayout === "student_focus" && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl z-40">
                <button
                  onClick={handleToggleMic}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    micActive ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white hover:bg-rose-500"
                  }`}
                  title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                >
                  <span className="material-symbols-outlined !text-lg">
                    {micActive ? "mic" : "mic_off"}
                  </span>
                </button>
                <button
                  onClick={handleToggleCamera}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    cameraActive ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-rose-600 text-white hover:bg-rose-500"
                  }`}
                  title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                >
                  <span className="material-symbols-outlined !text-lg">
                    {cameraActive ? "videocam" : "videocam_off"}
                  </span>
                </button>
                <button
                  onClick={handleToggleCaptions}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    captionsActive ? "bg-sky-600 text-white hover:bg-sky-500" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                  title={captionsActive ? "Disable Live Captions" : "Enable Live Captions"}
                >
                  <span className="material-symbols-outlined !text-lg">closed_caption</span>
                </button>
                <button
                  onClick={handleToggleGesture}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    gestureActive ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-md" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                  title={gestureActive ? "Disable MediaPipe Gestures" : "Enable MediaPipe Gestures"}
                >
                  <span className="material-symbols-outlined !text-lg">sign_language</span>
                </button>
              </div>
            )}
          </div>

          {/* Teacher Real-Time Caption Bar */}
          <div className="bg-[#0d162e] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-base text-sky-400">record_voice_over</span>
                <span>Live Speech-to-Text Transcription for Deaf Participants</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Language / Dialect Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-[10px]">
                  {[
                    { id: "en-IN", label: "English (India)" },
                    { id: "en-US", label: "English (US)" },
                    { id: "hi-IN", label: "हिंदी (Hindi)" }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleLanguageChange(l.id)}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        speechLanguage === l.id
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  transcriberStatus === "listening"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : transcriberStatus === "error"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {transcriberStatus === "listening" ? "Listening & Capturing" : transcriberStatus === "error" ? "Speech Error" : "Idle"}
                </span>

                <button
                  type="button"
                  onClick={handleRestartTranscriber}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Restart speech recognition engine"
                >
                  <span className="material-symbols-outlined !text-sm">refresh</span>
                </button>
              </div>
            </div>

            {/* Error diagnostic warning if speech recognition service encounters issues */}
            {transcriberError && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined !text-base text-amber-400 shrink-0">warning</span>
                  <span className="truncate">{transcriberError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRestartTranscriber}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reconnect Mic
                </button>
              </div>
            )}

            {/* Live Caption Display */}
            <div className="min-h-[44px] bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-sm text-slate-200 font-medium leading-relaxed flex items-center justify-between gap-3">
              <div className="flex-1">
                {currentCaption ? (
                  <span className="text-white font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
                    <span>{currentCaption}</span>
                  </span>
                ) : (
                  <span className="text-slate-500 italic">
                    Start speaking into your microphone to generate live real-time captions for students...
                  </span>
                )}
              </div>
              {currentCaption && (
                <button
                  type="button"
                  onClick={() => setCurrentCaption("")}
                  className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                  title="Clear caption"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Lecture Signs & Manual Caption Broadcaster */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quick Lecture Signs:</span>
                {[
                  { text: "Hello class, welcome!", sign: "wave" },
                  { text: "Yes, exactly right!", sign: "thumbs_up" },
                  { text: "No, let's review this.", sign: "no" },
                  { text: "Does anyone need help?", sign: "help" },
                  { text: "Thank you for your answer.", sign: "thank_you" },
                  { text: "I have a question for you.", sign: "pointing_up" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBroadcastManualCaption(item.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-sky-900/50 border border-slate-700/60 hover:border-sky-500/40 text-[11px] text-slate-300 hover:text-sky-200 transition-all cursor-pointer"
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBroadcastManualCaption();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualCaptionText}
                  onChange={(e) => setManualCaptionText(e.target.value)}
                  placeholder="Type speech or lecture words to broadcast as live captions to students..."
                  className="flex-1 bg-slate-900/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!manualCaptionText.trim()}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined !text-sm">send</span>
                  <span>Broadcast Caption</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Student Presence & Interaction Stream */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Participants Card */}
          <div className="bg-[#0d162e] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined !text-base text-sky-400">group</span>
                <span>Connected Participants ({participants.length})</span>
              </h2>
              <span className="text-[11px] text-slate-500">Live P2P</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">
                      {p.name} {p.isSelf && "(You)"}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {p.role || p.mode}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Incoming Responses & Chat Stream */}
          <div className="flex-1 bg-[#0d162e] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-0 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined !text-base text-emerald-400">chat</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Student Responses & Inquiries
                </span>
              </div>
              <button
                onClick={() => setTtsStudentAudio(!ttsStudentAudio)}
                className={`text-[10px] px-2 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  ttsStudentAudio
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
                title="Automatically speak incoming student text aloud"
              >
                <span className="material-symbols-outlined !text-xs">
                  {ttsStudentAudio ? "volume_up" : "volume_off"}
                </span>
                <span>TTS Speech</span>
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <span className="material-symbols-outlined !text-3xl mb-1 text-slate-600">forum</span>
                  <p className="text-xs">No student messages yet.</p>
                  <p className="text-[11px] text-slate-600">Student questions, quick replies, and sign detections will appear here.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 ${
                      msg.senderId === user?.id || msg.senderId === user?.uid
                        ? "bg-sky-950/40 border-sky-800/50 text-sky-200"
                        : "bg-slate-900/80 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="font-medium text-slate-100">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Announcement Input */}
            <form onSubmit={handleSendAnnouncement} className="flex gap-2 pt-2 border-t border-slate-800/80">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Broadcast note to student screens..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition-all"
              />
              <button
                type="submit"
                disabled={!announcementText.trim()}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined !text-sm">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

