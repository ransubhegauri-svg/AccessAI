import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useLanguage } from "../context/LanguageContext";

// Supported Command Sign Mapping (Preserving all Legacy Gestures & Quick Commands)
export const SIGN_COMMANDS = [
  {
    gesture: "GUN_LEFT",
    signName: "Left Gun Sign",
    actionName: "Next Box / Forward",
    icon: "👈",
    targetTab: "next",
    description: "Moves focus to the next box/grid item sequentially with continuous hold wrap-around",
    avatarPose: "point_courses",
    speechText: "Next item."
  },
  {
    gesture: "GUN_RIGHT",
    signName: "Right Gun Sign",
    actionName: "Previous Box / Sidebar",
    icon: "👉",
    targetTab: "prev",
    description: "Moves focus backwards, transitioning from Box 0 into Sidebar and Nova",
    avatarPose: "wave",
    speechText: "Previous item."
  },
  {
    gesture: "Thumb_Up",
    signName: "Thumbs Up",
    actionName: "Select / Open Box",
    icon: "👍",
    targetTab: "select",
    description: "Opens the currently focused grid box item dynamically",
    avatarPose: "thumbs_up",
    speechText: "Selected."
  },
  {
    gesture: "Pointing_Up",
    signName: "Point Up / Index",
    actionName: "Course Library",
    icon: "☝️",
    targetTab: "courses",
    description: "Immediately navigates to Course Library",
    avatarPose: "point_courses",
    speechText: "Opening Course Library."
  },
  {
    gesture: "Victory",
    signName: "Peace / Two",
    actionName: "Home Dashboard",
    icon: "✌️",
    targetTab: "home",
    description: "Returns to your main Deaf/Mute Dashboard overview",
    avatarPose: "wave",
    speechText: "Taking you to the home dashboard."
  },
  {
    gesture: "Closed_Fist",
    signName: "Fist",
    actionName: "Back / Close",
    icon: "✊",
    targetTab: "back",
    description: "Executes Back or closes active modal",
    avatarPose: "nod",
    speechText: "Going back."
  },
  {
    gesture: "Open_Palm",
    signName: "Open Palm / Wave",
    actionName: "Sign Guide & Help",
    icon: "✋",
    targetTab: "sign-guide",
    description: "Opens the full Sign Guide in the left sidebar",
    avatarPose: "wave",
    speechText: "Opening the Sign Guide."
  },
  {
    gesture: "SCROLL_UP",
    signName: "Scroll Up",
    actionName: "Scroll Up",
    icon: "🔼",
    targetTab: "scroll_up",
    description: "Smoothly scrolls the page up",
    avatarPose: "point_courses",
    speechText: "Scrolling up."
  },
  {
    gesture: "SCROLL_DOWN",
    signName: "Scroll Down",
    actionName: "Scroll Down",
    icon: "🔽",
    targetTab: "scroll_down",
    description: "Smoothly scrolls the page down",
    avatarPose: "nod",
    speechText: "Scrolling down."
  }
];

const GESTURE_CONFIG = {
  INITIAL_HOLD_DELAY_MS: 1000,  // Exact 1.0s hold delay required before auto-repeat
  REPEAT_INTERVAL_MS: 500,       // Controlled step pace (500ms per item)
  CONFIDENCE_THRESHOLD: 0.82,   // MediaPipe detection confidence floor
  SCROLL_DEADZONE: 0.035,        // Threshold to eliminate micro-jitters during scrolling
  SMOOTHING_FACTOR: 0.20         // EWMA filter weight for smooth scrolling
};

// Permanent high-contrast focus glow injection (outline: 3px solid #3b82f6)
const STYLE_ID = "accessai-gesture-focus-style";
function injectFocusStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .focused-glow,
    .focus-glow,
    .focused,
    .active-gesture-target,
    [data-accessai-active="true"] {
      outline: 3px solid #3b82f6 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 2px #ffffff,
                  0 0 16px 4px rgba(59, 130, 246, 0.90),
                  0 0 32px 8px rgba(59, 130, 246, 0.55),
                  inset 0 0 10px rgba(59, 130, 246, 0.30) !important;
      border-radius: 12px !important;
      transition: outline 0.12s ease-in-out, box-shadow 0.15s ease-in-out !important;
      z-index: 9999 !important;
      position: relative !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// Find scrollable container
function getScrollableContainer() {
  if (typeof document === "undefined") return null;
  const main = document.querySelector("main.overflow-y-auto") || document.querySelector("main");
  if (main && (main.scrollHeight > main.clientHeight)) return main;
  return window;
}

// Proportional smooth scroll
function smoothScrollBy(deltaY) {
  if (typeof window === "undefined") return;
  const container = getScrollableContainer();
  if (container && container !== window && typeof container.scrollBy === "function") {
    try {
      container.scrollBy({ top: deltaY, behavior: "smooth" });
    } catch(e) {
      container.scrollTop += deltaY;
    }
  } else {
    try {
      window.scrollBy({ top: deltaY, behavior: "smooth" });
    } catch(e) {
      window.scrollBy(0, deltaY);
    }
  }
}

// ======================================================================================
// INTEGRATED GESTURE CONTROLLER (Strict Hand Delegation: Left = Main Grid, Right = Sidebar/Nova)
// ======================================================================================
class IntegratedGestureController {
  constructor(callbacks = {}) {
    this.gridElements = [];
    this.sidebarElements = [];
    this.currentGridIndex = -1;
    this.currentSidebarIndex = -1;
    this.activeFocusDomain = null; // 'grid' or 'sidebar'

    this.holdTimer = null;
    this.repeatTimer = null;
    this.currentActiveGesture = null;
    this.smoothY = null;
    this.callbacks = callbacks;
    this.init();
  }

  init() {
    injectFocusStyles();
    this.refreshDOMLists();
    this.registerLegacyAndQuickCommands();
  }

  refreshDOMLists() {
    if (typeof document === "undefined") return;

    // 1. Sidebar items: prioritize buttons inside <aside nav> in exact DOM order, followed by Nova launcher
    const navButtons = Array.from(document.querySelectorAll('aside nav button, #deaf-sidebar nav button'));
    const otherSidebar = Array.from(document.querySelectorAll(
      '.sidebar a, .sidebar button, #sidebar a, #sidebar button, .sidebar-item, .sidebar-link, .nav-item, #overview, #honors, #career, #rewards, #course-library, #my-learning, #sign-practice, #ai-tutor, #activity-dashboard, #profile, [data-focusable="sidebar"]'
    ));
    const novaButtons = Array.from(document.querySelectorAll(
      'button[title*="Toggle AI"], button[title*="Nova"], #nova, .nova-btn, [data-nav="nova"]'
    ));

    const combinedSidebar = [...navButtons, ...otherSidebar, ...novaButtons].filter(el => {
      if (!el || el.offsetParent === null) return false;
      const title = (el.getAttribute('title') || '').toLowerCase();
      if (title.includes('sign out') || title.includes('logout')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    this.sidebarElements = Array.from(new Set(combinedSidebar));

    // Select main grid cards and interactive elements
    const gridItems = Array.from(document.querySelectorAll(
      '.grid-card, .course-card, .box, .card, [data-focusable="grid"], main .grid > div.cursor-pointer, main .grid > div[class*="rounded"], main .grid > div[role="button"], main .grid > div, main div.cursor-pointer[class*="rounded"], main .grid > [tabindex="0"], main .card, main button.border-2, main [role="button"]:not([aria-disabled="true"]), main button:not([disabled]), main a[href]'
    )).filter(el => {
      if (!el || el.offsetParent === null) return false;
      if (el.closest('#deaf-sidebar') || el.closest('aside') || el.closest('header')) return false;
      if (el.closest('.fixed.bottom-6.right-6')) return false; // Exclude Nova floating window itself
      const text = (el.textContent || '').trim().toLowerCase();
      if (text.includes('open sign arena') || text.includes('sign practice')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    // Deduplicate and sort grid items left-to-right, top-to-bottom
    const uniqueGrid = Array.from(new Set(gridItems));
    uniqueGrid.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) > 25) return ra.top - rb.top;
      return ra.left - rb.left;
    });

    this.gridElements = uniqueGrid;
  }

  // --- 1. LEFT HAND GUN: MAIN PAGE GRID TRAVERSAL ---
  moveNextMainGrid() {
    this.refreshDOMLists();
    if (this.gridElements.length === 0) return;

    this.activeFocusDomain = 'grid';
    this.currentGridIndex = (this.currentGridIndex + 1) % this.gridElements.length;

    // Row wrap auto-scroll for grid cards
    const activeEl = this.gridElements[this.currentGridIndex];
    if (activeEl && this.currentGridIndex > 0 && this.currentGridIndex % 3 === 0) {
      smoothScrollBy(150);
    }

    this.updateUIFocus();
  }

  // --- 2. RIGHT HAND GUN: SIDEBAR & NOVA TRAVERSAL ---
  moveNextSidebarItem() {
    this.refreshDOMLists();
    if (this.sidebarElements.length === 0) return;

    this.activeFocusDomain = 'sidebar';
    this.currentSidebarIndex = (this.currentSidebarIndex + 1) % this.sidebarElements.length;
    this.updateUIFocus();
  }

  // Backward support for Left Hand Gun
  movePrevMainGrid() {
    this.refreshDOMLists();
    if (this.gridElements.length === 0) return;

    this.activeFocusDomain = 'grid';
    this.currentGridIndex = (this.currentGridIndex - 1 + this.gridElements.length) % this.gridElements.length;
    this.updateUIFocus();
  }

  // Backward support for Sidebar
  movePrevSidebarItem() {
    this.refreshDOMLists();
    if (this.sidebarElements.length === 0) return;

    this.activeFocusDomain = 'sidebar';
    this.currentSidebarIndex = (this.currentSidebarIndex - 1 + this.sidebarElements.length) % this.sidebarElements.length;
    this.updateUIFocus();
  }

  updateUIFocus() {
    // Clear previous focus classes and inline outline styles
    [...this.gridElements, ...this.sidebarElements].forEach(el => {
      el.classList.remove('focused', 'active-gesture-target', 'focused-glow');
      el.removeAttribute('data-accessai-active');
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
    });

    let currentFocusedEl = null;

    if (this.activeFocusDomain === 'grid' && this.currentGridIndex >= 0 && this.currentGridIndex < this.gridElements.length) {
      currentFocusedEl = this.gridElements[this.currentGridIndex];
    } else if (this.activeFocusDomain === 'sidebar' && this.currentSidebarIndex >= 0 && this.currentSidebarIndex < this.sidebarElements.length) {
      currentFocusedEl = this.sidebarElements[this.currentSidebarIndex];
    }

    if (currentFocusedEl) {
      currentFocusedEl.classList.add('focused', 'active-gesture-target', 'focused-glow');
      currentFocusedEl.setAttribute('data-accessai-active', 'true');
      
      // Inline styles guarantee visual glow even if CSS specificity conflicts
      currentFocusedEl.style.outline = '3px solid #3b82f6';
      currentFocusedEl.style.outlineOffset = '3px';
      currentFocusedEl.style.boxShadow = '0 0 0 2px #ffffff, 0 0 16px 4px rgba(59, 130, 246, 0.90), 0 0 32px 8px rgba(59, 130, 246, 0.55)';
      currentFocusedEl.style.borderRadius = '12px';
      currentFocusedEl.style.transition = 'outline 0.12s ease-in-out, box-shadow 0.15s ease-in-out';

      if (!currentFocusedEl.hasAttribute('tabindex')) currentFocusedEl.setAttribute('tabindex', '-1');
      try { currentFocusedEl.focus({ preventScroll: true }); } catch(e) {}
      currentFocusedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // --- 3. DYNAMIC SELECTION (THUMBS UP) ---
  activateCurrentSelection() {
    this.refreshDOMLists();
    let activeEl = null;

    if (this.activeFocusDomain === 'grid' && this.currentGridIndex >= 0 && this.currentGridIndex < this.gridElements.length) {
      activeEl = this.gridElements[this.currentGridIndex];
    } else if (this.activeFocusDomain === 'sidebar' && this.currentSidebarIndex >= 0 && this.currentSidebarIndex < this.sidebarElements.length) {
      activeEl = this.sidebarElements[this.currentSidebarIndex];
    } else {
      activeEl = document.querySelector('.focused, .active-gesture-target, .focused-glow, [data-accessai-active="true"]');
    }

    if (!activeEl) return;

    // 1. Check for specific video/modal data attributes first
    if (activeEl.dataset && activeEl.dataset.videoId && typeof window.openVideoModal === 'function') {
      window.openVideoModal(activeEl.dataset.videoId);
      return;
    }

    const videoChild = activeEl.querySelector('[data-video-id]');
    if (videoChild && videoChild.dataset.videoId && typeof window.openVideoModal === 'function') {
      window.openVideoModal(videoChild.dataset.videoId);
      return;
    }

    // 2. Trigger internal action button if present (e.g. "Start Course", "Launch Course Player", "View Details")
    const innerAction = activeEl.querySelector('button, a[href], [role="button"]');
    if (innerAction && innerAction !== activeEl) {
      try {
        innerAction.click();
        return;
      } catch (e) {}
    }

    // 3. Trigger React internal props onClick if available
    try {
      const reactKey = Object.keys(activeEl).find(k => k.startsWith('__reactProps'));
      if (reactKey && activeEl[reactKey] && typeof activeEl[reactKey].onClick === 'function') {
        activeEl[reactKey].onClick({
          stopPropagation: () => {},
          preventDefault: () => {},
          target: activeEl,
          currentTarget: activeEl
        });
        return;
      }
    } catch (e) {}

    // 4. Native click event dispatch
    try {
      activeEl.click();
    } catch (e) {
      console.warn('Click activation error:', e);
    }
  }

  // Aliases for compatibility
  moveNext() {
    this.moveNextMainGrid();
  }

  movePrevious() {
    this.moveNextSidebarItem();
  }

  // --- LEGACY GESTURES & QUICK COMMANDS ---
  registerLegacyAndQuickCommands() {
    this.legacyCommands = {
      'INDEX_FINGER_UP': () => {
        const courseLibBtn = document.querySelector('#course-library, [href*="course-library"], [href*="/courses"], .course-library-btn, button[data-tab="courses"]');
        if (courseLibBtn) {
          courseLibBtn.click();
        } else if (typeof this.callbacks.onNavigate === 'function') {
          this.callbacks.onNavigate('courses');
        } else {
          window.location.href = '/deaf/courses';
        }
      },
      'VICTORY': () => {
        const homeBtn = document.querySelector('#home, [href*="home"], [href*="/deaf"], button[data-tab="home"]');
        if (homeBtn) {
          homeBtn.click();
        } else if (typeof this.callbacks.onNavigate === 'function') {
          this.callbacks.onNavigate('home');
        } else {
          window.location.href = '/deaf';
        }
      },
      'FIST': () => {
        const closeBtn = document.querySelector('.modal-close, .btn-back, button[aria-label="Close"], button[title="Close"]');
        if (closeBtn) {
          closeBtn.click();
        } else if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
        } else if (typeof this.callbacks.onNavigate === 'function') {
          this.callbacks.onNavigate('home');
        }
      },
      'OPEN_PALM': () => {
        if (typeof this.callbacks.onNavigate === 'function') {
          this.callbacks.onNavigate('sign-guide');
        }
      }
    };
  }

  // --- 1.0 SECOND HOLD TIMING ENGINE WITH DEBOUNCE RESILIENCE ---
  handleContinuousGesture(gestureName, actionCallback) {
    if (this.clearGraceTimer) {
      clearTimeout(this.clearGraceTimer);
      this.clearGraceTimer = null;
    }

    if (this.currentActiveGesture === gestureName) return;

    this.clearGestureTimers();
    this.currentActiveGesture = gestureName;

    // Immediate step on initial frame
    actionCallback();

    // Enforce 1000ms delay before engagement of step repetition
    this.holdTimer = setTimeout(() => {
      this.repeatTimer = setInterval(() => {
        actionCallback();
      }, GESTURE_CONFIG.REPEAT_INTERVAL_MS);
    }, GESTURE_CONFIG.INITIAL_HOLD_DELAY_MS);
  }

  scheduleClearGestureTimers() {
    if (this.clearGraceTimer) return;
    // 250ms grace period prevents single-frame tracking drop from interrupting 1.0s continuous hold
    this.clearGraceTimer = setTimeout(() => {
      this.clearGestureTimers();
      this.clearGraceTimer = null;
    }, 250);
  }

  clearGestureTimers() {
    if (this.clearGraceTimer) clearTimeout(this.clearGraceTimer);
    if (this.holdTimer) clearTimeout(this.holdTimer);
    if (this.repeatTimer) clearInterval(this.repeatTimer);
    this.clearGraceTimer = null;
    this.holdTimer = null;
    this.repeatTimer = null;
    this.currentActiveGesture = null;
  }

  // --- VERTICAL SCROLLING ENGINE ---
  handleVerticalScroll(currentY) {
    if (this.smoothY === null) {
      this.smoothY = currentY;
      return;
    }

    // Low-pass EWMA filter for smoothing raw MediaPipe landmark Y coordinates
    this.smoothY = (GESTURE_CONFIG.SMOOTHING_FACTOR * currentY) + ((1 - GESTURE_CONFIG.SMOOTHING_FACTOR) * this.smoothY);
    const deltaY = currentY - this.smoothY;

    if (Math.abs(deltaY) > GESTURE_CONFIG.SCROLL_DEADZONE) {
      const scrollSpeedMultiplier = 1200;
      const scrollAmount = deltaY * scrollSpeedMultiplier;

      // Target scrollable container (e.g. main.overflow-y-auto in DeafDashboard)
      const scrollContainer = document.querySelector('main.overflow-y-auto, main, [class*="overflow-y-auto"], #root');
      if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        try {
          scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        } catch(e) {
          scrollContainer.scrollTop += scrollAmount;
        }
      }
      try {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } catch(e) {
        window.scrollBy(0, scrollAmount);
      }
    }
  }
}

export default function SignAvatarAssistant({
  onNavigate,
  onOpenSignPractice,
  onSelect,
  isLight = false,
  className = "",
  embedded = false,
  isPracticeMode = false
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(true); // Floating window open/close state
  const [isMinimized, setIsMinimized] = useState(false); // Mini mode vs full window
  const [isEmbeddedMinimized, setIsEmbeddedMinimized] = useState(isPracticeMode);
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' | 'chat'

  // When practice mode opens, automatically minimize Nova Sign AI into the bottom button
  useEffect(() => {
    if (isPracticeMode) {
      setIsEmbeddedMinimized(true);
      if (cameraActive) {
        stopCamera();
      }
    }
  }, [isPracticeMode]);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  
  // Real-time Detection State
  const [detectedGesture, setDetectedGesture] = useState("None");
  const [detectedConfidence, setDetectedConfidence] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
  const [audioVoiceEnabled, setAudioVoiceEnabled] = useState(false); // Silent by default for deaf users
  
  // Initialize Gesture Controller
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new IntegratedGestureController({
      onNavigate,
      onOpenSignPractice,
      onSelect,
      setActiveTab
    });
  }
  controllerRef.current.callbacks = {
    onNavigate,
    onOpenSignPractice,
    onSelect,
    setActiveTab
  };

  // Localized Commands preserving all legacy & quick command gestures with strict Hand-Role Delegation
  const commands = useMemo(() => [
    {
      gesture: "GUN_LEFT",
      signName: language === "hi" ? "बायाँ गन संकेत" : language === "kn" ? "ಎಡ ಗನ್ ಸನ್ನೆ" : "Left Gun Sign",
      actionName: t("cmd_grid_action", "Main Grid Forward"),
      icon: "👈",
      targetTab: "grid",
      description: "Controls focus navigation on Main Page & Grid items (Left-to-Right)",
      avatarPose: "point_courses",
      speechText: "Next grid item."
    },
    {
      gesture: "GUN_RIGHT",
      signName: language === "hi" ? "दायाँ गन संकेत" : language === "kn" ? "ಬಲ ಗನ್ ಸನ್ನೆ" : "Right Gun Sign",
      actionName: t("cmd_sidebar_action", "Sidebar & Nova"),
      icon: "👉",
      targetTab: "sidebar",
      description: "Controls focus navigation specifically within Sidebar items and Nova",
      avatarPose: "wave",
      speechText: "Next sidebar item."
    },
    {
      gesture: "Thumb_Up",
      signName: language === "hi" ? "अंगूठा ऊपर / पुष्टि" : language === "kn" ? "ಹೆಬ್ಬೆರಳು ಮೇಲೆ / ದೃಢೀಕರಣ" : "Thumbs Up",
      actionName: t("cmd_select_action", "Select / Open Box"),
      icon: "👍",
      targetTab: "select",
      description: "Opens whichever box or sidebar item is currently focused dynamically",
      avatarPose: "thumbs_up",
      speechText: language === "hi" ? "चयनित।" : language === "kn" ? "ಆಯ್ಕೆಯಾಗಿದೆ." : "Selected."
    },
    {
      gesture: "Pointing_Up",
      signName: language === "hi" ? "तर्जनी ऊपर" : language === "kn" ? "ತೋರುಬೆರಳು ಮೇಲೆ" : "Point Up / Index",
      actionName: t("cmd_courses_action", "Course Library"),
      icon: "☝️",
      targetTab: "courses",
      description: "Immediately opens Course Library",
      avatarPose: "point_courses",
      speechText: "Opening Course Library."
    },
    {
      gesture: "Victory",
      signName: language === "hi" ? "शांति संकेत" : language === "kn" ? "ಶಾಂತಿ ಸನ್ನೆ" : "Peace / Two",
      actionName: t("cmd_home_action", "Home Dashboard"),
      icon: "✌️",
      targetTab: "home",
      description: "Returns to your main Deaf/Mute Dashboard overview",
      avatarPose: "wave",
      speechText: "Taking you to the home dashboard."
    },
    {
      gesture: "Closed_Fist",
      signName: language === "hi" ? "मुट्ठी / वापस" : language === "kn" ? "मुಷ್ಟಿ / ಹಿಂದಕ್ಕೆ" : "Fist",
      actionName: t("cmd_back_action", "Back / Close"),
      icon: "✊",
      targetTab: "back",
      description: t("cmd_back_desc", "Closes modal or navigates back"),
      avatarPose: "nod",
      speechText: language === "hi" ? "पीछे जा रहा हूँ।" : language === "kn" ? "ಹಿಂದಕ್ಕೆ ಹೋಗಲಾಗುತ್ತಿದೆ." : "Going back."
    },
    {
      gesture: "Open_Palm",
      signName: language === "hi" ? "खुली हथेली / नमस्ते" : language === "kn" ? "ತೆರೆದ ಅಂಗೈ / ನಮಸ್ಕಾರ" : "Open Palm / Wave",
      actionName: t("cmd_help_action", "Help & Commands"),
      icon: "✋",
      targetTab: "help",
      description: t("cmd_help_desc", "Asks the AI Avatar for help and displays available sign commands"),
      avatarPose: "wave",
      speechText: language === "hi" ? "नमस्ते! यहाँ उपलब्ध सांकेतिक आदेश हैं।" : language === "kn" ? "ನಮಸ್ಕಾರ! ಇಲ್ಲಿ ಲಭ್ಯವಿರುವ ಸನ್ನೆ ಆಜ್ಞೆಗಳಿವೆ." : "Hello! Here are the sign commands I can recognize."
    },
    {
      gesture: "SCROLL_UP",
      signName: language === "hi" ? "ऊपर स्क्रॉल करें" : language === "kn" ? "ಮೇಲಕ್ಕೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ" : "Scroll Up",
      actionName: "Scroll Up",
      icon: "🔼",
      targetTab: "scroll_up",
      description: "Smoothly scrolls the page up",
      avatarPose: "point_courses",
      speechText: "Scrolling up."
    },
    {
      gesture: "SCROLL_DOWN",
      signName: language === "hi" ? "नीचे स्क्रॉल करें" : language === "kn" ? "ಕೆಳಕ್ಕೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ" : "Scroll Down",
      actionName: "Scroll Down",
      icon: "🔽",
      targetTab: "scroll_down",
      description: "Smoothly scrolls the page down",
      avatarPose: "nod",
      speechText: "Scrolling down."
    }
  ], [t, language]);

  const commandsRef = useRef(commands);
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  // Avatar Animation State
  const [avatarAction, setAvatarAction] = useState("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [captionText, setCaptionText] = useState(t("nova_greeting"));
  const [avatarMood, setAvatarMood] = useState("ready"); // 'ready' | 'listening' | 'recognized' | 'executing'
  
  // Chat History Feed
  const [chatHistory, setChatHistory] = useState([
    {
      id: "init-1",
      sender: "nova",
      text: t("nova_greeting"),
      time: "Just now"
    }
  ]);

  // Refs for video & loop
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Gesture state tracking refs
  const holdGestureRef = useRef("None");
  const holdStartRef = useRef(0);
  const lastTriggeredTimeRef = useRef(0);

  // Avatar speech and captions helper
  const triggerAvatarResponse = useCallback((caption, avatarPose = "nod", speechVoiceText = "") => {
    setCaptionText(caption);
    setAvatarAction(avatarPose);
    setIsSpeaking(true);

    setChatHistory((prev) => [
      ...prev,
      {
        id: "msg-" + Date.now(),
        sender: "nova",
        text: caption,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    if (audioVoiceEnabled && speechVoiceText && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(speechVoiceText);
      utt.rate = 1.0;
      utt.pitch = 1.05;
      utt.onend = () => {
        setIsSpeaking(false);
        setTimeout(() => setAvatarAction("idle"), 800);
      };
      utt.onerror = () => {
        setIsSpeaking(false);
        setTimeout(() => setAvatarAction("idle"), 800);
      };
      window.speechSynthesis.speak(utt);
    } else {
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
      setTimeout(() => {
        setAvatarAction("idle");
      }, 3000);
    }
  }, [audioVoiceEnabled]);

  // Fast Sign Command dispatcher for UI pills and legacy bindings
  const executeSignAction = useCallback((command) => {
    if (!command) return;
    const now = Date.now();
    lastTriggeredTimeRef.current = now;
    setAvatarMood("executing");

    setChatHistory((prev) => [
      ...prev,
      {
        id: "sign-" + Date.now(),
        sender: "user",
        text: `${command.icon} Signed: "${command.signName}"`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    triggerAvatarResponse(
      `✨ Executing Sign: "${command.actionName}"!`,
      command.avatarPose || "nod",
      command.speechText || ""
    );

    const ctrl = controllerRef.current;
    if (!ctrl) return;

    if (command.gesture === "GUN_LEFT") {
      ctrl.moveNextMainGrid();
    } else if (command.gesture === "GUN_RIGHT") {
      ctrl.moveNextSidebarItem();
    } else if (command.gesture === "Thumb_Up") {
      ctrl.activateCurrentSelection();
    } else if (command.gesture === "Pointing_Up" || command.targetTab === "courses") {
      if (ctrl.legacyCommands["INDEX_FINGER_UP"]) ctrl.legacyCommands["INDEX_FINGER_UP"]();
    } else if (command.gesture === "Victory" || command.targetTab === "home") {
      if (ctrl.legacyCommands["VICTORY"]) ctrl.legacyCommands["VICTORY"]();
    } else if (command.gesture === "Closed_Fist" || command.targetTab === "back") {
      if (ctrl.legacyCommands["FIST"]) ctrl.legacyCommands["FIST"]();
    } else if (command.gesture === "Open_Palm" || command.targetTab === "help") {
      if (ctrl.legacyCommands["OPEN_PALM"]) ctrl.legacyCommands["OPEN_PALM"]();
    } else if (command.gesture === "SCROLL_UP") {
      smoothScrollBy(-260);
    } else if (command.gesture === "SCROLL_DOWN") {
      smoothScrollBy(260);
    }
  }, [triggerAvatarResponse]);

  // Route Change Listener and MutationObserver for Continuous Traversal & Focus
  useEffect(() => {
    const handleRoute = () => {
      if (controllerRef.current) {
        controllerRef.current.currentGridIndex = 0;
        controllerRef.current.activeFocusDomain = 'grid';
        controllerRef.current.refreshDOMLists();
        controllerRef.current.updateUIFocus();
      }
    };

    window.addEventListener("popstate", handleRoute);
    window.addEventListener("hashchange", handleRoute);

    const observer = new MutationObserver((mutations) => {
      let relevant = false;
      for (const m of mutations) {
        if (m.target && m.target.id === STYLE_ID) continue;
        relevant = true;
        break;
      }
      if (!relevant) return;

      if (controllerRef.current) {
        controllerRef.current.refreshDOMLists();
        const focusedEl = document.querySelector(".focused, .focused-glow, [data-accessai-active='true']");
        if (!focusedEl && controllerRef.current.gridElements.length > 0) {
          if (controllerRef.current.currentGridIndex === -1) {
            controllerRef.current.currentGridIndex = 0;
            controllerRef.current.activeFocusDomain = 'grid';
          }
          controllerRef.current.updateUIFocus();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("popstate", handleRoute);
      window.removeEventListener("hashchange", handleRoute);
      observer.disconnect();
      if (controllerRef.current) {
        controllerRef.current.clearGestureTimers();
      }
    };
  }, []);

  // Initialize MediaPipe Gesture Recognizer with 2 hands
  useEffect(() => {
    let isMounted = true;
    async function initGestureEngine() {
      try {
        setModelLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        if (!isMounted) return;

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });

        if (!isMounted) return;
        recognizerRef.current = recognizer;
        setModelLoading(false);
      } catch (err) {
        console.warn("Failed GPU MediaPipe init, trying CPU fallback:", err);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
          );
          const recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 2
          });
          if (isMounted) {
            recognizerRef.current = recognizer;
            setModelLoading(false);
          }
        } catch (cpuErr) {
          console.error("Critical MediaPipe Error:", cpuErr);
          if (isMounted) {
            setModelError("Unable to load Sign Gesture Recognizer on this device.");
            setModelLoading(false);
          }
        }
      }
    }

    initGestureEngine();

    return () => {
      isMounted = false;
      stopCamera();
      if (recognizerRef.current) {
        recognizerRef.current.close();
      }
    };
  }, []);

  // Video element playback hook
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().then(() => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(predictLoop);
      }).catch((err) => {
        console.warn("Video playback exception:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  // Start Webcam
  const startCamera = async () => {
    try {
      setModelError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.log("Play on start:", e);
        }
      }
      setCameraActive(true);
      setAvatarMood("listening");
      setAvatarAction("sign_asl");
      triggerAvatarResponse("👀 Camera active! Watching for your sign commands...", "wave", "Camera connected. Watching for your signs.");
    } catch (err) {
      console.error("Camera access error:", err);
      setModelError("Camera access denied or unavailable: " + (err.message || ""));
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (controllerRef.current) {
      controllerRef.current.clearGestureTimers();
      controllerRef.current.smoothY = null;
    }
    setCameraActive(false);
    setDetectedGesture("None");
    setHoldProgress(0);
    setAvatarMood("ready");
    setAvatarAction("idle");
  };

  // Landmark Geometric Classifier: Dual-Hand Gun, Thumbs Up, Pointing Up, Victory, Fist, Open Palm
  const classifyLandmarks = (lm, handednessStr) => {
    if (!lm || lm.length < 21) return null;

    const d = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const wrist = lm[0];

    const isExt = (tip, pip, mcp) => d(lm[tip], wrist) > d(lm[pip], wrist) * 1.12 && d(lm[pip], wrist) > d(lm[mcp], wrist) * 0.95;
    const isCurl = (tip, pip, mcp) => d(lm[tip], wrist) < d(lm[pip], wrist) * 1.05 || d(lm[tip], wrist) < d(lm[mcp], wrist) * 1.15;

    const thumbExt = d(lm[4], lm[9]) > d(lm[2], lm[9]) * 1.25;
    const thumbCurl = d(lm[4], lm[9]) < d(lm[2], lm[9]) * 1.15;

    const indexExt = isExt(8, 6, 5);
    const indexCurl = isCurl(8, 6, 5);
    const middleExt = isExt(12, 10, 9);
    const middleCurl = isCurl(12, 10, 9);
    const ringExt = isExt(16, 14, 13);
    const ringCurl = isCurl(16, 14, 13);
    const pinkyExt = isExt(20, 18, 17);
    const pinkyCurl = isCurl(20, 18, 17);

    // 1. Thumbs Up: Thumb extended, 4 fingers curled, thumb tip above MCP
    if (thumbExt && indexCurl && middleCurl && ringCurl && pinkyCurl && lm[4].y < lm[2].y - 0.04) {
      return { name: "Thumb_Up", score: 0.95 };
    }

    // 2. Open Palm: All 5 fingers extended
    if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
      return { name: "Open_Palm", score: 0.95 };
    }

    // 3. Closed Fist: All fingers curled
    if (thumbCurl && indexCurl && middleCurl && ringCurl && pinkyCurl) {
      return { name: "Closed_Fist", score: 0.92 };
    }

    // 4. Pointing Up: Index extended, Middle/Ring/Pinky curled, pointing upward
    if (indexExt && middleCurl && ringCurl && pinkyCurl && lm[8].y < lm[6].y - 0.05) {
      return { name: "Pointing_Up", score: 0.93 };
    }

    // 5. Victory / Peace Sign: Index and Middle extended, Ring/Pinky curled
    if (indexExt && middleExt && ringCurl && pinkyCurl) {
      return { name: "Victory", score: 0.92 };
    }

    // 6. Dual-Hand Gun Sign: Index extended, Thumb extended, Middle/Ring/Pinky curled
    if (indexExt && thumbExt && (middleCurl || !middleExt) && (ringCurl || !ringExt) && (pinkyCurl || !pinkyExt)) {
      // In webcam selfie mirror mode (CSS -scale-x-100):
      // Raw lm[8].x < lm[5].x -> points Right 👉 on mirrored screen (Right Hand Gun)
      // Raw lm[8].x > lm[5].x -> points Left 👈 on mirrored screen (Left Hand Gun)
      const dxRaw = lm[8].x - lm[5].x;
      let gesture = "GUN_RIGHT";
      if (dxRaw > 0.02) {
        gesture = "GUN_LEFT";  // Pointing Left 👈
      } else if (dxRaw < -0.02) {
        gesture = "GUN_RIGHT"; // Pointing Right 👉
      } else {
        // Fallback to chirality if pointing mostly vertical or forward
        gesture = (handednessStr === "Left") ? "GUN_RIGHT" : "GUN_LEFT";
      }
      return { name: gesture, score: 0.95 };
    }

    // 7. Vertical Scroll Up/Down via Index
    if (indexExt && middleCurl && ringCurl && pinkyCurl) {
      if (lm[8].y < lm[6].y - 0.08) {
        return { name: "SCROLL_UP", score: 0.88 };
      } else if (lm[8].y > lm[6].y + 0.08) {
        return { name: "SCROLL_DOWN", score: 0.88 };
      }
    }

    return null;
  };

  // Real-time Detection Loop with Auto-Repeat Continuous Traversal & EWMA Vertical Scroll
  const predictLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recognizer = recognizerRef.current;
    const controller = controllerRef.current;

    if (!video || !canvas || !recognizer || !streamRef.current || !controller) return;

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        const startTimeMs = performance.now();
        const results = recognizer.recognizeForVideo(video, startTimeMs);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeGestureName = "None";
        let confidenceScore = 0;

        if (results && results.landmarks && results.landmarks.length > 0) {
          const firstHandLandmarks = results.landmarks[0];
          const handednessStr = results.handednesses && results.handednesses[0] && results.handednesses[0][0]
            ? results.handednesses[0][0].categoryName
            : "Right";

          // 1. First priority: Geometric landmark classification
          const geom = classifyLandmarks(firstHandLandmarks, handednessStr);
          if (geom) {
            activeGestureName = geom.name;
            confidenceScore = Math.round(geom.score * 100);
          } else if (results.gestures && results.gestures[0] && results.gestures[0][0]) {
            const topStock = results.gestures[0][0];
            if (topStock.categoryName !== "ILoveYou") {
              activeGestureName = topStock.categoryName;
              confidenceScore = Math.round(topStock.score * 100);
            }
          }

          // Draw skeleton landmarks on video canvas
          drawHandLandmarks(ctx, firstHandLandmarks, canvas.width, canvas.height, activeGestureName);

          // 2. High-Accuracy Vertical Scrolling with EWMA Low-Pass Filter (landmarks[8].y)
          if (activeGestureName === "Open_Palm" || activeGestureName === "Victory" || activeGestureName === "SCROLL_UP" || activeGestureName === "SCROLL_DOWN") {
            controller.handleVerticalScroll(firstHandLandmarks[8].y); // Index finger tip Y
          } else {
            controller.smoothY = null;
          }

          // 3. Continuous Auto-Repeat State Machine for Navigation & Selection
          const now = performance.now();

          if (activeGestureName === "GUN_LEFT") {
            if (controller.clearGraceTimer) {
              clearTimeout(controller.clearGraceTimer);
              controller.clearGraceTimer = null;
            }
            controller.handleContinuousGesture("GUN_LEFT", () => {
              controller.moveNextMainGrid(); // Hand-role delegation: Left Hand Gun controls Main Page Grid
              setAvatarMood("executing");
            });
            setAvatarMood("recognized");
            if (holdGestureRef.current !== "GUN_LEFT") {
              holdGestureRef.current = "GUN_LEFT";
              holdStartRef.current = now;
              setHoldProgress(10);
            } else {
              const elapsed = now - holdStartRef.current;
              setHoldProgress(Math.min(100, Math.round((elapsed / GESTURE_CONFIG.INITIAL_HOLD_DELAY_MS) * 100)));
            }
          } else if (activeGestureName === "GUN_RIGHT") {
            if (controller.clearGraceTimer) {
              clearTimeout(controller.clearGraceTimer);
              controller.clearGraceTimer = null;
            }
            controller.handleContinuousGesture("GUN_RIGHT", () => {
              controller.moveNextSidebarItem(); // Hand-role delegation: Right Hand Gun controls Sidebar & Nova
              setAvatarMood("executing");
            });
            setAvatarMood("recognized");
            if (holdGestureRef.current !== "GUN_RIGHT") {
              holdGestureRef.current = "GUN_RIGHT";
              holdStartRef.current = now;
              setHoldProgress(10);
            } else {
              const elapsed = now - holdStartRef.current;
              setHoldProgress(Math.min(100, Math.round((elapsed / GESTURE_CONFIG.INITIAL_HOLD_DELAY_MS) * 100)));
            }
          } else {
            // Schedule clear with grace period so a single dropped frame doesn't kill the 1.0s hold timer
            controller.scheduleClearGestureTimers();
            if (holdGestureRef.current === "GUN_LEFT" || holdGestureRef.current === "GUN_RIGHT") {
              if (now - holdStartRef.current > 300) {
                holdGestureRef.current = "None";
                setHoldProgress(0);
              }
            }

            // Thumbs Up: Open focused item dynamically (zero hardcoded redirects)
            if (activeGestureName === "Thumb_Up") {
              if (holdGestureRef.current !== "Thumb_Up") {
                holdGestureRef.current = "Thumb_Up";
                holdStartRef.current = now;
                setHoldProgress(25);
                setAvatarMood("recognized");
              } else {
                const elapsed = now - holdStartRef.current;
                const holdPct = Math.min(100, Math.round((elapsed / 450) * 100));
                setHoldProgress(holdPct);

                if (elapsed >= 450 && (now - lastTriggeredTimeRef.current > 1200)) {
                  lastTriggeredTimeRef.current = now;
                  controller.activateCurrentSelection();
                  setAvatarMood("executing");
                  triggerAvatarResponse("✨ Opened focused box!", "thumbs_up", "Opened focused box.");
                  holdGestureRef.current = "None";
                  setHoldProgress(0);
                }
              }
            } else if (activeGestureName === "Pointing_Up") {
              // Legacy gesture: Point Up -> Course Library
              if (holdGestureRef.current !== "Pointing_Up") {
                holdGestureRef.current = "Pointing_Up";
                holdStartRef.current = now;
                setHoldProgress(30);
                setAvatarMood("recognized");
              } else {
                const elapsed = now - holdStartRef.current;
                setHoldProgress(Math.min(100, Math.round((elapsed / 400) * 100)));
                if (elapsed >= 400 && (now - lastTriggeredTimeRef.current > 1500)) {
                  lastTriggeredTimeRef.current = now;
                  if (controller.legacyCommands["INDEX_FINGER_UP"]) {
                    controller.legacyCommands["INDEX_FINGER_UP"]();
                  }
                  triggerAvatarResponse("📚 Opening Course Library...", "point_courses", "Opening Course Library.");
                  holdGestureRef.current = "None";
                  setHoldProgress(0);
                }
              }
            } else if (activeGestureName === "Victory") {
              // Legacy gesture: Victory -> Home Dashboard
              if (holdGestureRef.current !== "Victory") {
                holdGestureRef.current = "Victory";
                holdStartRef.current = now;
                setHoldProgress(30);
                setAvatarMood("recognized");
              } else {
                const elapsed = now - holdStartRef.current;
                setHoldProgress(Math.min(100, Math.round((elapsed / 400) * 100)));
                if (elapsed >= 400 && (now - lastTriggeredTimeRef.current > 1500)) {
                  lastTriggeredTimeRef.current = now;
                  if (controller.legacyCommands["VICTORY"]) {
                    controller.legacyCommands["VICTORY"]();
                  }
                  triggerAvatarResponse("🏠 Returning to Home Dashboard...", "wave", "Returning home.");
                  holdGestureRef.current = "None";
                  setHoldProgress(0);
                }
              }
            } else if (activeGestureName === "Closed_Fist") {
              // Legacy gesture: Fist -> Back / Close
              if (holdGestureRef.current !== "Closed_Fist") {
                holdGestureRef.current = "Closed_Fist";
                holdStartRef.current = now;
                setHoldProgress(30);
                setAvatarMood("recognized");
              } else {
                const elapsed = now - holdStartRef.current;
                setHoldProgress(Math.min(100, Math.round((elapsed / 400) * 100)));
                if (elapsed >= 400 && (now - lastTriggeredTimeRef.current > 1500)) {
                  lastTriggeredTimeRef.current = now;
                  if (controller.legacyCommands["FIST"]) {
                    controller.legacyCommands["FIST"]();
                  }
                  triggerAvatarResponse("🔙 Navigating back...", "nod", "Going back.");
                  holdGestureRef.current = "None";
                  setHoldProgress(0);
                }
              }
            } else if (activeGestureName === "Open_Palm") {
              // Help trigger if hand held stationary
              if (holdGestureRef.current !== "Open_Palm") {
                holdGestureRef.current = "Open_Palm";
                holdStartRef.current = now;
                setHoldProgress(25);
              } else {
                const elapsed = now - holdStartRef.current;
                setHoldProgress(Math.min(100, Math.round((elapsed / 700) * 100)));
                if (elapsed >= 700 && (now - lastTriggeredTimeRef.current > 2000)) {
                  lastTriggeredTimeRef.current = now;
                  if (controller.legacyCommands["OPEN_PALM"]) {
                    controller.legacyCommands["OPEN_PALM"]();
                  }
                  triggerAvatarResponse("✋ Help and sign guide opened.", "wave", "Help and sign guide opened.");
                  holdGestureRef.current = "None";
                  setHoldProgress(0);
                }
              }
            } else {
              holdGestureRef.current = "None";
              setHoldProgress(0);
            }
          }
        } else {
          // Hand not in view
          controller.clearGestureTimers();
          controller.smoothY = null;
          activeGestureName = "None";
          confidenceScore = 0;
          holdGestureRef.current = "None";
          setHoldProgress(0);
        }

        setDetectedGesture(activeGestureName);
        setDetectedConfidence(confidenceScore);
      }
    }

    requestRef.current = requestAnimationFrame(predictLoop);
  };

  // Draw glowing futuristic landmarks
  const drawHandLandmarks = (ctx, landmarks, width, height, gestureName) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00f5d4"; // Vibrant cyan
    ctx.fillStyle = "#a855f7"; // Glowing purple points

    // Connect standard finger joints
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm bridge
    ];

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    });

    // Draw Joint Points
    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 4.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  if (embedded && isEmbeddedMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsEmbeddedMinimized(false)}
          className="group py-2.5 px-4 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-cyan-400/50"
          title="Open Nova Sign AI Assistant"
        >
          <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            sign_language
          </span>
          <span className="font-bold tracking-wide font-headline">Nova Sign AI</span>
          {cameraActive && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  if (embedded) {
    return (
      <aside className={`w-[300px] h-screen max-h-screen bg-slate-950 text-slate-100 border-l border-slate-800/80 flex flex-col justify-between flex-shrink-0 overflow-hidden relative font-sans ${className}`}>
        {/* Top Content (Header + Stage + Tabs + Active Tab) */}
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-slate-900/90 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 flex-shrink-0">
                <span className="material-symbols-outlined !text-lg">sign_language</span>
                {cameraActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <h4 className="font-bold text-[11px] text-white truncate">{t("nova_bot_title", "Nova • Sign Avatar Bot")}</h4>
                  <span className="text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">{t("nova_tagline", "Available across all tabs")}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !audioVoiceEnabled;
                  setAudioVoiceEnabled(next);
                  if (next) {
                    triggerAvatarResponse("🔊 Voice Audio Enabled.", "wave", "Voice audio enabled.");
                  } else {
                    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
                    triggerAvatarResponse("🔇 Silent Mode active.", "nod");
                  }
                }}
                className={`p-1 rounded-lg border text-[9px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  audioVoiceEnabled
                    ? "bg-indigo-600 text-white border-indigo-400"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
                title={audioVoiceEnabled ? "Voice ON (Speaks aloud)" : "Silent Mode (Visual only for deaf users)"}
              >
                <span className="material-symbols-outlined !text-xs">
                  {audioVoiceEnabled ? "volume_up" : "volume_off"}
                </span>
              </button>

              {/* Minimize into button */}
              <button
                type="button"
                onClick={() => setIsEmbeddedMinimized(true)}
                className="p-1 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Minimize Nova Sign AI"
              >
                <span className="material-symbols-outlined !text-xs">remove</span>
              </button>
            </div>
          </div>

          {/* Status Indicator & Live Caption Bar */}
          <div className="px-3 py-2 bg-slate-900/90 border-b border-cyan-500/20 flex flex-col gap-1.5 flex-shrink-0">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[9px]">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  avatarMood === "executing" ? "bg-amber-400 animate-ping" :
                  avatarMood === "recognized" ? "bg-cyan-400 animate-bounce" :
                  cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`} />
                <span className="text-slate-200 font-semibold uppercase tracking-wider text-[8px] truncate">
                  {avatarMood === "executing" ? "Command Executed" :
                   avatarMood === "recognized" ? `Detecting: ${detectedGesture}` :
                   cameraActive ? "Watching signs..." : "Ready"}
                </span>
              </div>

              {holdProgress > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[9px] font-bold">
                  <span>{holdProgress}%</span>
                  <div className="w-6 h-1 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${holdProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Mini Live Captions */}
            <div className="w-full px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/5 text-[10px] font-semibold text-white truncate flex items-center gap-1.5">
              <span className="text-cyan-400 text-xs">💬</span>
              <span className="truncate">{captionText}</span>
            </div>
          </div>

          {/* Bot Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 px-1 pt-1 gap-0.5 flex-shrink-0">
            {[
              { id: "camera", label: "Sign Camera", icon: "videocam" },
              { id: "chat", label: "Captions", icon: "forum" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "text-cyan-400 border-cyan-400 bg-slate-800/80"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <span className="material-symbols-outlined !text-sm">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-2.5 flex flex-col gap-2.5 flex-1 overflow-y-auto">
            {activeTab === "camera" && (
              <div className="flex flex-col gap-2.5">
                {/* Camera Video Feed */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? "block" : "hidden"}`}
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none ${cameraActive ? "block" : "hidden"}`}
                  />

                  {cameraActive ? (
                    <>
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-[10px] text-white flex items-center gap-1">
                        <span className="font-bold text-cyan-400">{detectedGesture !== "None" ? detectedGesture : "Ready"}</span>
                        {detectedConfidence > 0 && (
                          <span className="text-[8px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            {detectedConfidence}%
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-[9px] font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-xs">videocam_off</span>
                        <span>Stop</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                        <span className="material-symbols-outlined !text-xl">videocam</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {t("turn_on_camera_hint", "Turn on camera to control with gestures.")}
                      </p>
                      {modelError ? (
                        <div className="text-[9px] text-red-400 bg-red-950/60 p-1 rounded-md">
                          {modelError}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={modelLoading}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-[11px] font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined !text-sm">play_arrow</span>
                          <span>{modelLoading ? "Loading AI..." : "Enable Sign Camera"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Commands Grid 2x2 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                    <span>Quick Commands:</span>
                    <span className="text-[9px] text-cyan-400">Hold 0.6s to trigger</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {commands.slice(0, 4).map((cmd) => {
                      const isCurrent = detectedGesture === cmd.gesture;
                      return (
                        <button
                          key={cmd.gesture}
                          type="button"
                          onClick={() => executeSignAction(cmd)}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400"
                              : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850"
                          }`}
                        >
                          <span className="text-base flex-shrink-0">{cmd.icon}</span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-white truncate">{cmd.actionName}</div>
                            <div className="text-[8px] text-slate-400 font-mono truncate">{cmd.signName}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-0.5 text-[11px] max-w-[90%] ${
                      msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      msg.sender === "user"
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-500 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>
            )}


          </div>
        </div>

        {/* Floating "Nova Sign AI" launcher pill button in bottom-right of column 3 */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              if (!cameraActive) startCamera();
            }}
            className="w-full py-2 px-3 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/40"
            title="Nova Sign AI Assistant"
          >
            <span className="material-symbols-outlined !text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              sign_language
            </span>
            <span className="truncate">Nova Sign AI</span>
            {cameraActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            )}
          </button>
        </div>
      </aside>
    );
  }


  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans ${className}`}>
      {/* ── Floating Expanded Assistant Window (Chatbot Style) ── */}
      {isOpen && (
        <div className={`w-[92vw] sm:w-[420px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border backdrop-blur-2xl transition-all duration-300 animate-fadeIn ${
          isLight
            ? "bg-white/95 border-slate-300 shadow-slate-900/20 text-slate-900"
            : "bg-slate-950/95 border-cyan-500/40 shadow-cyan-950/60 text-slate-100"
        }`}>
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                <span className="material-symbols-outlined !text-xl">sign_language</span>
                {cameraActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white">{t("nova_bot_title", "Nova • Sign Avatar Bot")}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{t("nova_tagline", "Available across all tabs")}</p>
              </div>
            </div>

            {/* Window Actions */}
            <div className="flex items-center gap-1">
              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !audioVoiceEnabled;
                  setAudioVoiceEnabled(next);
                  if (next) {
                    triggerAvatarResponse("🔊 Voice Audio Enabled.", "wave", "Voice audio enabled.");
                  } else {
                    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
                    triggerAvatarResponse("🔇 Silent Mode active.", "nod");
                  }
                }}
                className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  audioVoiceEnabled
                    ? "bg-indigo-600 text-white border-indigo-400"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
                title={audioVoiceEnabled ? "Voice ON (Speaks aloud)" : "Silent Mode (Visual only for deaf users)"}
              >
                <span className="material-symbols-outlined !text-sm">
                  {audioVoiceEnabled ? "volume_up" : "volume_off"}
                </span>
              </button>

              {/* Minimize Window */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <span className="material-symbols-outlined !text-sm">
                  {isMinimized ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Close Floating Window */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Close Window"
              >
                <span className="material-symbols-outlined !text-sm">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col flex-1 overflow-y-auto max-h-[72vh]">
              
              {/* Status Indicator & Live Caption Bar */}
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-cyan-500/20 flex flex-col gap-2 flex-shrink-0">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${
                      avatarMood === "executing" ? "bg-amber-400 animate-ping" :
                      avatarMood === "recognized" ? "bg-cyan-400 animate-bounce" :
                      cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`} />
                    <span className="text-slate-200 font-semibold uppercase tracking-wider text-[9px]">
                      {avatarMood === "executing" ? "Command Executed" :
                       avatarMood === "recognized" ? `Detecting: ${detectedGesture}` :
                       cameraActive ? "Watching signs..." : "Ready"}
                    </span>
                  </div>

                  {holdProgress > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[10px] font-bold">
                      <span>Hold: {holdProgress}%</span>
                      <div className="w-8 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${holdProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini Live Captions */}
                <div className="w-full px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/5 text-[11px] font-semibold text-white truncate flex items-center gap-1.5">
                  <span className="text-cyan-400 text-xs">💬</span>
                  <span className="truncate">{captionText}</span>
                </div>
              </div>

              {/* Bot Navigation Tabs: [Sign Camera] | [Captions & History] */}
              <div className="flex border-b border-slate-800 bg-slate-900/80 px-2 pt-1 gap-1">
                {[
                  { id: "camera", label: t("nova_tab_camera", "Sign Camera"), icon: "videocam" },
                  { id: "chat", label: t("nova_tab_chat", "Captions & History"), icon: "forum" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-t-xl transition-all border-b-2 ${
                      activeTab === t.id
                        ? "text-cyan-400 border-cyan-400 bg-slate-800/80"
                        : "text-slate-400 border-transparent hover:text-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Live Sign Camera & Quick Actions */}
              {activeTab === "camera" && (
                <div className="p-4 flex flex-col gap-3">
                  
                  {/* Camera Video Feed */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? "block" : "hidden"}`}
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none ${cameraActive ? "block" : "hidden"}`}
                    />

                    {cameraActive ? (
                      <>
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-[11px] text-white flex items-center gap-1.5">
                          <span className="font-bold text-cyan-400">{detectedGesture !== "None" ? detectedGesture : "Ready"}</span>
                          {detectedConfidence > 0 && (
                            <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                              {detectedConfidence}%
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={stopCamera}
                          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined !text-xs">videocam_off</span>
                          <span>{t("stop_camera", "Stop")}</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                          <span className="material-symbols-outlined !text-2xl">videocam</span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          {t("turn_on_camera_hint", "Turn on camera to control the app with sign language gestures.")}
                        </p>
                        {modelError ? (
                          <div className="text-[10px] text-red-400 bg-red-950/60 p-1.5 rounded-lg">
                            {modelError}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startCamera}
                            disabled={modelLoading}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined !text-base">play_arrow</span>
                            <span>{modelLoading ? t("loading_ai", "Loading AI...") : t("enable_camera", "Enable Sign Camera")}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fast Sign Command Pills */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>{t("quick_commands", "Quick Commands:")}</span>
                      <span className="text-[10px] text-cyan-400">{t("hold_to_trigger", "Hold 0.6s to trigger")}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {commands.slice(0, 4).map((cmd) => {
                        const isCurrent = detectedGesture === cmd.gesture;
                        return (
                          <button
                            key={cmd.gesture}
                            type="button"
                            onClick={() => executeSignAction(cmd)}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-cyan-500/20 border-cyan-400 text-white ring-2 ring-cyan-400/50"
                                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850"
                            }`}
                          >
                            <span className="text-lg">{cmd.icon}</span>
                            <div className="truncate">
                              <div className="text-xs font-bold text-white truncate">{cmd.actionName}</div>
                              <div className="text-[9px] text-slate-400 font-mono truncate">{cmd.signName}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Captions & History Chat Feed */}
              {activeTab === "chat" && (
                <div className="p-4 flex flex-col gap-3 min-h-[260px] max-h-[340px] overflow-y-auto">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 text-xs max-w-[85%] ${
                        msg.sender === "user"
                          ? "self-end items-end"
                          : "self-start items-start"
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-cyan-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>
              )}



            </div>
          )}

        </div>
      )}

      {/* ── Floating Launcher Trigger Button (Bottom-Right) ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isMinimized) setIsMinimized(false);
        }}
        className="relative group p-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border-2 border-cyan-400/50"
        title="Toggle AI Sign Language Avatar Assistant"
      >
        <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          sign_language
        </span>
        
        <span className="font-bold text-xs pr-1 hidden sm:inline tracking-wide font-headline">
          {t("nova_assistant", "Nova Sign AI")}
        </span>

        {cameraActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
        )}
      </button>

    </div>
  );
}
