import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TeacherMeetingRoom from "./TeacherMeetingRoom";
import DeafMeetingRoom from "./DeafMeetingRoom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { VoiceAssistantProvider } from "../context/VoiceAssistantContext";
import { WalletProvider } from "../context/WalletContext";
import { MeetingChannel } from "../services/meetingChannel";
import { WebRtcManager } from "../services/webrtcManager";

// Mock Supabase
jest.mock("../services/supabase", () => {
  const client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    channel: () => ({
      on: () => ({
        subscribe: () => ({ send: () => Promise.resolve({}), unsubscribe: () => {} })
      }),
      subscribe: () => ({ send: () => Promise.resolve({}), unsubscribe: () => {} }),
      send: () => Promise.resolve({}),
      unsubscribe: () => {}
    })
  };
  return {
    __esModule: true,
    supabase: client,
    default: client
  };
});

// Mock Three.js canvas in SignAvatar
jest.mock("../components/DeafMuteMode/SignAvatar", () => {
  return function MockSignAvatar({ gestureId }) {
    return <div data-testid="sign-avatar-mock">SignAvatar: {gestureId}</div>;
  };
});

// Mock In-Memory BroadcastChannel for JSDOM
class MockBroadcastChannel {
  static channels = new Map();
  constructor(name) {
    this.name = name;
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set());
    }
    MockBroadcastChannel.channels.get(name).add(this);
    this.onmessage = null;
  }
  postMessage(data) {
    const set = MockBroadcastChannel.channels.get(this.name);
    if (set) {
      set.forEach((ch) => {
        if (ch !== this && ch.onmessage) {
          ch.onmessage({ data });
        }
      });
    }
  }
  close() {
    const set = MockBroadcastChannel.channels.get(this.name);
    if (set) set.delete(this);
  }
}

// Mock MediaStream
class MockMediaStream {
  constructor() {
    this.tracks = [
      { kind: "video", enabled: true, stop: jest.fn() },
      { kind: "audio", enabled: true, stop: jest.fn() }
    ];
  }
  getTracks() {
    return this.tracks;
  }
  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === "video");
  }
  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === "audio");
  }
}

// Mock RTCPeerConnection
class MockRTCPeerConnection {
  constructor() {
    this.iceConnectionState = "connected";
    this.signalingState = "stable";
    this.onicecandidate = null;
    this.ontrack = null;
    this.oniceconnectionstatechange = null;
  }
  createOffer() {
    return Promise.resolve({ type: "offer", sdp: "v=0\r\no=mock..." });
  }
  createAnswer() {
    return Promise.resolve({ type: "answer", sdp: "v=0\r\no=mock-ans..." });
  }
  setLocalDescription() {
    return Promise.resolve();
  }
  setRemoteDescription() {
    return Promise.resolve();
  }
  addIceCandidate() {
    return Promise.resolve();
  }
  addTrack() {}
  close() {}
}

beforeAll(() => {
  global.BroadcastChannel = MockBroadcastChannel;
  global.RTCPeerConnection = MockRTCPeerConnection;
  global.RTCSessionDescription = function (desc) { return desc; };
  global.RTCIceCandidate = function (cand) { return cand; };
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {};
  }
  navigator.mediaDevices.getUserMedia = jest.fn(() => Promise.resolve(new MockMediaStream()));
});

function AllProviders({ children }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <LanguageProvider>
          <VoiceAssistantProvider>
            {children}
          </VoiceAssistantProvider>
        </LanguageProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  MockBroadcastChannel.channels.clear();
});

describe("Teacher Video Meeting Studio", () => {
  test("renders Teacher Meeting Room with video dock, controls, and student roster", async () => {
    window.localStorage.setItem(
      "accessai_demo_auth",
      JSON.stringify({
        user: { id: "teacher-demo", displayName: "Prof. Ananya Rao", role: "teacher" },
        role: "teacher"
      })
    );

    render(
      <AllProviders>
        <TeacherMeetingRoom />
      </AllProviders>
    );

    // Title and Broadcast status
    expect(await screen.findByText(/Teacher Video Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Broadcast/i)).toBeInTheDocument();
    expect(screen.getByText(/Broadcasting to Students/i)).toBeInTheDocument();

    // Copy Student Link button
    const copyBtn = screen.getByRole("button", { name: /Copy Student Link/i });
    expect(copyBtn).toBeInTheDocument();

    // Video controls: Mic, Camera, Captions
    expect(screen.getByTitle(/Mute Microphone/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Turn Off Camera/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Disable Live Captions/i)).toBeInTheDocument();

    // Roster and Student responses feed
    expect(screen.getByText(/Connected Participants/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Responses & Inquiries/i)).toBeInTheDocument();
  });

  test("toggles camera and microphone controls cleanly", async () => {
    render(
      <AllProviders>
        <TeacherMeetingRoom />
      </AllProviders>
    );

    const camBtn = await screen.findByTitle(/Turn Off Camera/i);
    act(() => {
      fireEvent.click(camBtn);
    });
    // Camera is turned off overlay appears
    expect(screen.getByText(/Camera is turned off/i)).toBeInTheDocument();

    const micBtn = screen.getByTitle(/Mute Microphone/i);
    act(() => {
      fireEvent.click(micBtn);
    });
    expect(screen.getByTitle(/Unmute Microphone/i)).toBeInTheDocument();
  });
});

describe("WebRTC Manager & MeetingChannel Signaling", () => {
  test("broadcasts and receives WebRTC signaling offers, answers, and speech captions", (done) => {
    const channelA = new MeetingChannel("test-webrtc-room", { id: "teacher-1", role: "teacher" });
    const channelB = new MeetingChannel("test-webrtc-room", { id: "student-1", role: "student" });

    // Verify signal transfer
    channelB.onSignal((signal, senderId) => {
      expect(senderId).toBe("teacher-1");
      expect(signal.type).toBe("offer");
      expect(signal.sdp).toBe("mock-sdp-test");

      channelA.destroy();
      channelB.destroy();
      done();
    });

    channelA.sendSignal("student-1", { type: "offer", sdp: "mock-sdp-test" });
  });

  test("broadcasts speech-to-text captions from teacher to students in real-time", (done) => {
    const channelTeacher = new MeetingChannel("test-caption-room", { id: "teacher-host", role: "teacher" });
    const channelStudent = new MeetingChannel("test-caption-room", { id: "student-deaf", role: "student" });

    channelStudent.onMessage((msg) => {
      if (msg.messageType === "speech_to_text") {
        expect(msg.text).toBe("Welcome class, today we learn web accessibility.");
        expect(msg.senderMode).toBe("teacher");

        channelTeacher.destroy();
        channelStudent.destroy();
        done();
      }
    });

    channelTeacher.sendSpeechCaption("Welcome class, today we learn web accessibility.", true);
  });
});

describe("Deaf Meeting Room Video & Sign Presentation Integration", () => {
  test("student room connects with zero mandatory mic and renders two-way video stage", async () => {
    render(
      <AllProviders>
        <DeafMeetingRoom />
      </AllProviders>
    );

    // Initial Join Lobby
    const joinBtn = await screen.findByRole("button", { name: /Join Meeting/i });
    expect(joinBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(joinBtn);
    });

    // In-Room visual stage
    expect(await screen.findByText(/Visual Presentation Stage/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Side-by-Side \(1:1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Focus Teacher/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Focus Student/i })).toBeInTheDocument();

    // Teacher Video Container & Student Sign Camera Container
    expect(screen.getByText(/Teacher Video Broadcast/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Student Sign Camera/i)).toBeInTheDocument();

    // Voluntary camera toggle button
    expect(screen.getByRole("button", { name: /Camera ON/i })).toBeInTheDocument();
  });

  test("WebRtcManager addLocalStream attaches tracks and initiates renegotiation", async () => {
    const channelHost = new MeetingChannel("test-mutual-video-room", { id: "teacher-host", role: "teacher" });
    const channelClient = new MeetingChannel("test-mutual-video-room", { id: "student-client", role: "student" });

    const webrtcHost = new WebRtcManager({ meetingChannel: channelHost, isHost: true });
    const webrtcClient = new WebRtcManager({ meetingChannel: channelClient, isHost: false });

    // Establish initial peer connection
    await webrtcHost.connectToPeer("student-client");
    expect(webrtcHost.peers.has("student-client")).toBe(true);

    // Client dynamically starts voluntary camera stream
    const mockStudentStream = new MockMediaStream();
    await webrtcClient.addLocalStream(mockStudentStream);

    expect(webrtcClient.getLocalStream()).toBe(mockStudentStream);

    // Client toggles camera off
    webrtcClient.removeLocalStream();
    expect(webrtcClient.getLocalStream()).toBeNull();

    webrtcHost.destroy();
    webrtcClient.destroy();
    channelHost.destroy();
    channelClient.destroy();
  });

  test("Teacher Meeting Room renders Two-Way Visual Stage layout controls", async () => {
    render(
      <AllProviders>
        <TeacherMeetingRoom />
      </AllProviders>
    );

    expect(await screen.findByText(/Two-Way Meeting Visual Stage/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Side-by-Side \(1:1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Focus Student/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Focus Teacher/i })).toBeInTheDocument();

    // Switch layout mode cleanly
    const focusStudentBtn = screen.getByRole("button", { name: /Focus Student/i });
    act(() => {
      fireEvent.click(focusStudentBtn);
    });

    const splitBtn = screen.getByRole("button", { name: /Side-by-Side \(1:1\)/i });
    act(() => {
      fireEvent.click(splitBtn);
    });
  });
});
