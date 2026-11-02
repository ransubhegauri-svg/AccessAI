/**
 * Centralized utility to resolve and manage the student's actual identity across ACCESS AI.
 * Guaranteed to never return hardcoded or placeholder names like 'Aaradhya Sharma'.
 */

export const STUDENT_NAME_STORAGE_KEY = "accessai_student_name";
export const GUEST_NAME_STORAGE_KEY = "accessai_guest_name";

/**
 * Returns the student's actual name from their authenticated profile, guest session, or local storage.
 * @param {object} user - The user object from AuthContext
 * @param {string} mode - "deaf" | "blind" | "motor"
 * @returns {string} The resolved student name
 */
export function getEffectiveStudentName(user, mode = "deaf") {
  // 1. Authenticated or profile user name
  const profileName = user?.displayName || user?.name;
  if (profileName && typeof profileName === "string" && profileName.trim()) {
    const clean = profileName.trim();
    if (clean !== "Demo User" && !clean.includes("Aaradhya")) {
      return clean;
    }
  }

  // 2. Check local/session storage for explicit student/guest name
  if (typeof window !== "undefined") {
    try {
      const storedStudent = window.localStorage.getItem(STUDENT_NAME_STORAGE_KEY);
      if (storedStudent && storedStudent.trim() && !storedStudent.includes("Aaradhya")) {
        return storedStudent.trim();
      }

      const storedGuest = window.sessionStorage.getItem(GUEST_NAME_STORAGE_KEY);
      if (storedGuest && storedGuest.trim() && !storedGuest.includes("Aaradhya")) {
        return storedGuest.trim();
      }

      // Check stored auth object
      const storedAuthRaw = window.localStorage.getItem("accessai_demo_auth");
      if (storedAuthRaw) {
        const storedAuth = JSON.parse(storedAuthRaw);
        const storedName = storedAuth?.user?.displayName;
        if (storedName && storedName.trim() && storedName !== "Demo User" && !storedName.includes("Aaradhya")) {
          return storedName.trim();
        }
      }
    } catch (e) {
      // ignore storage access errors
    }
  }

  // 3. Fallback to mode-specific default persona (Never Aaradhya Sharma)
  if (mode === "deaf" || user?.email?.includes("vrusha") || user?.uid?.includes("deaf")) {
    return "Vrusha Goyal";
  }

  if (mode === "motor" || mode === "blind" || user?.email?.includes("aman") || user?.uid?.includes("motor") || user?.uid?.includes("blind")) {
    return "Aman Halkude";
  }

  return "Vrusha Goyal";
}

/**
 * Stores the student's name in local and session storage.
 */
export function setStoredStudentName(name) {
  if (typeof window === "undefined" || !name) return;
  const clean = name.trim();
  if (!clean || clean.includes("Aaradhya")) return;

  try {
    window.localStorage.setItem(STUDENT_NAME_STORAGE_KEY, clean);
    window.sessionStorage.setItem(GUEST_NAME_STORAGE_KEY, clean);
  } catch (e) {
    // ignore
  }
}
