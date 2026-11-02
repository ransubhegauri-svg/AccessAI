/**
 * AccessAI Simulated Cohort Dataset (Meko Track A - hackCBS 9.0)
 * ══════════════════════════════════════════════════════════════════════════════
 * EXACT DISTRIBUTION: 90 DEMO STUDENTS
 * - 30 Deaf/Mute Students (Sign recognition, captions latency, technical gloss)
 * - 30 Blind Students (Screen readers, missing alt text, acoustic pitch tone cues)
 * - 30 Motor Students (Dwell pacing, switch scan rhythm, button target scaling)
 * 
 * Clear Data Separation: Marked with isDemo: true, dataset: "DEMO_COHORT_90".
 * Simulated activity is strictly separated from genuine registered student accounts.
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const DEMO_COHORT_STUDENTS = [
  {
    "id": "demo-deaf-001",
    "name": "Vrusha Goyal",
    "email": "goyalvrusha@gmail.com",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 92,
    "streak": "6 Days",
    "studyMinutes": 406,
    "enrolledCourses": 5,
    "assessmentScore": "91%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 16px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "645ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "High",
        "struggleDuration": "18 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x4b8f...915e",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-002",
    "name": "Nikhil Kim",
    "email": "nikhil.kim.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 82,
    "streak": "11 Days",
    "studyMinutes": 63,
    "enrolledCourses": 5,
    "assessmentScore": "92%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "734ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "Moderate",
        "struggleDuration": "18 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xd374...662b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-003",
    "name": "Rohan Nair",
    "email": "rohan.nair.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 83,
    "streak": "11 Days",
    "studyMinutes": 82,
    "enrolledCourses": 2,
    "assessmentScore": "91%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 18px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "569ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "High",
        "struggleDuration": "32 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0xae57...f2ac",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-004",
    "name": "Aditya Novak",
    "email": "aditya.novak.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 59,
    "streak": "12 Days",
    "studyMinutes": 100,
    "enrolledCourses": 2,
    "assessmentScore": "95%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "555ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "Critical",
        "struggleDuration": "32 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xe588...6d65",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-005",
    "name": "Maya Thakur",
    "email": "maya.thakur.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 89,
    "streak": "5 Days",
    "studyMinutes": 371,
    "enrolledCourses": 3,
    "assessmentScore": "88%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 20px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "627ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "Critical",
        "struggleDuration": "20 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0xfce6...b3d7",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-006",
    "name": "Marcus Trivedi",
    "email": "marcus.trivedi.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 96,
    "streak": "13 Days",
    "studyMinutes": 265,
    "enrolledCourses": 4,
    "assessmentScore": "76%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "548ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "Critical",
        "struggleDuration": "32 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x8577...3493",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-007",
    "name": "Hiroshi Deshmukh",
    "email": "hiroshi.deshmukh.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 72,
    "streak": "21 Days",
    "studyMinutes": 264,
    "enrolledCourses": 5,
    "assessmentScore": "79%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 20px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "654ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 6",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "High",
        "struggleDuration": "16 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xb0a0...38f4",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-008",
    "name": "Yuki Williams",
    "email": "yuki.williams.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 74,
    "streak": "19 Days",
    "studyMinutes": 188,
    "enrolledCourses": 2,
    "assessmentScore": "85%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 18px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "717ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 14",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "High",
        "struggleDuration": "21 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x7f4c...387d",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-009",
    "name": "Aaliyah Joshi",
    "email": "aaliyah.joshi.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 51,
    "streak": "12 Days",
    "studyMinutes": 387,
    "enrolledCourses": 4,
    "assessmentScore": "84%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 16px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "776ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 6",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "High",
        "struggleDuration": "31 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x62fb...8d15",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-010",
    "name": "Vikram Dubois",
    "email": "vikram.dubois.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 60,
    "streak": "21 Days",
    "studyMinutes": 100,
    "enrolledCourses": 2,
    "assessmentScore": "70%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 16px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "677ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "Critical",
        "struggleDuration": "29 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x3a45...53da",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-011",
    "name": "Kabir Morales",
    "email": "kabir.morales.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 86,
    "streak": "14 Days",
    "studyMinutes": 284,
    "enrolledCourses": 3,
    "assessmentScore": "96%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 18px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "679ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "High",
        "struggleDuration": "12 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xa69b...9dcd",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-012",
    "name": "Manish Tripathi",
    "email": "manish.tripathi.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 85,
    "streak": "4 Days",
    "studyMinutes": 177,
    "enrolledCourses": 4,
    "assessmentScore": "70%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "523ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "Moderate",
        "struggleDuration": "20 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xbb42...8c44",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-013",
    "name": "Harsh Iyer",
    "email": "harsh.iyer.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 96,
    "streak": "16 Days",
    "studyMinutes": 157,
    "enrolledCourses": 5,
    "assessmentScore": "71%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "762ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 14",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "Critical",
        "struggleDuration": "26 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0xed24...caa4",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-014",
    "name": "Amit Sato",
    "email": "amit.sato.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 66,
    "streak": "6 Days",
    "studyMinutes": 187,
    "enrolledCourses": 5,
    "assessmentScore": "74%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 18px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "551ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "Moderate",
        "struggleDuration": "20 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x866e...4ff3",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-015",
    "name": "Tariq Verma",
    "email": "tariq.verma.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 45,
    "streak": "5 Days",
    "studyMinutes": 181,
    "enrolledCourses": 5,
    "assessmentScore": "73%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 20px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "545ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 11",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "High",
        "struggleDuration": "17 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x7104...108d",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-016",
    "name": "Kwame Bhat",
    "email": "kwame.bhat.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 91,
    "streak": "20 Days",
    "studyMinutes": 398,
    "enrolledCourses": 3,
    "assessmentScore": "90%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 18px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "666ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 6",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "High",
        "struggleDuration": "30 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xcc59...9acd",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-017",
    "name": "Chen Nakamura",
    "email": "chen.nakamura.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 75,
    "streak": "19 Days",
    "studyMinutes": 331,
    "enrolledCourses": 2,
    "assessmentScore": "73%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "549ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "High",
        "struggleDuration": "33 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xeca0...4c36",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-018",
    "name": "Caleb Mishra",
    "email": "caleb.mishra.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 71,
    "streak": "21 Days",
    "studyMinutes": 349,
    "enrolledCourses": 4,
    "assessmentScore": "84%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 20px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "540ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 18",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "Moderate",
        "struggleDuration": "20 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x7552...3181",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-019",
    "name": "Gideon Halkude",
    "email": "gideon.halkude.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 84,
    "streak": "21 Days",
    "studyMinutes": 111,
    "enrolledCourses": 4,
    "assessmentScore": "70%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 16px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "557ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "High",
        "struggleDuration": "19 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x6e99...58f4",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-020",
    "name": "Kiran Chen",
    "email": "kiran.chen.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 64,
    "streak": "6 Days",
    "studyMinutes": 128,
    "enrolledCourses": 2,
    "assessmentScore": "76%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 20px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "524ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 18",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "High",
        "struggleDuration": "31 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x45eb...c7b5",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-021",
    "name": "Omkar Tanaka",
    "email": "omkar.tanaka.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 48,
    "streak": "5 Days",
    "studyMinutes": 384,
    "enrolledCourses": 2,
    "assessmentScore": "81%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 18px)",
      "signLanguage": "ASL (American Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "778ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "High",
        "struggleDuration": "17 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xcdc1...811c",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-022",
    "name": "Umesh Gupta",
    "email": "umesh.gupta.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 54,
    "streak": "20 Days",
    "studyMinutes": 78,
    "enrolledCourses": 3,
    "assessmentScore": "94%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 16px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "577ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "High",
        "struggleDuration": "21 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x6d59...f623",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-023",
    "name": "Ananya Okafor",
    "email": "ananya.okafor.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 67,
    "streak": "20 Days",
    "studyMinutes": 268,
    "enrolledCourses": 3,
    "assessmentScore": "87%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 20px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "647ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 18",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "Critical",
        "struggleDuration": "12 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x3dea...cc8f",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-024",
    "name": "Kavya Pillai",
    "email": "kavya.pillai.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 51,
    "streak": "15 Days",
    "studyMinutes": 79,
    "enrolledCourses": 3,
    "assessmentScore": "95%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 16px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Active PIP Window",
      "gestureHoldWindow": "656ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "High",
        "struggleDuration": "19 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x4911...160e",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-025",
    "name": "Priya Patel",
    "email": "priya.patel.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 67,
    "streak": "19 Days",
    "studyMinutes": 264,
    "enrolledCourses": 2,
    "assessmentScore": "89%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 16px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "662ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "High",
        "struggleDuration": "13 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x2bc0...a8b8",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-026",
    "name": "Tanvi Bose",
    "email": "tanvi.bose.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 52,
    "streak": "15 Days",
    "studyMinutes": 355,
    "enrolledCourses": 5,
    "assessmentScore": "74%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Soft Slate, 20px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "743ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Captions are behind the speaker",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Caption Streaming Latency Desync",
        "details": "Web Speech Recognition captions lagged by 2.4s behind live video presentation, causing context loss.",
        "failureType": "Live Captions Buffer Lag",
        "severity": "Moderate",
        "struggleDuration": "23 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Enable local low-latency caption buffer and freeze frame until student acknowledges."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x7e69...21e9",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-027",
    "name": "Karan Kim",
    "email": "karan.kim.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 77,
    "streak": "12 Days",
    "studyMinutes": 401,
    "enrolledCourses": 4,
    "assessmentScore": "81%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Large Bold White, 20px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.9x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "583ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Slow down 3D avatar",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 10",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Rapid Fingerspelling Velocity Drop",
        "details": "Failed recognition on rapid ASL numbers 11-20 due to finger flicking velocity exceeding 650ms hold window.",
        "failureType": "Gesture Stabilization Hold Timeout",
        "severity": "Critical",
        "struggleDuration": "33 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Adjust gesture hold window to 450ms and offer 0.5x slow-motion avatar replay."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x710f...bd64",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-028",
    "name": "Kenji Nair",
    "email": "kenji.nair.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 64,
    "streak": "12 Days",
    "studyMinutes": 167,
    "enrolledCourses": 5,
    "assessmentScore": "81%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 20px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "727ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Is my camera showing both hands?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 11",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Two-Way Peer Sign Stream Framing",
        "details": "Camera angle cropped out dominant hand wrist position, preventing two-handed sign classification.",
        "failureType": "Video Framing Incomplete",
        "severity": "Critical",
        "struggleDuration": "35 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Provide visual framing boundary overlay showing optimal hand positioning zone."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x3b70...b8aa",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-029",
    "name": "Carlos Novak",
    "email": "carlos.novak.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 64,
    "streak": "10 Days",
    "studyMinutes": 161,
    "enrolledCourses": 3,
    "assessmentScore": "72%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (High Contrast Cyan, 16px)",
      "signLanguage": "ISL (Indian Sign Language)",
      "speed": "1.0x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "567ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "What does this technical term mean?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Technical Terminology Missing Sign Gloss",
        "details": "Live lecture captions included specialized jargon without corresponding ISL/ASL technical gloss.",
        "failureType": "Caption Gloss Desynchronization",
        "severity": "High",
        "struggleDuration": "26 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Display interactive technical gloss popup with side-by-side sign animation."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x7a18...f2d9",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-deaf-030",
    "name": "Chloe Thakur",
    "email": "chloe.thakur.demo@accessai.edu",
    "mode": "deaf",
    "categoryLabel": "Deaf & Hard of Hearing",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 54,
    "streak": "3 Days",
    "studyMinutes": 114,
    "enrolledCourses": 3,
    "assessmentScore": "92%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Visual / Sign Language",
      "captions": "Always On (Yellow on Black, 18px)",
      "signLanguage": "BSL (British Sign Language)",
      "speed": "0.75x Video Playback",
      "pipInterpreter": "Embedded Avatar",
      "gestureHoldWindow": "773ms",
      "inputPipeline": "Camera Hand Gestures + Rapid Text Fallback"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Please repeat explanation in text",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sign Recognition Low-Light Camera Jitter",
        "details": "MediaPipe hand landmark confidence dropped to 38% during rapid signing in low contrast lighting.",
        "failureType": "Sign Detection Threshold Drop",
        "severity": "Moderate",
        "struggleDuration": "15 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal deaf accommodations.",
      "aiRecommendation": "Offer high-contrast background guide and enable 1-click text composer fallback."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x84da...3222",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-001",
    "name": "Aman Halkude",
    "email": "amanhalkude7750+blind@gmail.com",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 93,
    "streak": "17 Days",
    "studyMinutes": 373,
    "enrolledCourses": 5,
    "assessmentScore": "94%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "Critical",
        "struggleDuration": "20 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xd074...4f4b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-002",
    "name": "Nikhil Gupta",
    "email": "nikhil.gupta.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 85,
    "streak": "10 Days",
    "studyMinutes": 200,
    "enrolledCourses": 4,
    "assessmentScore": "82%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "High",
        "struggleDuration": "22 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xf49d...9a47",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-003",
    "name": "Rohan Okafor",
    "email": "rohan.okafor.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 54,
    "streak": "10 Days",
    "studyMinutes": 256,
    "enrolledCourses": 3,
    "assessmentScore": "90%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "Critical",
        "struggleDuration": "22 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x9ae8...8746",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-004",
    "name": "Aditya Pillai",
    "email": "aditya.pillai.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 58,
    "streak": "16 Days",
    "studyMinutes": 259,
    "enrolledCourses": 5,
    "assessmentScore": "96%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "High",
        "struggleDuration": "21 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xd0e3...73d6",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-005",
    "name": "Maya Patel",
    "email": "maya.patel.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 76,
    "streak": "10 Days",
    "studyMinutes": 199,
    "enrolledCourses": 5,
    "assessmentScore": "81%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "Moderate",
        "struggleDuration": "26 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0xfb67...30ac",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-006",
    "name": "Marcus Bose",
    "email": "marcus.bose.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 70,
    "streak": "21 Days",
    "studyMinutes": 348,
    "enrolledCourses": 5,
    "assessmentScore": "89%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "1.15x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "Moderate",
        "struggleDuration": "13 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x5299...710c",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-007",
    "name": "Hiroshi Kim",
    "email": "hiroshi.kim.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 74,
    "streak": "13 Days",
    "studyMinutes": 232,
    "enrolledCourses": 5,
    "assessmentScore": "92%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 8",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "Critical",
        "struggleDuration": "12 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xcfc0...9a17",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-008",
    "name": "Yuki Nair",
    "email": "yuki.nair.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 59,
    "streak": "5 Days",
    "studyMinutes": 393,
    "enrolledCourses": 3,
    "assessmentScore": "69%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "Moderate",
        "struggleDuration": "19 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x3050...893b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-009",
    "name": "Aaliyah Novak",
    "email": "aaliyah.novak.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 74,
    "streak": "11 Days",
    "studyMinutes": 248,
    "enrolledCourses": 3,
    "assessmentScore": "73%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 16",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "High",
        "struggleDuration": "21 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xa367...bd66",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-010",
    "name": "Vikram Thakur",
    "email": "vikram.thakur.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 90,
    "streak": "9 Days",
    "studyMinutes": 98,
    "enrolledCourses": 4,
    "assessmentScore": "86%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "High",
        "struggleDuration": "23 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x9861...7daa",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-011",
    "name": "Kabir Trivedi",
    "email": "kabir.trivedi.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 77,
    "streak": "13 Days",
    "studyMinutes": 66,
    "enrolledCourses": 5,
    "assessmentScore": "95%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "High",
        "struggleDuration": "32 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xf43e...e426",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-012",
    "name": "Manish Deshmukh",
    "email": "manish.deshmukh.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 72,
    "streak": "8 Days",
    "studyMinutes": 327,
    "enrolledCourses": 5,
    "assessmentScore": "98%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "High",
        "struggleDuration": "22 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xea09...4ed8",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-013",
    "name": "Harsh Williams",
    "email": "harsh.williams.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 73,
    "streak": "10 Days",
    "studyMinutes": 297,
    "enrolledCourses": 2,
    "assessmentScore": "86%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 9",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "Moderate",
        "struggleDuration": "27 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x464d...6ad5",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-014",
    "name": "Amit Joshi",
    "email": "amit.joshi.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 62,
    "streak": "11 Days",
    "studyMinutes": 344,
    "enrolledCourses": 3,
    "assessmentScore": "68%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "Moderate",
        "struggleDuration": "34 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x89e1...b559",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-015",
    "name": "Tariq Dubois",
    "email": "tariq.dubois.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 95,
    "streak": "3 Days",
    "studyMinutes": 107,
    "enrolledCourses": 3,
    "assessmentScore": "77%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 10",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "High",
        "struggleDuration": "27 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x9db0...97ea",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-016",
    "name": "Kwame Morales",
    "email": "kwame.morales.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 92,
    "streak": "20 Days",
    "studyMinutes": 229,
    "enrolledCourses": 4,
    "assessmentScore": "79%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 8",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "High",
        "struggleDuration": "35 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x414d...60c7",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-017",
    "name": "Chen Tripathi",
    "email": "chen.tripathi.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 57,
    "streak": "9 Days",
    "studyMinutes": 307,
    "enrolledCourses": 3,
    "assessmentScore": "76%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "High",
        "struggleDuration": "17 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x5d61...139f",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-018",
    "name": "Caleb Iyer",
    "email": "caleb.iyer.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 62,
    "streak": "4 Days",
    "studyMinutes": 87,
    "enrolledCourses": 3,
    "assessmentScore": "85%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "1.15x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "High",
        "struggleDuration": "30 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x58ca...882a",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-019",
    "name": "Gideon Sato",
    "email": "gideon.sato.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 66,
    "streak": "8 Days",
    "studyMinutes": 86,
    "enrolledCourses": 2,
    "assessmentScore": "76%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "High",
        "struggleDuration": "30 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xb123...bfbb",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-020",
    "name": "Kiran Verma",
    "email": "kiran.verma.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 54,
    "streak": "21 Days",
    "studyMinutes": 215,
    "enrolledCourses": 5,
    "assessmentScore": "70%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "Critical",
        "struggleDuration": "26 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0xf893...8156",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-021",
    "name": "Omkar Bhat",
    "email": "omkar.bhat.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 64,
    "streak": "21 Days",
    "studyMinutes": 377,
    "enrolledCourses": 3,
    "assessmentScore": "69%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "0.9x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 16",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "High",
        "struggleDuration": "17 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x4d67...3c7f",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-022",
    "name": "Umesh Nakamura",
    "email": "umesh.nakamura.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 55,
    "streak": "3 Days",
    "studyMinutes": 269,
    "enrolledCourses": 2,
    "assessmentScore": "82%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "1.15x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 8",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "High",
        "struggleDuration": "34 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xec0f...843b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-023",
    "name": "Ananya Mishra",
    "email": "ananya.mishra.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 61,
    "streak": "21 Days",
    "studyMinutes": 398,
    "enrolledCourses": 2,
    "assessmentScore": "93%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "JAWS Protocol",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 10",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "High",
        "struggleDuration": "16 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x2247...1f44",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-024",
    "name": "Kavya Halkude",
    "email": "kavya.halkude.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 83,
    "streak": "21 Days",
    "studyMinutes": 207,
    "enrolledCourses": 4,
    "assessmentScore": "82%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.85x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 11",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "Critical",
        "struggleDuration": "26 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x2497...a918",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-025",
    "name": "Priya Chen",
    "email": "priya.chen.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 92,
    "streak": "13 Days",
    "studyMinutes": 369,
    "enrolledCourses": 3,
    "assessmentScore": "76%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "Web Speech API",
      "speechRate": "0.8x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "High",
        "struggleDuration": "17 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x8872...94da",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-026",
    "name": "Tanvi Tanaka",
    "email": "tanvi.tanaka.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 56,
    "streak": "21 Days",
    "studyMinutes": 283,
    "enrolledCourses": 5,
    "assessmentScore": "88%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Did my quiz submit correctly?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Unannounced Dynamic DOM Updates",
        "details": "Quiz answer submission result updated dynamically without triggering ARIA live region assertion.",
        "failureType": "ARIA Live Region Silent Mutation",
        "severity": "High",
        "struggleDuration": "22 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Inject aria-live='assertive' feedback banner with automated audio chime."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xbb8d...2ac7",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-027",
    "name": "Karan Gupta",
    "email": "karan.gupta.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 71,
    "streak": "18 Days",
    "studyMinutes": 207,
    "enrolledCourses": 2,
    "assessmentScore": "89%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.85x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "How many spaces is this loop indented?",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Indentation Visual-Only Formatting",
        "details": "Python syntax indentation depth was not audibly distinguished by standard screen reader voice.",
        "failureType": "Auditory Syntax Disambiguation Failure",
        "severity": "High",
        "struggleDuration": "20 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable acoustic tone pitch cues (higher pitch = deeper indentation level)."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x62c2...2dad",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-028",
    "name": "Kenji Okafor",
    "email": "kenji.okafor.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 87,
    "streak": "20 Days",
    "studyMinutes": 296,
    "enrolledCourses": 4,
    "assessmentScore": "81%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "1.0x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Where am I on this grading rubric?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Nested Table Navigation Trap",
        "details": "Screen reader virtual cursor trapped in multi-column assessment rubric without row header announcements.",
        "failureType": "Table Structural Coordinate Missing",
        "severity": "High",
        "struggleDuration": "18 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Transform complex table into linear step-by-step accordion navigation."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x545d...9c99",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-029",
    "name": "Carlos Pillai",
    "email": "carlos.pillai.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 73,
    "streak": "18 Days",
    "studyMinutes": 122,
    "enrolledCourses": 3,
    "assessmentScore": "68%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "VoiceOver Compatible",
      "speechRate": "0.85x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Cancel action, I wanted next module",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Voice Command Acoustic Interference",
        "details": "Speech-to-text navigation misrecognized command 'Next Module' as 'Exit Module' due to classroom background noise.",
        "failureType": "Speech Recognition Misinterpretation",
        "severity": "High",
        "struggleDuration": "29 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Enable confirmation prompt for critical actions and add keyboard shortcut fallback."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x7872...27dc",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-blind-030",
    "name": "Chloe Patel",
    "email": "chloe.patel.demo@accessai.edu",
    "mode": "blind",
    "categoryLabel": "Blind & Low Vision",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 74,
    "streak": "6 Days",
    "studyMinutes": 391,
    "enrolledCourses": 4,
    "assessmentScore": "94%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Auditory / Screen Reader",
      "captions": "Disabled (Auditory Mode)",
      "screenReader": "NVDA Standard",
      "speechRate": "0.85x",
      "acousticCues": "Enabled (Indent Pitch & Element Chimes)",
      "diagramAlternative": "Hierarchical Text + 3D Spatial Audio",
      "inputPipeline": "Voice Commands (STT) + Extended Keyboard Focus Tree"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Describe this visual diagram aloud",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 11",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Missing Alt Text on Complex Diagram",
        "details": "Screen reader encountered unlabeled SVG tree diagram; read 'graphic 402' without semantic hierarchy.",
        "failureType": "Missing Semantic Image Description",
        "severity": "Critical",
        "struggleDuration": "27 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal blind accommodations.",
      "aiRecommendation": "Provide structured text hierarchy (indented list) and acoustic spatial audio diagram."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x4e65...84ef",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-001",
    "name": "Aarav Patel",
    "email": "amanhalkude7750@gmail.com",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 69,
    "streak": "9 Days",
    "studyMinutes": 366,
    "enrolledCourses": 2,
    "assessmentScore": "84%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "High",
        "struggleDuration": "28 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x5465...e20f",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-002",
    "name": "Nikhil Nakamura",
    "email": "nikhil.nakamura.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 91,
    "streak": "12 Days",
    "studyMinutes": 360,
    "enrolledCourses": 3,
    "assessmentScore": "86%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "Critical",
        "struggleDuration": "23 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x651a...9d4a",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-003",
    "name": "Rohan Mishra",
    "email": "rohan.mishra.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 74,
    "streak": "13 Days",
    "studyMinutes": 156,
    "enrolledCourses": 5,
    "assessmentScore": "90%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "High",
        "struggleDuration": "22 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0xcea4...8914",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-004",
    "name": "Aditya Halkude",
    "email": "aditya.halkude.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 87,
    "streak": "7 Days",
    "studyMinutes": 313,
    "enrolledCourses": 4,
    "assessmentScore": "98%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.6s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 6",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "High",
        "struggleDuration": "28 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xf912...84f9",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-005",
    "name": "Maya Chen",
    "email": "maya.chen.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 71,
    "streak": "7 Days",
    "studyMinutes": 98,
    "enrolledCourses": 5,
    "assessmentScore": "83%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 9",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "Critical",
        "struggleDuration": "22 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0xb075...c7fd",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-006",
    "name": "Marcus Tanaka",
    "email": "marcus.tanaka.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 84,
    "streak": "5 Days",
    "studyMinutes": 180,
    "enrolledCourses": 2,
    "assessmentScore": "88%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.6s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 7",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "High",
        "struggleDuration": "26 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x3a96...c1aa",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-007",
    "name": "Hiroshi Gupta",
    "email": "hiroshi.gupta.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 47,
    "streak": "13 Days",
    "studyMinutes": 88,
    "enrolledCourses": 5,
    "assessmentScore": "77%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 9",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "Critical",
        "struggleDuration": "30 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0xbe8a...dae2",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-008",
    "name": "Yuki Okafor",
    "email": "yuki.okafor.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 56,
    "streak": "5 Days",
    "studyMinutes": 372,
    "enrolledCourses": 3,
    "assessmentScore": "95%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.2s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "Moderate",
        "struggleDuration": "19 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x860d...b34d",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-009",
    "name": "Aaliyah Pillai",
    "email": "aaliyah.pillai.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 61,
    "streak": "3 Days",
    "studyMinutes": 298,
    "enrolledCourses": 3,
    "assessmentScore": "96%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 14",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "High",
        "struggleDuration": "30 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x5c95...b391",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-010",
    "name": "Vikram Patel",
    "email": "vikram.patel.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 74,
    "streak": "12 Days",
    "studyMinutes": 161,
    "enrolledCourses": 3,
    "assessmentScore": "80%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.6s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "High",
        "struggleDuration": "30 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x5bbe...c303",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-011",
    "name": "Kabir Bose",
    "email": "kabir.bose.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 87,
    "streak": "15 Days",
    "studyMinutes": 200,
    "enrolledCourses": 5,
    "assessmentScore": "68%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 18",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "High",
        "struggleDuration": "19 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0xb2f9...40ac",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-012",
    "name": "Manish Kim",
    "email": "manish.kim.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 88,
    "streak": "7 Days",
    "studyMinutes": 381,
    "enrolledCourses": 5,
    "assessmentScore": "71%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 8",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "High",
        "struggleDuration": "35 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x31a4...2712",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-013",
    "name": "Harsh Nair",
    "email": "harsh.nair.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 92,
    "streak": "16 Days",
    "studyMinutes": 149,
    "enrolledCourses": 4,
    "assessmentScore": "74%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 16",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "High",
        "struggleDuration": "27 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0xde76...5b8e",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-014",
    "name": "Amit Novak",
    "email": "amit.novak.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 74,
    "streak": "5 Days",
    "studyMinutes": 132,
    "enrolledCourses": 5,
    "assessmentScore": "92%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "Critical",
        "struggleDuration": "12 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0x53b3...995c",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-015",
    "name": "Tariq Thakur",
    "email": "tariq.thakur.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 68,
    "streak": "11 Days",
    "studyMinutes": 359,
    "enrolledCourses": 3,
    "assessmentScore": "80%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "High",
        "struggleDuration": "31 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x48ab...b5cc",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-016",
    "name": "Kwame Trivedi",
    "email": "kwame.trivedi.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 89,
    "streak": "12 Days",
    "studyMinutes": 392,
    "enrolledCourses": 2,
    "assessmentScore": "81%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 6",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "Critical",
        "struggleDuration": "15 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x28e1...4c1b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-017",
    "name": "Chen Deshmukh",
    "email": "chen.deshmukh.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 69,
    "streak": "17 Days",
    "studyMinutes": 249,
    "enrolledCourses": 3,
    "assessmentScore": "89%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 13",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "Critical",
        "struggleDuration": "31 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x787a...579d",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-018",
    "name": "Caleb Williams",
    "email": "caleb.williams.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 58,
    "streak": "17 Days",
    "studyMinutes": 287,
    "enrolledCourses": 4,
    "assessmentScore": "98%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "High",
        "struggleDuration": "13 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x75ec...56a0",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-019",
    "name": "Gideon Joshi",
    "email": "gideon.joshi.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 74,
    "streak": "5 Days",
    "studyMinutes": 399,
    "enrolledCourses": 4,
    "assessmentScore": "74%",
    "lastActive": "Active yesterday",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.2s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 4",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "Moderate",
        "struggleDuration": "14 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xe46e...d3e1",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-020",
    "name": "Kiran Dubois",
    "email": "kiran.dubois.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 82,
    "streak": "9 Days",
    "studyMinutes": 179,
    "enrolledCourses": 2,
    "assessmentScore": "78%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 3,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 2,
      "quizIncorrectTraces": [
        "Confused syntax on line 16",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "Moderate",
        "struggleDuration": "29 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x502a...dc6b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-021",
    "name": "Omkar Morales",
    "email": "omkar.morales.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 87,
    "streak": "3 Days",
    "studyMinutes": 127,
    "enrolledCourses": 3,
    "assessmentScore": "68%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.2s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 2,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 16",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "Moderate",
        "struggleDuration": "20 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x1d6a...3073",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-022",
    "name": "Umesh Tripathi",
    "email": "umesh.tripathi.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 92,
    "streak": "5 Days",
    "studyMinutes": 303,
    "enrolledCourses": 2,
    "assessmentScore": "82%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.6s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 12",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "Moderate",
        "struggleDuration": "31 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x1b19...ca2c",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-023",
    "name": "Ananya Iyer",
    "email": "ananya.iyer.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 74,
    "streak": "3 Days",
    "studyMinutes": 91,
    "enrolledCourses": 2,
    "assessmentScore": "83%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 10",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "High",
        "struggleDuration": "14 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0x6275...abb9",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-024",
    "name": "Kavya Sato",
    "email": "kavya.sato.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 53,
    "streak": "11 Days",
    "studyMinutes": 379,
    "enrolledCourses": 4,
    "assessmentScore": "88%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.2s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 10",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "Critical",
        "struggleDuration": "15 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xdb08...c3a7",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-025",
    "name": "Priya Verma",
    "email": "priya.verma.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 72,
    "streak": "17 Days",
    "studyMinutes": 176,
    "enrolledCourses": 5,
    "assessmentScore": "81%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.0s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "High",
        "struggleDuration": "22 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x7d40...6001",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-026",
    "name": "Tanvi Bhat",
    "email": "tanvi.bhat.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 54,
    "streak": "18 Days",
    "studyMinutes": 94,
    "enrolledCourses": 5,
    "assessmentScore": "70%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.4s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Data Structures & Algorithms",
      "currentTopic": "Binary Search Tree Rotations",
      "difficultLesson": "Lesson 4: AVL Self-Balancing Trees",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Need more time to type code",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 5",
        "Selected option B instead of C on Binary Search Tree Rotations edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Code Syntax Typing Speed Bottleneck",
        "details": "On-screen virtual keyboard input took 12 minutes to type a 4-line Python function; timeout reached.",
        "failureType": "Code Input Velocity Bottleneck",
        "severity": "Moderate",
        "struggleDuration": "29 mins on Binary Search Tree Rotations"
      },
      "frequentlyRequestedExplanation": "Explain Binary Search Tree Rotations step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Offer auto-complete code snippet palette and extend assessment timer by 3x."
    },
    "blockchainCerts": [
      {
        "name": "Data Structures & Algorithms Foundation",
        "hash": "0x1f5a...a622",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-027",
    "name": "Karan Nakamura",
    "email": "karan.nakamura.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Marathi",
    "progress": 87,
    "streak": "6 Days",
    "studyMinutes": 270,
    "enrolledCourses": 2,
    "assessmentScore": "79%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Head-Tracking Pointer",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Head-Tracking Pointer with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Web Accessibility Engineering",
      "currentTopic": "ARIA Live Regions & Alerts",
      "difficultLesson": "Lesson 2: Dynamic DOM Announcements",
      "repeatedHelpRequestsCount": 6,
      "lastHelpRequest": "Slow down the dwell click timer",
      "quizAttempts": 4,
      "quizIncorrectTraces": [
        "Confused syntax on line 17",
        "Selected option B instead of C on ARIA Live Regions & Alerts edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Dwell-Click Timer Too Fast",
        "details": "Head-tracking dwell cursor timer set to 800ms; auto-clicked before student could verify option selection.",
        "failureType": "Dwell Pacing Premature Trigger",
        "severity": "High",
        "struggleDuration": "23 mins on ARIA Live Regions & Alerts"
      },
      "frequentlyRequestedExplanation": "Explain ARIA Live Regions & Alerts step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Increase dwell timer threshold to 1400ms with circular visual countdown progress indicator."
    },
    "blockchainCerts": [
      {
        "name": "Web Accessibility Engineering Foundation",
        "hash": "0x2a85...a3f2",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-028",
    "name": "Kenji Mishra",
    "email": "kenji.mishra.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Telugu",
    "progress": 54,
    "streak": "18 Days",
    "studyMinutes": 174,
    "enrolledCourses": 4,
    "assessmentScore": "95%",
    "lastActive": "Active today",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Dual-Switch Step",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Dual-Switch Step with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Database Architecture",
      "currentTopic": "SQL Multi-Table Outer Joins",
      "difficultLesson": "Lesson 3: Left vs Full Outer Joins",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Recalibrate cursor position",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 9",
        "Selected option B instead of C on SQL Multi-Table Outer Joins edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Virtual Joystick Cursor Drift",
        "details": "Facial gesture switch had continuous 12px vertical drift during lesson video playback.",
        "failureType": "Gaze Tracking Drift Disalignment",
        "severity": "Moderate",
        "struggleDuration": "25 mins on SQL Multi-Table Outer Joins"
      },
      "frequentlyRequestedExplanation": "Explain SQL Multi-Table Outer Joins step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Provide 1-key quick recalibrate hotspot and lock cursor during video playback."
    },
    "blockchainCerts": [
      {
        "name": "Database Architecture Foundation",
        "hash": "0xe85c...9f9b",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-029",
    "name": "Carlos Halkude",
    "email": "carlos.halkude.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "Spanish",
    "progress": 83,
    "streak": "11 Days",
    "studyMinutes": 74,
    "enrolledCourses": 4,
    "assessmentScore": "73%",
    "lastActive": "Active 2h ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Single-Switch Scanning",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Single-Switch Scanning with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Frontend Web Development",
      "currentTopic": "CSS Flexbox vs CSS Grid",
      "difficultLesson": "Lesson 2: Responsive Two-Dimensional Layouts",
      "repeatedHelpRequestsCount": 4,
      "lastHelpRequest": "Can I jump directly to submit?",
      "quizAttempts": 3,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on CSS Flexbox vs CSS Grid edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Switch Scan Rhythm Fatigue",
        "details": "Single-switch row/column scan cycle required 28 pulses to reach submit button, causing physical strain.",
        "failureType": "Switch Scan Navigation Inefficiency",
        "severity": "High",
        "struggleDuration": "17 mins on CSS Flexbox vs CSS Grid"
      },
      "frequentlyRequestedExplanation": "Explain CSS Flexbox vs CSS Grid step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Enable high-level quadrant grouping and direct jump shortcuts for primary actions."
    },
    "blockchainCerts": [
      {
        "name": "Frontend Web Development Foundation",
        "hash": "0xeeaf...34ac",
        "date": "Oct 2026"
      }
    ]
  },
  {
    "id": "demo-motor-030",
    "name": "Chloe Chen",
    "email": "chloe.chen.demo@accessai.edu",
    "mode": "motor",
    "categoryLabel": "Motor Impaired",
    "isDemo": true,
    "dataset": "DEMO_COHORT_90",
    "language": "English",
    "progress": 49,
    "streak": "7 Days",
    "studyMinutes": 384,
    "enrolledCourses": 3,
    "assessmentScore": "68%",
    "lastActive": "Active 30m ago",
    "accommodations": {
      "primaryMode": "Assistive Motor / Switch / Head-Tracking",
      "captions": "Enabled (Standard)",
      "inputMethod": "Eyegaze Switch",
      "dwellPacing": "1.8s Dwell",
      "targetPadding": "Expanded (48px Touch Zones)",
      "debounceGuard": "180ms Anti-Tremor Filter",
      "inputPipeline": "Eyegaze Switch with Auto-Dwell Trigger"
    },
    "learningActivity": {
      "currentCourse": "Python for Everyone",
      "currentTopic": "Nested Loops & Indentation",
      "difficultLesson": "Lesson 3: Multi-dimensional Matrix Iteration",
      "repeatedHelpRequestsCount": 5,
      "lastHelpRequest": "Undo my last click, hit the wrong button",
      "quizAttempts": 1,
      "quizIncorrectTraces": [
        "Confused syntax on line 15",
        "Selected option B instead of C on Nested Loops & Indentation edge cases"
      ],
      "accessibilityFriction": {
        "issueName": "Sub-28px Button Target Misclick",
        "details": "Tremor caused 3 consecutive misclicks on 24px pagination chevron button; triggered adjacent reset button.",
        "failureType": "Interactive Target Undersized",
        "severity": "Critical",
        "struggleDuration": "22 mins on Nested Loops & Indentation"
      },
      "frequentlyRequestedExplanation": "Explain Nested Loops & Indentation step-by-step using multi-modal motor accommodations.",
      "aiRecommendation": "Expand interactive touch target padding to 48px and apply 200ms debounce guard."
    },
    "blockchainCerts": [
      {
        "name": "Python for Everyone Foundation",
        "hash": "0x384b...6ebb",
        "date": "Oct 2026"
      }
    ]
  }
];

const DEMO_STORAGE_KEY = "accessai_demo_cohort_90_v1";
const INTERVENTIONS_STORAGE_KEY = "accessai_demo_interventions_history_v1";

/**
 * Returns active 90-student demo cohort from localStorage or defaults
 */
export function getActiveDemoCohort() {
  if (typeof window === "undefined") return DEMO_COHORT_STUDENTS;
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_COHORT_STUDENTS));
      return DEMO_COHORT_STUDENTS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return DEMO_COHORT_STUDENTS;
  }
}

let _memoryInterventions = [
  {
    id: "hist-0",
    studentId: "demo-blind-002",
    studentName: "Aman Halkude",
    mode: "blind",
    topic: "Python Nested Loops & Indentation",
    recommendation: "Enabled acoustic pitch tone cues (pitch rises with indentation depth) and set speech rate to 0.85x.",
    timestamp: "Today at 08:30 AM",
    syncedToMeko: true
  }
];

/**
 * Returns Teacher Intervention History for Demo Students
 */
export function getDemoInterventionHistory() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(INTERVENTIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      return _memoryInterventions;
    } catch (e) {
      return _memoryInterventions;
    }
  }
  return _memoryInterventions;
}

/**
 * Records a teacher intervention for a demo student, persisting to history
 */
export function recordDemoIntervention(student, customRecommendation = null) {
  if (!student) return null;
  const history = getDemoInterventionHistory();
  const rec = customRecommendation || student.learningActivity?.aiRecommendation || "Personalized accommodation guidance applied.";
  
  const newEntry = {
    id: `int-rec-${Date.now()}`,
    studentId: student.studentId || student.id,
    studentName: student.studentName || student.name,
    mode: student.mode,
    topic: student.topic || student.learningActivity?.currentTopic || "General Topic",
    recommendation: rec,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    syncedToMeko: true
  };
  
  history.unshift(newEntry);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(INTERVENTIONS_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {}
  } else {
    _memoryInterventions = history;
  }
  return newEntry;
}

/**
 * Resets simulated demo cohort data without deleting real student records
 */
export function resetDemoCohortData() {
  _memoryInterventions = [
    {
      id: "hist-0",
      studentId: "demo-blind-002",
      studentName: "Aman Halkude",
      mode: "blind",
      topic: "Python Nested Loops & Indentation",
      recommendation: "Enabled acoustic pitch tone cues (pitch rises with indentation depth) and set speech rate to 0.85x.",
      timestamp: "Today at 08:30 AM",
      syncedToMeko: true
    }
  ];
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem(INTERVENTIONS_STORAGE_KEY);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_COHORT_STUDENTS));
    } catch (e) {}
  }
  return { success: true };
}

/**
 * Computes deep cognitive analytics across the 90 demo students
 */
export function computeCohortAnalytics(students = null) {
  const list = students || getActiveDemoCohort();
  const total = list.length;
  const deafStudents = list.filter(s => s.mode === "deaf");
  const blindStudents = list.filter(s => s.mode === "blind");
  const motorStudents = list.filter(s => s.mode === "motor");

  // 1. Category-Wise Learning Difficulties
  const difficultiesByCategory = {
    deaf: {
      count: deafStudents.length,
      primaryStruggle: "Sign Recognition Jitter & Velocity Desync",
      avgHoldStabilization: "640ms",
      captionReliance: "99.4%",
      commonIssues: [
        "Rapid fingerspelling velocity exceeding 650ms hold window",
        "Technical terminology missing ASL/ISL sign gloss",
        "Web speech live caption streaming latency (2.4s buffer lag)",
        "Low contrast lighting causing MediaPipe landmark jitter"
      ]
    },
    blind: {
      count: blindStudents.length,
      primaryStruggle: "Complex Diagram Navigation & Missing Alt Text",
      avgSpeechRate: "0.95x",
      auditoryReliance: "100%",
      commonIssues: [
        "Unlabeled SVG diagrams lacking semantic hierarchy",
        "Python indentation depth visual-only representation",
        "Speech-to-text recognition errors in background noise",
        "Dynamic DOM mutations missing aria-live assertions"
      ]
    },
    motor: {
      count: motorStudents.length,
      primaryStruggle: "Sub-28px Hit Target Misclicks & Switch Fatigue",
      avgDwellTime: "1.4s Dwell",
      targetExpansion: "48px Required",
      commonIssues: [
        "Button targets under 28px triggering adjacent options",
        "Dwell-click timer pacing too fast for verification",
        "Single-switch scanning requiring high pulse counts",
        "Virtual keyboard velocity bottlenecks during coding"
      ]
    }
  };

  // 2. Most Frequently Encountered Accessibility Issues (Ranked)
  const issueCounts = {};
  list.forEach(s => {
    const issue = s.learningActivity?.accessibilityFriction?.issueName;
    if (issue) {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }
  });
  const topAccessibilityIssues = Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // 3. Commonly Difficult Learning Topics (Ranked Heatmap)
  const topicCounts = {};
  list.forEach(s => {
    const topic = s.learningActivity?.currentTopic;
    if (topic) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  });
  const topDifficultTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // 4. Prioritized Teacher Intervention Queue
  const interventionQueue = list
    .filter(s => s.learningActivity?.accessibilityFriction?.severity === "Critical" || s.learningActivity?.accessibilityFriction?.severity === "High")
    .map(s => ({
      id: `int-${s.id}`,
      studentId: s.id,
      studentName: s.name,
      mode: s.mode,
      categoryLabel: s.categoryLabel,
      topic: s.learningActivity?.currentTopic,
      severity: s.learningActivity?.accessibilityFriction?.severity || "High",
      struggleTime: s.learningActivity?.accessibilityFriction?.struggleDuration || "20 mins",
      issue: s.learningActivity?.accessibilityFriction?.issueName,
      details: s.learningActivity?.accessibilityFriction?.details,
      aiRecommendation: s.learningActivity?.aiRecommendation,
      accommodations: s.accommodations
    }));

  return {
    total,
    counts: {
      deaf: deafStudents.length,
      blind: blindStudents.length,
      motor: motorStudents.length
    },
    difficultiesByCategory,
    topAccessibilityIssues,
    topDifficultTopics,
    interventionQueue
  };
}
