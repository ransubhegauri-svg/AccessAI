import React, { useState, useEffect, useRef } from "react";
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
  { id: "qr-yes", text: "Yes", icon: "check_circle", color: "hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "qr-no", text: "No", icon: "cancel", color: "hover:bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: "qr-agree", text: "I agree", icon: "thumb_up", color: "hover:bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { id: "qr-disagree", text: "I disagree", icon: "thumb_down", color: "hover:bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "qr-repeat", text: "Please repeat", icon: "replay", color: "hover:bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "qr-question", text: "I have a question", icon: "help", color: "hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  { id: "qr-help", text: "I need help", icon: "sos", color: "hover:bg-red-500/20 text-red-400 border-red-500/30" },
  { id: "qr-thanks", text: "Thank you", icon: "volunteer_activism", color: "hover:bg-teal-500/20 text-teal-400 border-teal-500/30" }
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
  // Camera active by default for mutual face-to-face video calling. Microphone is NEVER requested.
  const [cameraActive, setCameraActive] = useState(true);
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

  // Single-device test sign feed simulation
  const [isSimulatingFeed, setIsSimulatingFeed] = useState(false);
  const simCanvasRef = useRef(null);
  const simAnimIdRef = useRef(null);
  const simIntervalRef = useRef(null);

  // DOM Refs
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

  // ── 3. Optional Sign Language Detection Engine (Section 2) ──
  // Camera is initialized ONLY when voluntary cameraActive is true!
  const stopSimulatedFeed = () => {
    if (simAnimIdRef.current) {
      cancelAnimationFrame(simAnimIdRef.current);
      simAnimIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setDetectedSign(null);
  };

  const startSimulatedFeed = () => {
    if (engineRef.current) {
      engineRef.current.stopCamera();
    }

    let canvas = simCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      simCanvasRef.current = canvas;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startTime = Date.now();
    const demoSigns = [
      { label: "Hello Everyone", icon: "✋", phrase: "Hello everyone,", conf: 0.98 },
      { label: "I Agree / Yes", icon: "👍", phrase: "I agree with this proposal.", conf: 0.96 },
      { label: "Thank You All", icon: "🤟", phrase: "Thank you so much everyone.", conf: 0.99 }
    ];

    let currentSignIndex = 0;

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const signIdx = Math.floor((elapsed % 9) / 3);
      const activeSign = demoSigns[signIdx];

      // 1. Sleek Gradient Dark Canvas Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(1, "#020617");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 640, 480);

      // Subtle cyber grid lines
      ctx.strokeStyle = "rgba(14, 165, 233, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // 2. Student Avatar Silhouette
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.ellipse(320, 430, 160, 100, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(320, 240, 75, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(320, 255, 30, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(295, 230, 6, 0, Math.PI * 2);
      ctx.arc(345, 230, 6, 0, Math.PI * 2);
      ctx.fill();

      // 3. Hand & Skeleton
      const wave = Math.sin(elapsed * 5) * 15;
      const handX = 430 + (signIdx === 0 ? wave : 0);
      const handY = 270 + (signIdx === 1 ? Math.sin(elapsed * 4) * 8 : 0);

      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(380, 390);
      ctx.quadraticCurveTo(440, 360, handX, handY);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.arc(handX, handY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      const pts = [
        { x: handX, y: handY },
        { x: handX - 16, y: handY - 24 },
        { x: handX - 24, y: handY - 45 },
        { x: handX - 8, y: handY - 48 },
        { x: handX + 8, y: handY - 52 },
        { x: handX + 22, y: handY - 44 },
        { x: handX + 32, y: handY - 32 }
      ];

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      pts.forEach((p) => {
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Top banner
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(16, 16, 608, 48);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.strokeRect(16, 16, 608, 48);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("STUDENT SIGN FEED • SINGLE-DEVICE TEST STREAM", 32, 44);

      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(588, 40, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bottom detected sign banner
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(16, 400, 608, 64);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.strokeRect(16, 400, 608, 64);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`🤟 ASL Gesture: ${activeSign.label} ${activeSign.icon}`, 32, 436);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`CONFIDENCE: ${Math.round(activeSign.conf * 100)}% • P2P WebRTC`, 430, 436);

      simAnimIdRef.current = requestAnimationFrame(render);
    };

    render();

    try {
      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});

        if (webrtcRef.current) {
          webrtcRef.current.addLocalStream(stream);
        }

        if (channelRef.current) {
          channelRef.current.sendSignal("broadcast", {
            type: "camera_state",
            active: true,
            studentName: studentName.trim() || user?.displayName || "Deaf Student"
          });
        }
      }
    } catch (e) {
      console.warn("captureStream error:", e);
    }

    simIntervalRef.current = setInterval(() => {
      const sign = demoSigns[currentSignIndex % demoSigns.length];
      currentSignIndex++;
      setDetectedSign({ label: sign.label, score: sign.conf, category: "meeting" });
      if (channelRef.current) {
        channelRef.current.sendSignMessage(sign.phrase, sign.conf);
      }
    }, 3600);
  };

  const handleToggleSimulatedFeed = () => {
    if (isSimulatingFeed) {
      stopSimulatedFeed();
      setIsSimulatingFeed(false);
      setCameraActive(true);
    } else {
      setIsSimulatingFeed(true);
      setCameraActive(true);
      startSimulatedFeed();
    }
  };

  useEffect(() => {
    if (!isJoined || !cameraActive || isSimulatingFeed) {
      if (engineRef.current && !isSimulatingFeed) {
        engineRef.current.stopCamera();
      }
      return;
    }

    const engine = new SignLanguageMeetingEngine({
      onSignDetected: (data) => {
        setDetectedSign(data);
      },
      onSentenceUpdated: (fullText) => {
        // Append or replace into message composer so student can review and edit before sending
        setMessageText((prev) => {
          if (!prev.trim()) return fullText;
          return prev + " " + fullText;
        });
      },
      onHoldProgress: (percent) => {
        setHoldProgress(percent);
      },
      onUnclearGesture: (warning) => {
        setUnclearWarning(warning);
        setTimeout(() => setUnclearWarning(null), 3000);
      }
    });

    engineRef.current = engine;

    engine
      .initialize()
      .then(async () => {
        if (videoRef.current && canvasRef.current) {
          try {
            await engine.startCamera(videoRef.current, canvasRef.current);
            setCameraError(null);

            // Stream voluntary student camera to Teacher over WebRTC peer connection
            if (webrtcRef.current && engine.stream) {
              await webrtcRef.current.addLocalStream(engine.stream);
            }
            if (channelRef.current) {
              channelRef.current.sendSignal("broadcast", {
                type: "camera_state",
                active: true,
                studentName: studentName.trim() || user?.displayName || "Deaf Student"
              });
            }
          } catch (camErr) {
            console.warn("Camera permission denied:", camErr);
            setCameraError("Camera permission denied or camera in use. You can continue participating 100% via text!");
            setCameraActive(false);
          }
        }
      })
      .catch(async (err) => {
        console.warn("[StudentRoom] MediaPipe engine init error, falling back to direct webcam:", err);
        // Direct camera stream fallback so teacher can still see student's face!
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
              audio: false
            });
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              videoRef.current.play().catch(() => {});
            }
            if (webrtcRef.current) {
              await webrtcRef.current.addLocalStream(fallbackStream);
            }
            if (channelRef.current) {
              channelRef.current.sendSignal("broadcast", {
                type: "camera_state",
                active: true,
                studentName: studentName.trim() || user?.displayName || "Deaf Student"
              });
            }
            setCameraError(null);
          }
        } catch (fbErr) {
          console.warn("[StudentRoom] Direct camera fallback error:", fbErr);
          setCameraError("Camera unavailable. You can continue participating 100% via text!");
          setCameraActive(false);
        }
      });

    return () => {
      stopSimulatedFeed();
      if (engine) engine.stopCamera();
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
    };
  }, [isJoined, cameraActive, isSimulatingFeed]);

  // Voluntary Camera Toggle
  const handleToggleCamera = () => {
    setCameraError(null);
    if (isSimulatingFeed) {
      stopSimulatedFeed();
      setIsSimulatingFeed(false);
    }
    setCameraActive((prev) => !prev);
  };

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
    if (engineRef.current) {
      engineRef.current.stopCamera();
    }
    setCameraActive(false);
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
        chip: "bg-neutral-900 border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black font-bold"
      }
    : {
        bg: "bg-slate-950 text-slate-100",
        panel: "bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl",
        header: "bg-slate-900/95 border-b border-slate-800 text-white",
        accent: "text-primary",
        btnPrimary: "bg-primary hover:brightness-110 text-white font-bold shadow-lg shadow-primary/20",
        btnSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium",
        badge: "bg-primary/20 text-indigo-300 border border-primary/30 font-semibold",
        input: "bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary",
        chip: "bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700"
      };

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 1: JOIN-ONLY SCREEN (Section 1 Specification)
  // Strictly presents "Join Meeting" only. No Create, Host, or Schedule options!
  // ══════════════════════════════════════════════════════════════════════
  if (!isJoined) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} font-sans flex flex-col justify-between selection:bg-primary/30`}>
        {/* Top Minimal Navigation */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/deaf")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-lg font-black shadow-md shadow-primary/20">
              AI
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AccessAI</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Accessible Meeting Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                highContrast ? "bg-yellow-400 text-black border-yellow-500" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
              title="Toggle High Contrast Mode"
            >
              Contrast: {highContrast ? "High" : "Standard"}
            </button>
            <button
              onClick={() => navigate("/deaf")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </header>

        {/* Center Join Card */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className={`max-w-xl w-full p-8 rounded-3xl ${themeClasses.panel} flex flex-col gap-6 relative overflow-hidden`}>
            {/* Ambient Accent Light */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">video_camera_front</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Student Mode • Join Only
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-2 text-white">
                Join Accessible Meeting
              </h1>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Enter your meeting ID or paste the meeting link to join. Communicate naturally using high-visibility text, quick responses, live captions, and two-way video calling.
              </p>
            </div>

            {/* Accessibility Reassurance Banner (Core Requirement) */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>Zero Mandatory Permissions Promise</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li><strong className="text-white">Microphone is NEVER required</strong> or requested for your session.</li>
                <li><strong className="text-white">Camera is 100% voluntary</strong>. You can participate entirely through text.</li>
                <li>Full real-time speech-to-text captions and two-way video calling included.</li>
              </ul>
            </div>

            {/* Join Form */}
            <form onSubmit={handleJoinMeeting} className="flex flex-col gap-4">
              {joinError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{joinError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Meeting ID or Link</span>
                  <span className="text-[10px] text-slate-500 font-normal">Format: accessai-room-402</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">
                    tag
                  </span>
                  <input
                    type="text"
                    value={meetingInputId}
                    onChange={(e) => setMeetingInputId(e.target.value)}
                    placeholder="Enter meeting ID (e.g., accessai-room-402) or paste link"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl ${themeClasses.input} text-sm font-medium transition-all outline-none`}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
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
                    className={`w-full pl-10 pr-4 py-3 rounded-xl ${themeClasses.input} text-sm font-medium transition-all outline-none`}
                    required
                  />
                </div>
              </div>

              {/* Preference Row: Font Size & Speech Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-400">Meeting Font Size</span>
                  <div className="flex gap-1">
                    {[
                      { id: "normal", label: "A" },
                      { id: "large", label: "A+" },
                      { id: "xlarge", label: "A++" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontSize(f.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          fontSize === f.id
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-400">Speech for Others (TTS)</span>
                  <button
                    type="button"
                    onClick={handleToggleSpeechMute}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      !isSpeechMuted
                        ? "bg-sky-500/10 border-sky-500/40 text-sky-300"
                        : "bg-red-500/10 border-red-500/40 text-red-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {!isSpeechMuted ? "volume_up" : "volume_off"}
                    </span>
                    <span>{!isSpeechMuted ? "Speak Finalized Text" : "Speech Muted"}</span>
                  </button>
                </div>
              </div>

              {/* Optional Camera on Join Preference */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-base">videocam</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Join with Camera Enabled</span>
                    <span className="text-[10px] text-slate-400 block">Stream video of your signs to the teacher (Zero-Mic Mode)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    cameraActive ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  title={cameraActive ? "Camera will start when you join" : "Camera starts turned off"}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    cameraActive ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Primary Join Action (Strictly Only Join) */}
              <button
                type="submit"
                className={`w-full py-4 rounded-2xl ${themeClasses.btnPrimary} text-sm font-bold flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer`}
              >
                <span className="material-symbols-outlined text-lg">meeting_room</span>
                <span>Join Meeting Now</span>
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
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
    <div className={`min-h-screen ${themeClasses.bg} font-sans flex flex-col select-none selection:bg-primary/30`}>
      {/* ── 1. Top Accessible Header Bar ── */}
      <header className={`h-16 ${themeClasses.header} px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md`}>
        {/* Left: Meeting & Room Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20">
            🤟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-wide">
                {meetingInfo.title}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                {isConnected ? "Two-Way Connected" : "Connecting..."}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-indigo-300 border border-primary/30 px-2 py-0.5 rounded-full hidden sm:inline">
                Deaf Student • Join Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs md:max-w-md">
              Room: <span className="font-mono text-sky-400">{meetingId}</span> • Host: {meetingInfo.host}
            </p>
          </div>
        </div>

        {/* Right: Accessibility Controls & Leave Button */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjuster (Section 6) */}
          <div className="hidden md:flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
            {[
              { id: "normal", label: "A", title: "Normal font size" },
              { id: "large", label: "A+", title: "Large font size" },
              { id: "xlarge", label: "A++", title: "Extra Large font size" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  fontSize === f.id ? "bg-primary text-white" : "text-slate-400 hover:text-white"
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
              highContrast ? "bg-yellow-400 text-black border-yellow-500" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
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
              !isSpeechMuted
                ? "bg-sky-500/10 border-sky-500/40 text-sky-300 hover:bg-sky-500/20"
                : "bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20"
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
            className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer"
            title="Simulate speech from Developer 2 (Hearing side)"
          >
            <span className="material-symbols-outlined text-sm">record_voice_over</span>
            <span className="hidden md:inline">Simulate Hearing Voice</span>
          </button>

          {/* Accessible Leave Meeting Button */}
          <button
            onClick={handleLeaveMeeting}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1"
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
          <div className={`p-4 rounded-2xl ${themeClasses.panel} relative overflow-hidden flex flex-col gap-2 border-l-4 border-l-primary`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Live Speech-to-Text Captions
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {liveCaption.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-xs text-sky-400">person</span>
                <span>{liveCaption.speaker}</span>
              </div>
            </div>

            {/* Live Caption Text (Adjustable Font Size) */}
            <p className={`${currentFont.captions} text-white font-medium leading-relaxed min-h-[3rem] flex items-center`}>
              "{liveCaption.text}"
            </p>
          </div>

          {/* ── B. Visual Stage: Teacher Live Video Stream & Student Sign Camera ── */}
          <div className="flex flex-col gap-3">
            {/* Stage Layout Controls Toolbar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400 text-sm">view_quilt</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Visual Presentation Stage
                </span>
                {remoteVideoActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Teacher Video Live</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    cameraActive
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                  title={cameraActive ? "Turn off camera" : "Share camera so teacher sees your face and sign gestures"}
                >
                  <span className="material-symbols-outlined !text-xs">
                    {cameraActive ? "videocam_off" : "videocam"}
                  </span>
                  <span>{cameraActive ? "Camera ON" : "Turn Camera ON"}</span>
                </button>
                <div className="w-px h-4 bg-slate-800 mx-0.5 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("split")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "split" ? "bg-sky-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Side-by-Side (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("teacher_focus")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "teacher_focus" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Focus Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setVideoLayoutMode("student_focus")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    videoLayoutMode === "student_focus" ? "bg-cyan-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
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
                    <span className="material-symbols-outlined text-emerald-400 text-lg">cast_for_education</span>
                    <span className="text-xs font-bold text-emerald-300">Teacher Video Broadcast (Prof. Ananya Rao)</span>
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
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                        title="Toggle Teacher Audio output"
                      >
                        <span className="material-symbols-outlined !text-xs">
                          {isTeacherAudioMuted ? "volume_off" : "volume_up"}
                        </span>
                        <span>{isTeacherAudioMuted ? "Unmute Audio" : "Audio On"}</span>
                      </button>
                    )}
                    {remoteVideoActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Teacher Live</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Waiting for Teacher...
                      </span>
                    )}
                  </div>
                </div>

                {/* Remote Teacher Video Stream Container */}
                <div className={`relative w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center my-2 ${
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
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-xl">tv</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Teacher Live Broadcast Feed</p>
                        <p className="text-[10px] text-slate-500 max-w-[220px]">
                          When your instructor starts broadcasting video from the Teacher Studio, their stream appears here in real time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="z-10 flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${remoteVideoActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <span>{remoteVideoActive ? "Teacher Video Connected" : "Audio-to-Captions Active"}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Zero-Mic Required</span>
                </div>
              </div>

              {/* Tile 2: Student Sign Camera & Two-Way Video Stream */}
              <div className={`rounded-3xl ${themeClasses.panel} p-4 flex flex-col justify-between relative overflow-hidden ${
                videoLayoutMode === "student_focus" ? "min-h-[400px]" : "min-h-[280px]"
              }`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-400 text-lg">person</span>
                    <span className="text-xs font-bold text-sky-300">Your Student Sign Camera (MediaPipe Live)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleSimulatedFeed}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isSimulatingFeed
                          ? "bg-purple-600/30 border-purple-400 text-purple-200"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                      title="Simulate student sign feed for single-device test"
                    >
                      <span className="material-symbols-outlined !text-xs">smart_toy</span>
                      <span>{isSimulatingFeed ? "Demo Feed: ON" : "Demo Sign Feed"}</span>
                    </button>
                    {detectedSign && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-xs">sign_language</span>
                        <span>{detectedSign.label} ({Math.round(detectedSign.score * 100)}%)</span>
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      cameraActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                    }`}>
                      {cameraActive ? "Camera ON" : "Camera OFF"}
                    </span>
                  </div>
                </div>

                {/* Student Camera & Gesture Overlay Container */}
                <div className={`relative w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center my-2 ${
                  videoLayoutMode === "student_focus" ? "h-88" : "h-64"
                }`}>
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
                      />
                      {holdProgress > 0 && (
                        <div className="absolute top-3 left-3 right-3 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                          <span className="text-[10px] font-bold text-amber-300">Hold gesture:</span>
                          <div className="flex-1 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full transition-all duration-75" style={{ width: `${holdProgress}%` }} />
                          </div>
                          <span className="text-[10px] text-white font-mono">{holdProgress}%</span>
                        </div>
                      )}
                      {unclearWarning && (
                        <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-20">
                          <span className="material-symbols-outlined !text-xs">warning</span>
                          <span>{unclearWarning}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-4 gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-xl">videocam_off</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Student Camera is Off</p>
                        <p className="text-[10px] text-slate-500 max-w-[220px]">
                          Turn on your camera so your teacher can see your face and gesture signs live.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleCamera}
                        className="mt-1 px-3 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-xs">videocam</span>
                        <span>Turn On Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="z-10 flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                    <span>{cameraActive ? "Broadcasting Sign Video to Teacher" : "Camera Inactive"}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">16:9 HD Stream</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Speaking to Meeting Wave Indicator */}
          {isSpeaking && (
            <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-between text-indigo-200 text-xs font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-bounce">campaign</span>
                <span>Speaking your finalized message to hearing participants...</span>
              </div>
              <button
                onClick={() => speechService.stop()}
                className="text-[10px] underline hover:text-white"
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
          <div className={`p-3 rounded-2xl ${themeClasses.panel} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-lg">group</span>
              <span className="text-xs font-bold text-white">Meeting Participants ({participants.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    p.mode === "deaf_mute"
                      ? "bg-primary/20 text-indigo-300 border border-primary/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
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
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Two-Way Meeting Transcript
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-Time Sync</span>
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
                        ? "bg-slate-950/60 border-slate-800/80 text-slate-400 text-xs"
                        : isDeafUser
                        ? "bg-primary/10 border-primary/30 ml-3"
                        : "bg-emerald-500/10 border-emerald-500/30 mr-3"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isDeafUser ? "text-indigo-400" : isHearingUser ? "text-emerald-400" : "text-slate-400"}`}>
                          {msg.senderName || (isDeafUser ? "Deaf Student (You)" : "Hearing Participant")}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-slate-800 text-slate-400">
                          {isDeafUser ? (msg.messageType === "sign_to_text" ? "🤟 Sign" : "💬 Text") : isHearingUser ? "🗣️ Speech" : "Relay"}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[9px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`${currentFont.text} text-white font-medium leading-relaxed`}>
                      {msg.text}
                    </p>

                    {/* Replay Button on each message (Section 5) */}
                    {!isSystem && (
                      <div className="self-end mt-1">
                        <button
                          onClick={() => handleReplayMessage(msg)}
                          className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded-lg"
                    title="Clear text"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="material-symbols-outlined text-xs">keyboard</span>
                  <span>Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to Send & Speak</span>
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
        sharedDatapackId="course-leadership-shared" 
        buildDatapackId="accessai-build" 
      />
    </div>
  );
}
