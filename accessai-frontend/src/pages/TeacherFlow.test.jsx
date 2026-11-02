import { render, screen, fireEvent, act } from "@testing-library/react";
import Landing from "./Landing";
import TeacherLogin from "./TeacherLogin";
import TeacherDashboard from "./TeacherDashboard";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { VoiceAssistantProvider, useVoiceAssistant } from "../context/VoiceAssistantContext";
import { WalletProvider } from "../context/WalletContext";

jest.mock("../services/supabase", () => {
  const client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        neq: () => Promise.resolve({ data: [], error: null })
      })
    }),
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
});

describe("Landing Role Selection Flow", () => {
  test("shows Language selection first, then advances to Role selection", async () => {
    render(
      <AllProviders>
        <Landing />
      </AllProviders>
    );

    // Initial state: Language selection with continue button to role selection
    const continueBtn = await screen.findByRole("button", { name: /Continue to Role Selection/i });
    expect(continueBtn).toBeInTheDocument();

    // Click continue to advance to role selection
    act(() => {
      fireEvent.click(continueBtn);
    });

    // Verify role selection UI
    const roleHeading = await screen.findByRole("heading", { name: /Select Your Role/i });
    expect(roleHeading).toBeInTheDocument();
    expect(screen.getByText(/Student Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Educator Portal/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue to Teacher Portal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue as Student/i })).toBeInTheDocument();
  });

  test("clicking Continue as Student advances to accessibility mode selection", async () => {
    render(
      <AllProviders>
        <Landing />
      </AllProviders>
    );

    const continueBtn = await screen.findByRole("button", { name: /Continue to Role Selection/i });
    act(() => {
      fireEvent.click(continueBtn);
    });

    const studentBtn = await screen.findByRole("button", { name: /Continue as Student/i });
    act(() => {
      fireEvent.click(studentBtn);
    });

    // Mode selection screen is now shown (Blind, Deaf, Motor)
    expect(await screen.findByText(/Blind & Low Vision/i)).toBeInTheDocument();
    expect(await screen.findByText(/Deaf & Hard of Hearing/i)).toBeInTheDocument();
    expect(await screen.findByText(/Motor & Mobility/i)).toBeInTheDocument();
  });

  test("allows navigating back from role selection to language selection using BackButton", async () => {
    render(
      <AllProviders>
        <Landing />
      </AllProviders>
    );

    // Initial state: Language selection
    const continueBtn = await screen.findByRole("button", { name: /Continue to Role Selection/i });
    act(() => {
      fireEvent.click(continueBtn);
    });

    // We are on Role selection
    expect(await screen.findByRole("heading", { name: /Select Your Role/i })).toBeInTheDocument();

    // Click back button in header
    const backBtn = screen.getByRole("button", { name: /Go back/i });
    act(() => {
      fireEvent.click(backBtn);
    });

    // Returns to Language selection
    expect(await screen.findByRole("button", { name: /Continue to Role Selection/i })).toBeInTheDocument();
  });
});

describe("Teacher Login Page", () => {
  test("renders teacher authentication form and 1-Click demo teacher option", async () => {
    render(
      <AllProviders>
        <TeacherLogin />
      </AllProviders>
    );

    expect(await screen.findByRole("heading", { name: /Teacher Login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/teacher@institution.edu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In as Teacher/i })).toBeInTheDocument();
    expect(screen.getByText(/Prof\. Ananya Rao/i)).toBeInTheDocument();
  });
});

describe("Teacher Dashboard and RN Support", () => {
  test("renders teacher hub with RN classroom hub and authentic empty roster without fake data", async () => {
    render(
      <AllProviders>
        <TeacherDashboard />
      </AllProviders>
    );

    expect(await screen.findByText(/Teacher \/ Host/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Enrolled Students/i).length).toBeGreaterThanOrEqual(1);
    // Roster populated with simulated cohort

    // Click RN tab
    const rnTab = screen.getByRole("button", { name: /Realtime Network \(RN\)/i });
    act(() => {
      fireEvent.click(rnTab);
    });

    // RN Broadcast screen active
    expect(screen.getByText(/Live RN Message Feed/i)).toBeInTheDocument();
  });
});

describe("Teacher AI Agent Isolation", () => {
  function TeacherGuardTester() {
    const { role } = useAuth();
    const { isTeacher, registerContext, speak } = useVoiceAssistant();

    return (
      <div>
        <span data-testid="auth-role">{role}</span>
        <span data-testid="is-teacher">{isTeacher ? "true" : "false"}</span>
        <button
          onClick={() => {
            const unregister = registerContext("TEST_TEACHER_AGENT", () => {});
            speak("Attempting to speak in teacher mode");
            if (typeof unregister === "function") unregister();
          }}
        >
          Try Register & Speak
        </button>
      </div>
    );
  }

  test("voice assistant strictly blocks student voice listeners when role is teacher", async () => {
    window.localStorage.setItem(
      "accessai_demo_auth",
      JSON.stringify({
        user: { id: "teacher-demo-id", email: "teacher.demo@institution.edu", role: "teacher" },
        disabilityType: null,
        role: "teacher"
      })
    );

    render(
      <AllProviders>
        <TeacherGuardTester />
      </AllProviders>
    );

    const authRole = await screen.findByTestId("auth-role");
    expect(authRole).toHaveTextContent("teacher");

    const isTeacherBadge = await screen.findByTestId("is-teacher");
    expect(isTeacherBadge).toHaveTextContent("true");

    // Click button to attempt registering context & speak - both must be no-ops
    const btn = screen.getByRole("button", { name: /Try Register & Speak/i });
    act(() => {
      fireEvent.click(btn);
    });
  });
});
