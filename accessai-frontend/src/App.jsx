import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing        from "./pages/Landing";
import DeafDashboard  from "./pages/DeafDashboard";
import BlindDashboard from "./pages/BlindDashboard";
import MotorDashboard from "./pages/MotorDashboard";
import DeafLogin      from "./pages/DeafLogin";
import DeafSignup     from "./pages/DeafSignup";
import BlindLogin     from "./pages/BlindLogin";
import BlindSignup    from "./pages/BlindSignup";
import MotorLogin     from "./pages/MotorLogin";
import MotorSignup    from "./pages/MotorSignup";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import DeafMeetingRoom from "./pages/DeafMeetingRoom";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherMeetingRoom from "./pages/TeacherMeetingRoom";

import { VoiceAssistantProvider } from "./context/VoiceAssistantContext";
import { LanguageProvider } from "./context/LanguageContext";
import { WalletProvider } from "./context/WalletContext";

export const LAST_ROUTE_STORAGE_KEY = "accessai_last_route";

export function getPersistedRoute() {
  if (typeof window === "undefined") return "/";
  try {
    const persisted = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY);
    return persisted && persisted.startsWith("/") ? persisted : "/";
  } catch (err) {
    return "/";
  }
}

export function saveCurrentRoute(pathname) {
  if (typeof window === "undefined") return;
  try {
    const safePath = pathname && pathname.startsWith("/") ? pathname : "/";
    window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, safePath);
  } catch (err) {
    // ignore storage failures in private browsing / restricted environments
  }
}

function RoutePersistence() {
  const location = useLocation();

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}${location.hash}` || "/";
    saveCurrentRoute(nextPath);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

// Protects /deaf /blind /motor — allows seamless switching and access to requested mode
function ProtectedRoute({ children, requiredMode }) {
  const { user, role, disabilityType, loginDemoUser } = useAuth();
  
  const isTeacher = role === "teacher" || user?.role === "teacher" || user?.user_metadata?.role === "teacher";
  const needsSwitch = isTeacher || !disabilityType || disabilityType !== requiredMode;

  useEffect(() => {
    if (user && needsSwitch && loginDemoUser) {
      loginDemoUser(requiredMode);
    }
  }, [user, needsSwitch, loginDemoUser, requiredMode]);

  if (!user) {
    return <Navigate to={`/${requiredMode}/login`} replace />;
  }

  return children;
}

// Protects /teacher routes — ensures only authenticated teachers can access
function TeacherProtectedRoute({ children }) {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/teacher/login" replace />;
  }

  const isTeacher = role === "teacher" || user?.role === "teacher" || user?.user_metadata?.role === "teacher";
  if (!isTeacher) {
    // Student attempted to access teacher routes - redirect safely away
    return <Navigate to="/" replace />;
  }

  return children;
}

// Redirect fallback for backward compatibility
function AuthRedirect() {
  const { mode } = useParams();
  return <Navigate to={`/${mode}/login`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing — language, role, and accessibility mode flows */}
      <Route path="/" element={<Landing />} />
      <Route path="/verify" element={<VerifyCertificatePage />} />

      {/* Accessible Two-Way Meeting Hub */}
      <Route path="/meeting" element={<DeafMeetingRoom />} />
      <Route path="/deaf/meeting" element={<DeafMeetingRoom />} />

      {/* Teacher dedicated authentication, workspace, and video meeting studio */}
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route
        path="/teacher/meeting/:roomId"
        element={
          <TeacherProtectedRoute>
            <TeacherMeetingRoom />
          </TeacherProtectedRoute>
        }
      />
      <Route
        path="/teacher/meeting"
        element={
          <TeacherProtectedRoute>
            <TeacherMeetingRoom />
          </TeacherProtectedRoute>
        }
      />
      <Route
        path="/teacher/*"
        element={
          <TeacherProtectedRoute>
            <TeacherDashboard />
          </TeacherProtectedRoute>
        }
      />

      {/* Student mode dashboards — protected */}
      <Route path="/deaf/*"  element={<ProtectedRoute requiredMode="deaf"><DeafDashboard /></ProtectedRoute>} />
      <Route path="/blind/*" element={<ProtectedRoute requiredMode="blind"><BlindDashboard /></ProtectedRoute>} />
      <Route path="/motor/*" element={<ProtectedRoute requiredMode="motor"><MotorDashboard /></ProtectedRoute>} />

      {/* Mode specific login/signup routes */}
      <Route path="/deaf/login" element={<DeafLogin />} />
      <Route path="/deaf/signup" element={<DeafSignup />} />
      <Route path="/blind/login" element={<BlindLogin />} />
      <Route path="/blind/signup" element={<BlindSignup />} />
      <Route path="/motor/login" element={<MotorLogin />} />
      <Route path="/motor/signup" element={<MotorSignup />} />

      {/* Generic login/signup shortcuts — route to landing role/mode selection */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signin" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />

      {/* Adaptive Authentication Fallback */}
      <Route path="/auth/:mode" element={<AuthRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <LanguageProvider>
          <VoiceAssistantProvider>
            <BrowserRouter>
              <RoutePersistence />
              <AppRoutes />
            </BrowserRouter>
          </VoiceAssistantProvider>
        </LanguageProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
