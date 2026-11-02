/**
 * Master Gesture Mapping & Sign Language Dictionary
 * Provides complete anatomical configurations, 3D pose parameters,
 * linguistic descriptions, non-manual markers, and step-by-step explanations.
 */

export const GESTURE_CATEGORIES = {
  COMMANDS: "commands",
  GREETINGS: "greetings",
  BASICS: "basics",
  EXPRESSIONS: "expressions"
};

export const SUPPORTED_SPEEDS = [
  { value: 1.0, label: "1.0x", description: "Normal Speed" },
  { value: 0.5, label: "0.5x", description: "Slow Motion" },
  { value: 0.25, label: "0.25x", description: "Ultra Slow-Mo (Study)" }
];

export const GESTURES = [
  {
    id: "Thumb_Up",
    signName: "Thumbs Up / Good",
    label: "Thumbs Up",
    icon: "👍",
    category: GESTURE_CATEGORIES.COMMANDS,
    difficulty: "Beginner",
    summary: "Select / Confirm active item or indicate 'Good' / approval.",
    speechText: "Selected. Good job!",
    avatarAction: "thumbs_up",
    poseParameters: {
      headTilt: { x: 0.12, y: 0, z: 0 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: -0.75, y: 0, z: -0.45 },
        elbow: { x: 0, y: 0, z: -1.1 },
        wrist: { x: 0, y: 0.4, z: 0 }
      },
      rightFingers: {
        thumb: { curl: -0.7, spread: 0.2, extended: true },
        index: { curl: 1.5, spread: 0 },
        middle: { curl: 1.55, spread: 0 },
        ring: { curl: 1.6, spread: 0 },
        pinky: { curl: 1.65, spread: 0 }
      },
      leftArm: {
        shoulder: { x: -0.3, y: 0, z: 0.25 },
        elbow: { x: 0, y: 0, z: 0.5 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "Curl fingers into a firm fist with thumb pointed vertically upward.",
      orientation: "Palm faces towards your midline/chest, thumb pointing straight up.",
      location: "Held at lower chest level, approximately 15-20cm in front of your torso.",
      movement: "A brisk upward affirmation thrust of 5-8cm with a solid, confident stop.",
      nonManualMarkers: "Slight affirmative head nod with relaxed, pleasant facial expression and direct eye contact.",
      memoryTip: "Think of an arrow pointing up to emphasize positive affirmation.",
      commonMistakes: [
        "Tilting the thumb too far forward horizontally.",
        "Leaving index or middle fingers partially uncurled."
      ],
      steps: [
        "Form a relaxed fist with all four fingers resting securely in the palm.",
        "Extend your thumb vertically upwards so it points straight towards the ceiling.",
        "Position hand in front of your chest and perform a gentle, affirmative nod."
      ]
    }
  },
  {
    id: "Pointing_Up",
    signName: "Point Up / Index (One)",
    label: "Pointing Up",
    icon: "☝️",
    category: GESTURE_CATEGORIES.COMMANDS,
    difficulty: "Beginner",
    summary: "Navigates to Courses catalog or denotes the number 'One'.",
    speechText: "Navigating to courses catalog.",
    avatarAction: "point_courses",
    poseParameters: {
      headTilt: { x: -0.08, y: 0.12, z: 0 },
      torsoTwist: 0.05,
      rightArm: {
        shoulder: { x: -1.3, y: 0.15, z: -0.32 },
        elbow: { x: -0.15, y: 0, z: -0.2 },
        wrist: { x: 0.1, y: 0.2, z: 0 }
      },
      rightFingers: {
        thumb: { curl: 0.6, spread: 0 },
        index: { curl: -0.05, spread: 0, extended: true },
        middle: { curl: 1.4, spread: 0 },
        ring: { curl: 1.45, spread: 0 },
        pinky: { curl: 1.5, spread: 0 }
      },
      leftArm: {
        shoulder: { x: -0.4, y: 0, z: 0.4 },
        elbow: { x: 0, y: 0, z: 0.7 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "Index finger fully extended straight upward, all other three fingers curled into palm with thumb resting across middle finger.",
      orientation: "Palm faces towards your left (inward) or slightly forward.",
      location: "Shoulder level, held firmly in your central signing space.",
      movement: "Extend upward deliberately, holding position steady.",
      nonManualMarkers: "Gaze follows direction of the pointer or stays locked on the recipient for attention.",
      memoryTip: "The classic 'number one' index pose pointing towards learning opportunities.",
      commonMistakes: [
        "Letting thumb stick out instead of securing it over the middle finger.",
        "Curving the index finger instead of locking it straight."
      ],
      steps: [
        "Curl middle, ring, and pinky fingers tightly into the palm.",
        "Tuck thumb over the folded middle finger.",
        "Extend the index finger straight up, maintaining a locked second knuckle."
      ]
    }
  },
  {
    id: "Victory",
    signName: "Victory / Peace / Two (V)",
    label: "Victory / Peace",
    icon: "✌️",
    category: GESTURE_CATEGORIES.COMMANDS,
    difficulty: "Beginner",
    summary: "Returns to Home Dashboard or denotes the number 'Two' / letter 'V'.",
    speechText: "Navigating to home dashboard.",
    avatarAction: "peace",
    poseParameters: {
      headTilt: { x: -0.05, y: -0.05, z: 0 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: -0.85, y: 0, z: -0.5 },
        elbow: { x: 0, y: 0, z: -1.15 },
        wrist: { x: 0, y: 0.2, z: 0 }
      },
      rightFingers: {
        thumb: { curl: 0.9, spread: 0 },
        index: { curl: -0.05, spread: 0.2, extended: true },
        middle: { curl: -0.05, spread: -0.2, extended: true },
        ring: { curl: 1.5, spread: 0 },
        pinky: { curl: 1.5, spread: 0 }
      },
      leftArm: {
        shoulder: { x: -0.25, y: 0, z: 0.2 },
        elbow: { x: 0, y: 0, z: 0.4 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "Index and middle fingers extended upward in a distinct 'V' shape; ring, pinky, and thumb folded in.",
      orientation: "Palm faces forward toward the viewer or camera.",
      location: "Mid-chest to shoulder level.",
      movement: "Hold static or give a slight subtle upward bounce.",
      nonManualMarkers: "Friendly, relaxed expression with a calm posture.",
      memoryTip: "V for Victory, 2 for dual fingers extended.",
      commonMistakes: [
        "Holding index and middle fingers together rather than spreading them into a 'V'.",
        "Turning the palm inward (can change cultural connotation in some regions)."
      ],
      steps: [
        "Curl ring and little fingers into palm with thumb holding them down.",
        "Extend index and middle fingers straight up.",
        "Spread them apart into a crisp, symmetrical 'V' shape."
      ]
    }
  },
  {
    id: "ILoveYou",
    signName: "I Love You (ILY)",
    label: "I Love You (ILY)",
    icon: "🤟",
    category: GESTURE_CATEGORIES.EXPRESSIONS,
    difficulty: "Intermediate",
    summary: "Opens Sign Practice Arena or expresses the iconic ASL 'I Love You'.",
    speechText: "Opening ASL sign practice arena.",
    avatarAction: "ily",
    poseParameters: {
      headTilt: { x: -0.04, y: 0.08, z: 0 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: -0.82, y: 0, z: -0.48 },
        elbow: { x: 0, y: 0, z: -1.1 },
        wrist: { x: 0, y: 0.2, z: 0 }
      },
      rightFingers: {
        thumb: { curl: -0.4, spread: 0.4, extended: true },
        index: { curl: -0.05, spread: 0, extended: true },
        middle: { curl: 1.5, spread: 0 },
        ring: { curl: 1.5, spread: 0 },
        pinky: { curl: -0.05, spread: 0.3, extended: true }
      },
      leftArm: {
        shoulder: { x: -0.3, y: 0, z: 0.3 },
        elbow: { x: 0, y: 0, z: 0.5 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "Thumb, index finger, and pinky finger fully extended; middle and ring fingers curled into the palm.",
      orientation: "Palm faces forward toward the camera or conversation partner.",
      location: "Held prominently at chest height in the central signing zone.",
      movement: "Hold steady or gently swivel wrist side to side.",
      nonManualMarkers: "Warm, genuine smile with open eye contact.",
      memoryTip: "Combines the manual letters 'I', 'L', and 'Y' from American Sign Language into a single handshape.",
      commonMistakes: [
        "Accidentally tucking the thumb in, which turns it into the 'Rock On' horn gesture.",
        "Leaving middle finger partially raised."
      ],
      steps: [
        "Extend your hand flat.",
        "Curl middle and ring fingers down into the palm.",
        "Keep thumb, index, and pinky finger fully extended outward."
      ]
    }
  },
  {
    id: "Open_Palm",
    signName: "Open Palm / Hello / Wave",
    label: "Open Palm / Wave",
    icon: "✋",
    category: GESTURE_CATEGORIES.GREETINGS,
    difficulty: "Beginner",
    summary: "Asks AI Assistant for Help, Greets ('Hello'), or signals 'Stop'.",
    speechText: "Hello! Here are the available commands and gestures.",
    avatarAction: "wave",
    poseParameters: {
      headTilt: { x: -0.04, y: 0, z: 0.06 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: 0.2, y: 0, z: -1.35 },
        elbow: { x: 0, y: 0, z: -1.1 },
        wrist: { x: 0, y: 0, z: 0.25 }
      },
      rightFingers: {
        thumb: { curl: 0.1, spread: 0.3, extended: true },
        index: { curl: 0.25, spread: 0.05, extended: true },
        middle: { curl: 0.35, spread: 0, extended: true },
        ring: { curl: 0.45, spread: -0.05, extended: true },
        pinky: { curl: 0.55, spread: -0.1, extended: true }
      },
      leftArm: {
        shoulder: { x: 0.12, y: 0, z: 0.18 },
        elbow: { x: 0, y: 0, z: 0.3 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "All five fingers open, comfortably relaxed, natural palm curvature.",
      orientation: "Palm facing outward toward the observer.",
      location: "Head to shoulder level in open upper signing space.",
      movement: "Gentle rhythmic side-to-side oscillation of the wrist.",
      nonManualMarkers: "Warm, welcoming smile with raised eyebrows.",
      memoryTip: "The universal human greeting wave.",
      commonMistakes: [
        "Stiffening fingers completely flat like a wooden board.",
        "Over-swinging elbow rather than rotating from the wrist."
      ],
      steps: [
        "Raise hand up to cheek or temple height.",
        "Open all five fingers naturally.",
        "Oscillate hand gently from side to side from the wrist."
      ]
    }
  },
  {
    id: "Closed_Fist",
    signName: "Closed Fist / Back / Close",
    label: "Closed Fist",
    icon: "✊",
    category: GESTURE_CATEGORIES.COMMANDS,
    difficulty: "Beginner",
    summary: "Closes modal dialog or navigates back to previous view.",
    speechText: "Going back.",
    avatarAction: "fist",
    poseParameters: {
      headTilt: { x: 0.06, y: 0, z: 0 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: -0.7, y: 0, z: -0.35 },
        elbow: { x: 0, y: 0, z: -1.0 },
        wrist: { x: 0, y: 0.2, z: 0 }
      },
      rightFingers: {
        thumb: { curl: 1.2, spread: 0 },
        index: { curl: 1.6, spread: 0 },
        middle: { curl: 1.65, spread: 0 },
        ring: { curl: 1.7, spread: 0 },
        pinky: { curl: 1.75, spread: 0 }
      },
      leftArm: {
        shoulder: { x: -0.2, y: 0, z: 0.2 },
        elbow: { x: 0, y: 0, z: 0.4 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "All four fingers curled tightly into palm, thumb wrapped securely over the middle phalanges (ASL 'S' handshape).",
      orientation: "Palm facing towards your body or slightly inward.",
      location: "Central chest height, held steady.",
      movement: "Firm, static hold signifying a decisive close or return.",
      nonManualMarkers: "Firm, decisive facial expression with closed lips.",
      memoryTip: "A solid fist represents closure or stopping the current screen.",
      commonMistakes: [
        "Tucking thumb under fingers rather than wrapping it outside.",
        "Leaving loose gaps between fingers."
      ],
      steps: [
        "Curl all four fingers completely down into the palm.",
        "Wrap thumb across the front of the index and middle fingers.",
        "Hold firmly at mid-chest height."
      ]
    }
  },
  {
    id: "Thank_You",
    signName: "Thank You (ASL)",
    label: "Thank You",
    icon: "🙏",
    category: GESTURE_CATEGORIES.EXPRESSIONS,
    difficulty: "Beginner",
    summary: "Essential polite sign to express gratitude.",
    speechText: "Thank you!",
    avatarAction: "thank_you",
    poseParameters: {
      headTilt: { x: 0.1, y: 0, z: 0 },
      torsoTwist: 0,
      rightArm: {
        shoulder: { x: -0.8, y: 0, z: -0.2 },
        elbow: { x: 0, y: 0, z: -1.3 },
        wrist: { x: 0.2, y: 0.1, z: 0 }
      },
      rightFingers: {
        thumb: { curl: 0.1, spread: 0.2, extended: true },
        index: { curl: 0.15, spread: 0, extended: true },
        middle: { curl: 0.15, spread: 0, extended: true },
        ring: { curl: 0.2, spread: 0, extended: true },
        pinky: { curl: 0.25, spread: 0, extended: true }
      },
      leftArm: {
        shoulder: { x: -0.1, y: 0, z: 0.15 },
        elbow: { x: 0, y: 0, z: 0.3 },
        wrist: { x: 0, y: 0, z: 0 }
      }
    },
    explanation: {
      handshape: "Flat hand with fingers joined together.",
      orientation: "Fingertips begin lightly touching the chin or lips, palm facing inwards.",
      location: "Chin level, then moving outward and slightly downward toward the recipient.",
      movement: "Smooth outward motion extending hand forward towards the person you are thanking.",
      nonManualMarkers: "Warm smile and polite head bow/nod.",
      memoryTip: "Blowing a gracious blessing from your lips outward to your friend.",
      commonMistakes: [
        "Starting from the forehead instead of the chin (forehead is 'Good' or 'Father').",
        "Moving too abruptly or aggressively."
      ],
      steps: [
        "Place the tips of your flat dominant hand near your chin or lips.",
        "Move your hand outward and downward toward the other person.",
        "Accompany with a sincere smile and slight nod."
      ]
    }
  }
];

/**
 * Retrieve a gesture by ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getGestureById(id) {
  if (!id) return null;
  return GESTURES.find(g => g.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Retrieve all gestures.
 * @returns {Array<object>}
 */
export function getAllGestures() {
  return GESTURES;
}

/**
 * Filter gestures by category.
 * @param {string} category
 * @returns {Array<object>}
 */
export function getGesturesByCategory(category) {
  if (!category || category === "all") return GESTURES;
  return GESTURES.filter(g => g.category.toLowerCase() === category.toLowerCase());
}

/**
 * Search gestures by title, keyword, or action.
 * @param {string} query
 * @returns {Array<object>}
 */
export function searchGestures(query) {
  if (!query) return GESTURES;
  const q = query.toLowerCase().trim();
  return GESTURES.filter(g =>
    g.label.toLowerCase().includes(q) ||
    g.signName.toLowerCase().includes(q) ||
    g.summary.toLowerCase().includes(q) ||
    g.explanation.handshape.toLowerCase().includes(q)
  );
}

const gestureMapping = {
  GESTURES,
  GESTURE_CATEGORIES,
  SUPPORTED_SPEEDS,
  getGestureById,
  getAllGestures,
  getGesturesByCategory,
  searchGestures
};

export default gestureMapping;
