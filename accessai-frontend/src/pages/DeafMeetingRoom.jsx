import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SignLanguageMeetingEngine, MEETING_SIGN_VOCABULARY } from "../services/signLanguageMeetingEngine";
import { MeetingChannel } from "../services/meetingChannel";
import { WebRtcManager } from "../services/webrtcManager";
import { speechService } from "../services/speechSynthesisService";
import API from "../services/api";
import MekoContextInspector from "../components/MekoContextInspector";
import MekoService from "../services/meko";

// ── Mandatory Quick Response Phrases (Developer 1 Specification) ──
const QUICK_RESPONSES = [
  { id: "qr-yes", text: "Yes", icon: "check_circle", color: "hover:bg-emerald-50 text-emerald-700 border-emerald-200 bg-white" },
  { id: "qr-no", text: "No", icon: "cancel", color: "hover:bg-rose-50 text-rose-700 border-rose-200 bg-white" },
  { id: "qr-agree", text: "I agree", icon: "thumb_up", color: "hover:bg-sky-50 text-sky-700 border-sky-200 bg-white" },
  { id: "qr-disagree", text: "I disagree", icon: "thumb_down", color: "hover:bg-amber-50 text-amber-700 border-amber-200 bg-white" },
  { id: "qr-repeat", text: "Please repeat", icon: "replay", color: "hover:bg-purple-50 text-purple-700 border-purple-200 bg-white" },
  { id: "qr-question", text: "I have a question", icon: "help", color: "hover:bg-indigo-50 text-indigo-700 border-indigo-200 bg-white" },
  { id: "qr-help", text: "I need help", icon: "sos", color: "hover:bg-red-50 text-red-700 border-red-200 bg-white" },
  { id: "qr-thanks", text: "Thank you", icon: "volunteer_activism", color: "hover:bg-teal-50 text-teal-700 border-teal-200 bg-white" }
];

export default function DeafMeetingRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ── Meeting Entry & Authorization State (Join-Only) ──
  const [isJoined, setIsJoined] = useState(false);
  const [meetingInputId, setMeetingInputId] = useState("accessai-room-402");
  const [studentName, setStudentName] = useState(user?.displayName || "Deaf Student");
  const [meetingInfo, setMeetingInfo] = useState({
    title: "Inclusive Interactive Meeting",
    host: "Prof. Harrison (Hearing Participant)"
  });
  const [joinError, setJoinError] = useState(null);

  // ── Accessibility Controls (Section 6) ──
  const [fontSize, setFontSize] = useState("normal"); // 'normal' | 'large' | 'xlarge'
  const [highContrast, setHighContrast] = useState(false);

  // ── Meeting Room Connection ──
  const [meetingId, setMeetingId] = useState("accessai-room-402");
  const [isConnected, setIsConnected] = useState(true);
  const [participants, setParticipants] = useState([]);

  // ── Remote Teacher Video Stream & WebRTC (Two-Way Video Calling) ──
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);
  const [isTeacherAudioMuted, setIsTeacherAudioMuted] = useState(true);
  const [videoLayoutMode, setVideoLayoutMode] = useState("split"); // 'split' | 'teacher_focus' | 'student_focus'
  const remoteVideoRef = useRef(null);
  const webrtcRef = useRef(null);

  // ── Incoming Live Captions (Section 5) ──
  const [liveCaption, setLiveCaption] = useState({
    speaker: "AccessAI Relay Bot",
    text: "Welcome to the inclusive meeting. Captions and two-way video calling are active.",
    active: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // ── Voluntary Student Camera & Sign Language Detection (Section 2) ──
  // Camera permission is 100% voluntary, default OFF on join, with text as the primary fallback.
  // Microphone is NEVER requested or used.
  const [cameraActive, setCameraActive] = useState(false);
  const [joinWithCamera, setJoinWithCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectedSign, setDetectedSign] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [unclearWarning, setUnclearWarning] = useState(null);

  // ── Text Communication & Sentence Assembly (Section 3 & 4) ──
  const [messageText, setMessageText] = useState("");
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── Conversation Transcript Stream (Section 7) ──
  const [messages, setMessages] = useState([
    {
      id: "sys-0",
      meetingId: "accessai-room-402",
      senderId: "system",
      senderName: "AccessAI Relay Bot",
      senderMode: "ai_relay",
      messageType: "system",
      text: "Two-Way Accessible Meeting initialized. Deaf/Mute students participate freely via text, quick responses, or optional sign language. No microphone required.",
      timestamp: new Date().toISOString()
    }
  ]);

  const studentSessionId = useRef(
    `student-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
  ).current;

  // DOM & Media Stream Refs
  const localStreamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const channelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  // Parse URL query parameter for direct room join
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomParam = params.get("room") || params.get("meetingId");
    if (roomParam) {
      setMeetingInputId(roomParam);
      setMeetingId(roomParam);
      setMeetingInfo({
        title: `Inclusive Meeting (${roomParam})`,
        host: "Prof. Ananya Rao (Teacher / Host)"
      });
      setIsJoined(true);
    }
  }, [location.search]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveCaption]);

  // Ensure remote teacher video stream is always attached & playing on DOM element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = true; // Essential to comply with browser autoplay policy
      remoteVideoRef.current.play().catch((e) => {
        console.warn("[StudentRoom] Remote video play warning:", e);
      });
    }
  }, [remoteStream, remoteVideoActive, videoLayoutMode]);

  // ── 1. Backend Role Authorization & Joining Meeting (Section 1) ──
  const handleJoinMeeting = (e) => {
    if (e) e.preventDefault();
    setJoinError(null);
    const targetRoom = meetingInputId.trim() || "accessai-room-402";

    setMeetingId(targetRoom);
    setMeetingInfo({
      title: `Inclusive Meeting (${targetRoom})`,
      host: "Prof. Ananya Rao (Teacher / Host)"
    });
    setIsJoined(true);
  };

  // ── 2. Initialize Real-Time Meeting Channel & WebRTC Receiver ──
  useEffect(() => {
    if (!isJoined) return;

    const channel = new MeetingChannel(meetingId, {
      id: studentSessionId,
      name: studentName.trim() || user?.displayName || "Deaf Student",
      role: "student",
      mode: "deaf_mute"
    });
    channelRef.current = channel;
    setParticipants(channel.getParticipants());
    setIsConnected(true);

    // Listen for dynamic participants change
    const unsubPart = channel.onParticipantsChange((list) => {
      setParticipants(list);
    });

    // Initialize WebRTC Receiver for incoming Teacher Video
    const webrtc = new WebRtcManager({
      meetingChannel: channel,
      isHost: false,
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
        setRemoteVideoActive(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      },
      onConnectionState: (state) => {
        if (state === "disconnected" || state === "failed" || state === "closed") {
          setRemoteVideoActive(false);
        }
      }
    });
    webrtcRef.current = webrtc;

    // Subscribe to incoming messages (from Teacher, Hearing participant, AI relay, or self)
    const unsubscribe = channel.onMessage((incomingMsg) => {
      setMessages((prev) => [...prev, incomingMsg]);

      // When Teacher or Hearing participant speaks or gestures (Section 5):
      if (
        incomingMsg.senderMode === "hearing" ||
        incomingMsg.senderMode === "teacher" ||
        incomingMsg.messageType === "speech_to_text" ||
        incomingMsg.messageType === "sign_to_text" ||
        incomingMsg.isTeacherAnnouncement
      ) {
        // Update Live Speech-to-Text Captions
        setLiveCaption({
          speaker: incomingMsg.senderName || (incomingMsg.senderMode === "teacher" ? "Instructor" : "Hearing Participant"),
          text: incomingMsg.text,
          active: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    // Listen to Speech Synthesis events
    const unsubSpeaking = speechService.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });

    return () => {
      unsubscribe();
      unsubPart();
      unsubSpeaking();
      webrtc.destroy();
      channel.destroy();
    };
  }, [isJoined, meetingId, user, studentName]);

  // ── 3. Voluntary Student Camera & Sign Detection Pipeline (Section 2) ──
  // Camera is 100% voluntary. Microphone is NEVER requested or used.

  const stopStudentCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Track stop error:", e);
        }
      });
      localStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (engineRef.current) {
      engineRef.current.stopCamera();
    }
    if (webrtcRef.current) {
      webrtcRef.current.removeLocalStream();
    }
    if (channelRef.current) {
      channelRef.current.sendSignal("broadcast", {
        type: "camera_state",
        active: false,
        studentName: studentName.trim() || user?.displayName || "Deaf Student"
      });
    }
    setDetectedSign(null);
    setHoldProgress(0);
    setUnclearWarning(null);
    setCameraActive(false);
  }, [studentName, user?.displayName]);

  const startStudentCamera = useCallback(async () => {
    setCameraError(null);

    // Verify browser media devices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        type: "UnsupportedBrowser",
        title: "Camera Unsupported",
        desc: "Your browser environment does not support webcam access in this context. You can participate 100% via text.",
        canRetry: false
      });
      return;
    }

    try {
      // 1. Request camera ONLY (audio is strictly false: Zero-Mic Contract)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      localStreamRef.current = stream;

      // 2. Attach live stream to the student video element and call play()
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("[StudentRoom] Video play warning (handled):", playErr);
        }
      }

      setCameraActive(true);
      setCameraError(null);

      // 3. Broadcast stream to Teacher over WebRTC
      if (webrtcRef.current) {
        await webrtcRef.current.addLocalStream(stream);
      }
      if (channelRef.current) {
        channelRef.current.sendSignal("broadcast", {
          type: "camera_state",
          active: true,
          studentName: studentName.trim() || user?.displayName || "Deaf Student"
        });
      }

      // 4. Feed the same live video element to the MediaPipe engine without a second pipeline
      try {
        if (!engineRef.current) {
          engineRef.current = new SignLanguageMeetingEngine({
            onSignDetected: (data) => setDetectedSign(data),
            onSentenceUpdated: (fullText) => {
              setMessageText((prev) => (!prev.trim() ? fullText : prev + " " + fullText));
            },
            onHoldProgress: (percent) => setHoldProgress(percent),
            onUnclearGesture: (warning) => {
              setUnclearWarning(warning);
              setTimeout(() => setUnclearWarning(null), 3000);
            }
          });
        }

        if (!engineRef.current.recognizer) {
          await engineRef.current.initialize();
        }

        if (videoRef.current && canvasRef.current && localStreamRef.current) {
          engineRef.current.attachExistingVideo(videoRef.current, canvasRef.current);
        }
      } catch (mpErr) {
        console.warn("[StudentRoom] MediaPipe gesture recognition notice (stream active):", mpErr);
      }
    } catch (err) {
      console.error("[StudentRoom] Camera access error:", err);
      stopStudentCamera();

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError({
          type: "NotAllowedError",
          title: "Camera Permission Denied",
          desc: "Please allow camera access in your browser or iframe settings to share your video signs.",
          canRetry: true
        });
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError({
          type: "NotFoundError",
          title: "No Camera Found",
          desc: "No connected webcam was detected on this device. You can participate 100% via text.",
          canRetry: true
        });
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError({
          type: "NotReadableError",
          title: "Camera in Use",
          desc: "Another application or browser tab is using your webcam. Please close it and try again.",
          canRetry: true
        });
      } else {
        setCameraError({
          type: "GeneralError",
          title: "Camera Unavailable",
          desc: err.message || "An unexpected error occurred while starting the camera.",
          canRetry: true
        });
      }
    }
  }, [stopStudentCamera, studentName, user?.displayName]);

  // Voluntary Camera Toggle Handler
  const handleToggleCamera = () => {
    if (cameraActive || localStreamRef.current) {
      stopStudentCamera();
    } else {
      startStudentCamera();
    }
  };

  // If user enabled "Join with Camera Enabled" on join screen, start camera after entering room
  useEffect(() => {
    if (isJoined && joinWithCamera && !localStreamRef.current) {
      startStudentCamera();
    }
  }, [isJoined, joinWithCamera, startStudentCamera]);

  // Clean up student camera when component unmounts
  useEffect(() => {
    return () => {
      stopStudentCamera();
    };
  }, [stopStudentCamera]);

  // ── 4. Send Message (Text or Sign) to Hearing Participants (Section 3 & 4) ──
  const handleSendMessage = (textToSend = null, customType = null) => {
    const finalContent = (textToSend !== null ? textToSend : messageText).trim();
    if (!finalContent || !channelRef.current) return;

    const messageType = customType || (cameraActive && detectedSign ? "sign_to_text" : "text_message");

    // 1. Broadcast over shared real-time meeting channel (Developer 2 sync)
    if (messageType === "sign_to_text") {
      channelRef.current.sendSignMessage(finalContent, detectedSign?.confidence ? detectedSign.confidence / 100 : 0.95);
    } else {
      channelRef.current.sendTextMessage(finalContent);
    }

    // 2. Synthesize finalized speech for hearing participants (Section 4)
    if (!isSpeechMuted) {
      speechService.speak(finalContent);
    }

    // Feature 2: Log meeting dialogue & friction into Meko persistent memory
    if (finalContent === "I need help" || finalContent === "Please repeat") {
      MekoService.logFriction(
        "deaf_mute",
        "Live Meeting",
        "clarification_request",
        `Student requested live clarification in meeting: "${finalContent}"`
      );
    }
    MekoService.writeMemory("accessai-runtime", `[Meeting Exchange - Deaf Mode]: ${finalContent}`, "meeting_dialogue");

    // 3. Clear message composer
    setMessageText("");
    textInputRef.current?.focus();
  };

  // Quick Response Handler
  const handleQuickResponse = (qrText) => {
    // Immediate send or insert
    handleSendMessage(qrText, "text_message");
  };

  // Replay Message with Live Captions & TTS
  const handleReplayMessage = (msg) => {
    // 1. Synchronize Live Captions
    setLiveCaption({
      speaker: msg.senderName || "Replay",
      text: msg.text,
      active: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // 2. Optional TTS replay
    if (!isSpeechMuted) {
      speechService.speak(msg.text);
    }
  };

  // Simulate Hearing Participant Speech (Developer 2 Test Helper)
  const handleSimulateHearingSpeech = () => {
    const sampleHearingLines = [
      "Hello! Welcome to our inclusive session. I can see your messages clearly.",
      "That is a great question. Let's look at slide 4 together.",
      "I completely agree with your proposal. Let us proceed with that plan.",
      "Could you please clarify your feedback on the project assignment?",
      "Thank you everyone for collaborating seamlessly today!"
    ];
    const pickedLine = sampleHearingLines[Math.floor(Math.random() * sampleHearingLines.length)];
    if (channelRef.current) {
      channelRef.current.simulateHearingResponse(pickedLine);
    }
  };

  // Toggle Text-to-Speech Mute
  const handleToggleSpeechMute = () => {
    const nextMuted = !isSpeechMuted;
    setIsSpeechMuted(nextMuted);
    speechService.setMuted(nextMuted);
  };

  // Leave Meeting (Return to Join Screen)
  const handleLeaveMeeting = () => {
    stopStudentCamera();
    setIsJoined(false);
  };

  // ── Dynamic Typography & High-Contrast Classes (Section 6) ──
  const fontSizes = {
    normal: {
      text: "text-sm",
      heading: "text-base",
      captions: "text-base",
      input: "text-base"
    },
    large: {
      text: "text-base",
      heading: "text-lg",
      captions: "text-lg font-medium",
      input: "text-lg"
    },
    xlarge: {
      text: "text-lg",
      heading: "text-xl",
      captions: "text-xl font-bold",
      input: "text-xl"
    }
  };

  const currentFont = fontSizes[fontSize] || fontSizes.normal;

  const themeClasses = highContrast
    ? {
        bg: "bg-black text-white",
        panel: "bg-black border-2 border-yellow-400 text-white",
        header: "bg-black border-b-2 border-yellow-400 text-yellow-300",
        accent: "text-yellow-400",
        btnPrimary: "bg-yellow-400 text-black font-extrabold hover:bg-yellow-300 border-2 border-yellow-500",
        btnSecondary: "bg-neutral-900 text-yellow-300 border-2 border-yellow-400 hover:bg-neutral-800",
        badge: "bg-yellow-400 text-black font-black border border-yellow-500",
        input: "bg-black border-2 border-yellow-400 text-yellow-300 placeholder-yellow-600 focus:ring-2 focus:ring-yellow-400",
        chip: "bg-neutral-900 border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black font-bold",
        title: "text-yellow-300",
        subtext: "text-yellow-200/80"
      }
    : {
        bg: "bg-[#F9FBFE] text-slate-900",
        panel: "bg-white border border-sky-100 text-slate-800 shadow-[0_10px_35px_-10px_rgba(16,38,92,0.06)]",
        header: "bg-white/95 border-b border-[#E2EDF8] text-[#10265C] shadow-2xs",
        accent: "text-[#0866F5]",
        btnPrimary: "bg-[#0866F5] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20",
        btnSecondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold shadow-2xs",
        badge: "bg-[#E8F5FF] text-[#0284C7] border border-[#BAE6FD] font-bold",
        input: "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0866F5] focus:ring-2 focus:ring-blue-100 shadow-2xs",
        chip: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs",
        title: "text-[#10265C]",
        subtext: "text-slate-500"
      };

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 1: JOIN-ONLY SCREEN (Design Reference Matched)
  // Strictly presents "Join Meeting" only. No Create, Host, or Schedule options!
  // ══════════════════════════════════════════════════════════════════════
  if (!isJoined) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} font-sans flex flex-col justify-between selection:bg-blue-100 relative overflow-hidden`}>
        {/* Subtle Ambient Background Accents */}
        <div className="absolute top-1/4 -left-36 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-36 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Minimal Navigation */}
        <header className="h-16 border-b border-[#E2EDF8] px-6 flex items-center justify-between bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/deaf")}>
            <div className="w-9 h-9 rounded-xl bg-[#0866F5] text-white flex items-center justify-center text-sm font-black shadow-md shadow-blue-500/20">
              AI
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-[#10265C] tracking-tight">AccessAI</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0866F5] border border-sky-200/80 px-2.5 py-0.5 rounded-full">
                Accessible Meeting Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
                highContrast ? "bg-yellow-400 text-black border-yellow-500" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              title="Toggle High Contrast Mode"
            >
              Contrast: {highContrast ? "High" : "Standard"} ▾
            </button>
            <button
              onClick={() => navigate("/deaf")}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </header>

        {/* Center Join Card */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-6 z-10">
          <div className="max-w-xl w-full p-7 md:p-8 rounded-3xl bg-white border border-sky-100 shadow-[0_12px_45px_-12px_rgba(16,38,92,0.08)] flex flex-col gap-5 relative">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#E8F5FF] text-[#0284C7] border border-[#BAE6FD] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <span className="material-symbols-outlined !text-sm">badge</span>
                <span>Student Mode • Join Only</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-3 text-[#10265C]">
                Join Accessible Meeting
              </h1>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Enter your meeting ID or paste the meeting link to join. Communicate naturally using high-visibility text, quick responses, live captions, and two-way video calling.
              </p>
            </div>

            {/* Accessibility Reassurance Banner (Exact Design Reference) */}
            <div className="p-4 rounded-2xl bg-[#ECF7FF] border border-[#BAE6FD] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#0369A1] text-xs font-bold">
                <span className="material-symbols-outlined !text-base text-[#0284C7]">check_circle</span>
                <span>Zero Mandatory Permissions Promise</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li><strong className="text-slate-800">Microphone is NEVER required</strong> or requested for your session.</li>
                <li><strong className="text-slate-800">Camera is 100% voluntary</strong>. You can participate entirely through text.</li>
                <li>Full real-time speech-to-text captions and two-way video calling included.</li>
              </ul>
            </div>

            {/* Join Form */}
            <form onSubmit={handleJoinMeeting} className="flex flex-col gap-4">
              {joinError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{joinError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Meeting ID or Link</span>
                  <span className="text-[11px] text-slate-400 font-normal">Format: accessai-room-402</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg select-none">
                    #
                  </span>
                  <input
                    type="text"
                    value={meetingInputId}
                    onChange={(e) => setMeetingInputId(e.target.value)}
                    placeholder="accessai-room-402"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-semibold transition-all outline-none focus:border-[#0866F5] focus:ring-2 focus:ring-blue-100 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Your Display Name (In Meeting)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                    badge
                  </span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g., Deaf Student or Vrusha"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-semibold transition-all outline-none focus:border-[#0866F5] focus:ring-2 focus:ring-blue-100 shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Preference Row: Font Size & Speech Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-700">Meeting Font Size</span>
                  <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
                    {[
                      { id: "normal", label: "A" },
                      { id: "large", label: "A+" },
                      { id: "xlarge", label: "A++" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontSize(f.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          fontSize === f.id
                            ? "bg-[#0866F5] text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:text-slate-900"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-700">Speech for Others (TTS)</span>
                  <button
                    type="button"
                    onClick={handleToggleSpeechMute}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      !isSpeechMuted
                        ? "bg-[#F0F7FF] border-sky-200 text-[#0284C7] hover:bg-sky-100"
                        : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">
                      {!isSpeechMuted ? "volume_up" : "volume_off"}
                    </span>
                    <span className="truncate">{!isSpeechMuted ? "Speak Finalized Text" : "Speech Muted"}</span>
                  </button>
                </div>
              </div>

              {/* Optional Camera on Join Preference */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#0284C7] text-lg">videocam</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Join with Camera Enabled</span>
                    <span className="text-[10px] text-slate-500 block">Stream video of your signs to the teacher (Zero-Mic Mode)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setJoinWithCamera(!joinWithCamera)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    joinWithCamera ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  title={joinWithCamera ? "Camera will start when you join" : "Camera starts turned off"}
                >
                  <span className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                    joinWithCamera ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Primary Join Action (Strictly Only Join) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-lg">meeting_room</span>
                <span>Join Meeting Now</span>
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-[#E2EDF8] text-center text-xs text-slate-400 bg-white/50">
          AccessAI Two-Way Accessible Meeting System • Student Participation Interface
        </footer>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 2: ACTIVE TWO-WAY ACCESSIBLE MEETING ROOM (Section 7)
  // Fully loaded with Captions, Two-Way Video, Voluntary Camera, Text Communication
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen ${themeClasses.bg} font-sans flex flex-col select-none selection:bg-blue-500/20`}>
      {/* ── 1. Top Accessible Header Bar ── */}
      <header className={`h-16 ${themeClasses.header} px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md`}>
        {/* Left: Meeting & Room Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0866F5] to-sky-400 flex items-center justify-center text-xl shadow-md shadow-blue-500/20 text-white">
            🤟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm md:text-base font-extrabold ${themeClasses.title} tracking-tight`}>
                {meetingInfo.title}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {isConnected ? "Two-Way Connected" : "Connecting..."}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-200 px-2 py-0.5 rounded-full hidden sm:inline">
                Deaf Student • Join Only
              </span>
            </div>
            <p className={`text-[11px] ${themeClasses.subtext} truncate max-w-xs md:max-w-md`}>
              Room: <span className="font-mono font-semibold text-[#0866F5]">{meetingId}</span> • Host: {meetingInfo.host}
            </p>
          </div>
        </div>

        {/* Right: Accessibility Controls & Leave Button */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjuster (Section 6) */}
          <div className="hidden md:flex items-center bg-[#F1F6FC] rounded-xl p-0.5 border border-[#D5E3F2]">
            {[
              { id: "normal", label: "A", title: "Normal font size" },
              { id: "large", label: "A+", title: "Large font size" },
              { id: "xlarge", label: "A++", title: "Extra Large font size" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  fontSize === f.id ? "bg-[#0866F5] text-white shadow-xs" : "text-slate-600 hover:text-[#10265C]"
                }`}
                title={f.title}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* High Contrast Toggle (Section 6) */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 md:px-3 md:py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
              highContrast ? "bg-yellow-400 text-black border-yellow-500 font-bold" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Toggle high contrast interface"
          >
            <span className="material-symbols-outlined text-sm">contrast</span>
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Text-to-Speech Toggle (Section 4) */}
          <button
            onClick={handleToggleSpeechMute}
            className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              highContrast
                ? "bg-yellow-400 text-black border-yellow-500 font-bold"
                : !isSpeechMuted
                ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 shadow-2xs"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-2xs"
            }`}
            title="Toggle speech synthesis for hearing participants"
          >
            <span className="material-symbols-outlined text-sm">
              {!isSpeechMuted ? "volume_up" : "volume_off"}
            </span>
            <span className="hidden sm:inline">{!isSpeechMuted ? "TTS: Active" : "TTS: Muted"}</span>
          </button>

          {/* Developer 2 Hearing Speech Simulator */}
          <button
            onClick={handleSimulateHearingSpeech}
            className={`flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-semibold ${
              highContrast
                ? "bg-yellow-400 text-black border-yellow-500 font-bold"
                : "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs"
            } transition-all cursor-pointer`}
            title="Simulate speech from Developer 2 (Hearing side)"
          >
            <span className="material-symbols-outlined text-sm">record_voice_over</span>
            <span className="hidden md:inline">Simulate Hearing Voice</span>
          </button>

          {/* Accessible Leave Meeting Button */}
          <button
            onClick={handleLeaveMeeting}
            className={`px-3.5 py-1.5 rounded-xl ${
              highContrast
                ? "bg-red-600 text-white font-bold"
                : "bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 shadow-2xs"
            } transition-all cursor-pointer flex items-center gap-1`}
          >
            <span className="material-symbols-outlined text-sm">call_end</span>
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* ── 2. Main 2-Column Responsive Workspace ── */}
      <div className="flex-1 p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-7xl mx-auto w-full">
        {/* ════════════════════════════════════════════════════════════════
            LEFT COLUMN (7 COLS): INCOMING LIVE CAPTIONS & TWO-WAY VIDEO STAGE
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* ── A. Real-Time Speech-to-Text Live Captions Banner (Section 5) ── */}
          <div className={`p-4 rounded-2xl ${themeClasses.panel} relative overflow-hidden flex flex-col gap-2 border-l-4 border-l-[#0866F5]`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Live Speech-to-Text Captions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {liveCaption.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-xs text-[#0866F5]">person</span>
                <span>{liveCaption.speaker}</span>
              </div>
            </div>

            {/* Live Caption Text (Adjustable Font Size) */}
            <p className={`${currentFont.captions} ${highContrast ? "text-yellow-300" : "text-[#10265C]"} font-semibold leading-relaxed min-h-[3rem] flex items-center`}>
              "{liveCaption.text}"
            </p>
          </div>

          {/* ── B. Visual Stage: Teacher Live Video Stream & Student Sign Camera ── */}
          <div className="flex flex-col gap-3">
            {/* Stage Layout Controls Toolbar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0866F5] text-sm">view_quilt</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Visual Presentation Stage
                </span>
                {remoteVideoActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Teacher Video Live</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    cameraActive
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                  title={cameraActive ? "Turn off camera" : "Share camera so teacher sees your face and sign gestures"}
                >
                  <span className="material-symbols-outlined !text-xs">
                    {cameraActive ? "videocam_off" : "videocam"}
                  </span>
                  <span>{cameraActive ? "Turn Off Camera" : "Turn On Camera"}</span>
                </button>
                <div className="w-px h-4 bg-slate-200 mx-0.5 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("split")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "split" ? "bg-[#0866F5] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Side-by-Side (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("teacher_focus")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "teacher_focus" ? "bg-[#0866F5] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Focus Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("student_focus")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "student_focus" ? "bg-[#0866F5] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Focus Student
                </button>
              </div>
            </div>

            {/* Grid Layout Container: Teacher Video & Student Sign Camera */}
            <div className={`grid gap-4 ${
              videoLayoutMode === "split"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            }`}>
              {/* Tile 1: Live Teacher Video Stream (WebRTC) */}
              <div className={`rounded-3xl ${themeClasses.panel} p-4 flex flex-col justify-between relative overflow-hidden ${
                videoLayoutMode === "teacher_focus" ? "min-h-[400px]" : "min-h-[280px]"
              }`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">cast_for_education</span>
                    <span className="text-xs font-bold text-slate-800">Teacher Video Broadcast (Prof. Ananya Rao)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {remoteVideoActive && (
                      <button
                        type="button"
                        onClick={() => {
                          if (remoteVideoRef.current) {
                            remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
                            setIsTeacherAudioMuted(remoteVideoRef.current.muted);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1 border border-slate-200 transition-all cursor-pointer"
                        title="Toggle Teacher Audio output"
                      >
                        <span className="material-symbols-outlined !text-xs">
                          {isTeacherAudioMuted ? "volume_off" : "volume_up"}
                        </span>
                        <span>{isTeacherAudioMuted ? "Unmute Audio" : "Audio On"}</span>
                      </button>
                    )}
                    {remoteVideoActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Teacher Live</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Waiting for Teacher...
                      </span>
                    )}
                  </div>
                </div>

                {/* Remote Teacher Video Stream Container */}
                <div className={`relative w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center my-2 ${
                  videoLayoutMode === "teacher_focus" ? "h-88" : "h-64"
                }`}>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      e.target.play().catch(() => {});
                      setRemoteVideoActive(true);
                    }}
                    className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                      remoteVideoActive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                    }`}
                  />

                  {!remoteVideoActive && (
                    <div className="flex flex-col items-center text-center p-4 gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-xl">tv</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Teacher Live Broadcast Feed</p>
                        <p className="text-[10px] text-slate-400 max-w-[220px]">
                          When your instructor starts broadcasting video from the Teacher Studio, their stream appears here in real time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="z-10 flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${remoteVideoActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <span>{remoteVideoActive ? "Teacher Video Connected" : "Audio-to-Captions Active"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Zero-Mic Required</span>
                </div>
              </div>

              {/* Tile 2: Student Sign Camera & Two-Way Video Stream */}
              <div className={`rounded-3xl ${themeClasses.panel} p-4 flex flex-col justify-between relative overflow-hidden ${
                videoLayoutMode === "student_focus" ? "min-h-[400px]" : "min-h-[280px]"
              }`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0866F5] text-lg">person</span>
                    <span className="text-xs font-bold text-slate-800">Your Student Sign Camera (MediaPipe Live)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {detectedSign && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-xs">sign_language</span>
                        <span>{detectedSign.label} ({Math.round(detectedSign.score * 100)}%)</span>
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      cameraActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {cameraActive ? "Camera ON" : "Camera OFF"}
                    </span>
                  </div>
                </div>

                {/* Student Camera & Gesture Overlay Container */}
                <div className={`relative w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center my-2 ${
                  videoLayoutMode === "student_focus" ? "h-88" : "h-64"
                }`}>
                  {/* Keep video & canvas elements permanently mounted so videoRef.current is always available */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${
                      cameraActive ? "block" : "hidden pointer-events-none"
                    }`}
                  />
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 ${
                      cameraActive ? "block" : "hidden"
                    }`}
                  />

                  {cameraActive && holdProgress > 0 && (
                    <div className="absolute top-3 left-3 right-3 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                      <span className="text-[10px] font-bold text-amber-300">Hold gesture:</span>
                      <div className="flex-1 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full transition-all duration-75" style={{ width: `${holdProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-white font-mono">{holdProgress}%</span>
                    </div>
                  )}

                  {cameraActive && unclearWarning && (
                    <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-20">
                      <span className="material-symbols-outlined !text-xs">warning</span>
                      <span>{unclearWarning}</span>
                    </div>
                  )}

                  {/* Inactive or Error State Placeholder */}
                  {!cameraActive && (
                    <div className="flex flex-col items-center text-center p-4 gap-2 z-10 max-w-sm">
                      {cameraError ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                            <span className="material-symbols-outlined text-xl">error_outline</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-300">{cameraError.title || "Camera Error"}</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {cameraError.desc}
                            </p>
                          </div>
                          {cameraError.canRetry && (
                            <button
                              type="button"
                              onClick={startStudentCamera}
                              className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined !text-xs">refresh</span>
                              <span>Try Again</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-xl">videocam_off</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Student Camera is Off</p>
                            <p className="text-[10px] text-slate-400 max-w-[220px]">
                              Turn on your camera so your teacher can see your face and gesture signs live.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleCamera}
                            className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#0866F5] hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined !text-xs">videocam</span>
                            <span>Turn On Camera</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="z-10 flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span>{cameraActive ? "Broadcasting Sign Video to Teacher" : "Camera Inactive"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">16:9 HD Stream</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Speaking to Meeting Wave Indicator */}
          {isSpeaking && (
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-indigo-700 text-xs font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-bounce text-[#0866F5]">campaign</span>
                <span>Speaking your finalized message to hearing participants...</span>
              </div>
              <button
                onClick={() => speechService.stop()}
                className="text-[10px] underline hover:text-[#10265C] cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT COLUMN (5 COLS): PARTICIPANTS, CHAT LOG & MANDATORY TEXT COMPOSER
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* ── A. Participants Header (Section 7) ── */}
          <div className={`p-3.5 rounded-2xl ${themeClasses.panel} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0866F5] text-lg">group</span>
              <span className={`text-xs font-bold ${highContrast ? "text-yellow-300" : "text-[#10265C]"}`}>Meeting Participants ({participants.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    p.mode === "deaf_mute"
                      ? "bg-[#E8F5FF] text-[#0866F5] border border-[#BAE6FD]"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                  title={`${p.name} (${p.role})`}
                >
                  {p.isSelf ? "You (Deaf)" : p.name.split(" ")[0]}
                </div>
              ))}
            </div>
          </div>

          {/* ── B. Two-Way Live Transcript / Message Stream (Section 7) ── */}
          <div
            className={`flex-1 rounded-3xl ${themeClasses.panel} p-4 flex flex-col overflow-hidden max-h-[360px] md:max-h-[420px]`}
            role="log"
            aria-live="polite"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Two-Way Meeting Transcript
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time Sync</span>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isDeafUser = msg.senderMode === "deaf_mute" || msg.senderId === user?.uid;
                const isHearingUser = msg.senderMode === "hearing";
                const isSystem = msg.messageType === "system" || msg.senderId === "system";

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col gap-1 p-3 rounded-2xl border transition-all ${
                      isSystem
                        ? "bg-slate-50 border-slate-200 text-slate-600 text-xs"
                        : isDeafUser
                        ? "bg-[#EEF6FF] border-[#BAE6FD] ml-3"
                        : "bg-[#F0FDF4] border-[#BBF7D0] mr-3"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isDeafUser ? "text-[#0866F5]" : isHearingUser ? "text-emerald-700" : "text-slate-600"}`}>
                          {msg.senderName || (isDeafUser ? "Deaf Student (You)" : "Hearing Participant")}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                          isDeafUser ? "bg-white text-blue-700 border border-blue-200" : isHearingUser ? "bg-white text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isDeafUser ? (msg.messageType === "sign_to_text" ? "🤟 Sign" : "💬 Text") : isHearingUser ? "🗣️ Speech" : "Relay"}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`${currentFont.text} ${highContrast ? "text-yellow-300" : "text-[#10265C]"} font-medium leading-relaxed`}>
                      {msg.text}
                    </p>

                    {/* Replay Button on each message (Section 5) */}
                    {!isSystem && (
                      <div className="self-end mt-1">
                        <button
                          onClick={() => handleReplayMessage(msg)}
                          className="text-[10px] text-slate-500 hover:text-[#0866F5] flex items-center gap-1 transition-colors font-medium cursor-pointer"
                          title="Replay this message with captions and speech"
                        >
                          <span className="material-symbols-outlined !text-xs">replay</span>
                          <span>Replay</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── C. Mandatory Text-Based Communication Center (Section 3) ── */}
          <div className={`p-4 rounded-3xl ${themeClasses.panel} flex flex-col gap-3`}>
            {/* 1. Required Quick Response Buttons (Section 3 Specification) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick Accessible Responses (1-Click)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_RESPONSES.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => handleQuickResponse(qr.text)}
                    className={`px-2 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${qr.color} ${themeClasses.chip}`}
                    title={`Send "${qr.text}" instantly to meeting`}
                  >
                    <span className="material-symbols-outlined text-sm">{qr.icon}</span>
                    <span className="truncate">{qr.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Large High-Visibility Textarea Input */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  ref={textInputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message for hearing participants (Enter to send & speak)..."
                  rows={2}
                  className={`w-full p-3 rounded-2xl ${themeClasses.input} ${currentFont.input} resize-none outline-none transition-all pr-12`}
                  aria-label="Accessible message composer"
                />

                {messageText && (
                  <button
                    onClick={() => setMessageText("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                    title="Clear text"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-xs">keyboard</span>
                  <span>Press <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px] text-slate-600 font-mono">Enter</kbd> to Send & Speak</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!messageText.trim()}
                    className={`px-5 py-2.5 rounded-xl ${themeClasses.btnPrimary} ${
                      !messageText.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
                    } text-xs font-bold flex items-center gap-1.5 transition-all`}
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Send & Speak</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Meko Context Inspector ── */}
      <MekoContextInspector 
        studentDatapackId="student-deaf-memory" 
        sharedDatapackId="course-python-shared" 
        buildDatapackId="accessai-build" 
      />
    </div>
  );
}
