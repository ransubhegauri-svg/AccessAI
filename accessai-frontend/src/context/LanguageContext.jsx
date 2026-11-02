import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export const LANGUAGES = [
  {
    code: "en",
    label: "English",
    nativeName: "English",
    flag: "Eng",
    speechLang: "en-US",
    localeLabel: "English (US)"
  },
  {
    code: "hi",
    label: "Hin",
    nativeName: "हिंदी",
    flag: "hindi",
    speechLang: "hi-IN",
    localeLabel: "हिन्दी (भारत)"
  },
  {
    code: "kn",
    label: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "ka",
    speechLang: "kn-IN",
    localeLabel: "ಕನ್ನಡ (ಭಾರತ)"
  }
];

const TRANSLATIONS = {
  en: {
    // Brand & Header
    app_title: "AccessAI",
    modes_badge: "3 Adaptive Modes",
    select_mode: "Select Mode",
    dashboard: "Dashboard",
    sign_out: "Sign Out",
    signed_in_as: "Signed in as",
    current_mode: "Current Mode:",
    continue_dashboard: "Continue to Dashboard",

    // Step Flow on Landing Page
    step_1_title: "Choose Your Preferred Language",
    step_1_sub: "Select a language to customize voice narration, live subtitles, and learning controls.",
    step_1_badge: "Step 1 of 2",
    step_2_badge: "Step 2 of 2",
    step_indicator: "Language Selection",
    continue_to_modes: "Continue to Mode Selection",
    change_language: "Change Language",
    select_language_prompt: "Select a language to proceed",

    // Landing Hero (Step 2)
    welcome_title: "Welcome to AccessAI",
    welcome_sub: "An AI-powered multimodal platform tailored for your sensory and mobility needs. Choose an adaptive mode below to begin.",
    select_prompt: "Select an accessibility profile above to continue",
    sign_in: "Sign In",
    create_account: "Create Account",
    demo_badge: "Demo Mode Active",
    selected: "Selected",
    switch_to_mode: "Switch to this mode",
    active: "Active",

    // Modes
    mode_blind_title: "Blind & Low Vision",
    mode_blind_desc: "Complete voice-driven experience with natural sound cues, screen reader narration, and conversational control.",
    mode_deaf_title: "Deaf & Hard of Hearing",
    mode_deaf_desc: "Visual sign language AI avatar, interactive ASL/ISL curriculum, real-time sign recognition camera, and rich captions.",
    mode_motor_title: "Motor & Mobility",
    mode_motor_desc: "Hands-free head tracking cursor, dwell clicking, customizable sensitivity, and facial gesture triggers.",

    // Deaf Dashboard Navigation & Header
    deaf_dash_title: "Deaf & Hard of Hearing Hub",
    deaf_dash_subtitle: "Visual sign language & caption learning platform",
    tab_home: "Overview",
    tab_career_paths: "Career Paths",
    tab_courses: "Course Library",
    tab_learning: "My Learning",
    tab_practice: "Sign Practice",
    tab_ai_tutor: "AI Tutor",
    tab_activity: "Activity Dashboard",
    tab_profile: "Profile & Certificates",
    tab_settings: "Accessibility Settings",
    deaf_role: "Deaf Accessibility Analyst",
    open_sign_arena: "Open Sign Arena",
    stop_camera: "Stop Camera",
    weekly_study_minutes: "Weekly Study Minutes",
    fluency_progress: "Fluency Progress",
    earned_badges: "Earned Badges",
    my_certificates: "My Certificates",
    ai_study_companion: "AI Study Companion",
    ai_companion_desc: "Generate custom visual quizzes or ask grammar questions instantly.",
    chat_with_tutor: "Chat with AI Tutor",
    recommended_for_you: "Recommended for you",
    system_notifications: "System Notifications",

    // Deaf Dashboard Welcome Banner & Stats
    greeting_user: "Hello, {name}!",
    deaf_welcome_msg: "Welcome to AccessAI e-learning! Expand your signing vocabulary and ASL syntax. Everything is adapted visually for you, no audio required.",
    day_streak: "Day Streak",
    spent_today: "Spent Today",
    daily_goals: "DAILY GOALS",
    today_goal_label: "Today's goal: 30 minutes",
    done_pct: "83% Done",
    progress_overview: "PROGRESS OVERVIEW",
    completed_courses_label: "2 Completed Courses",
    average_progress: "50% Average",

    // Nova Avatar Banner in Dashboard
    nova_banner_title: "Nova AI • 3D Sign Language Avatar",
    nova_persistent_badge: "PERSISTENT BOT",
    nova_banner_desc: "Nova is now docked in the bottom-right corner across all tabs. Enable your camera anytime to sign commands (☝️ Courses, ✌️ Home, 🤟 Practice) and navigate effortlessly.",

    // Continue Learning & Course Library
    continue_learning: "Continue Learning",
    focused_to_select: "FOCUSED (👍 TO SELECT)",
    beginner_badge: "BEGINNER",
    intermediate_badge: "INTERMEDIATE",
    advanced_badge: "ADVANCED",
    course_progress: "Course Progress",
    filter_all: "All Categories",
    filter_language: "Sign Language",
    filter_vocabulary: "Vocabulary",
    filter_syntax: "Grammar & Syntax",
    search_courses: "Search sign language courses...",
    start_lesson: "Start Lesson",
    resume_course: "Resume Course",
    practice_arena: "Practice Sign",
    completed: "Completed",
    in_progress: "In Progress",

    // Translated Courses Content
    "course-1_title": "American Sign Language Alphabet",
    "course-1_desc": "Learn to spell your name and master the basic letters (A-Z) in American Sign Language.",
    "course-2_title": "Basic ASL Sentences & Greetings",
    "course-2_desc": "Essential greetings, common expressions, and simple conversational starters in sign language.",
    "course-3_title": "Sign Language: Numbers & Colors",
    "course-3_desc": "Learn the fundamentals of counting, expressions, and identifying colors in ASL.",
    "course-4_title": "Advanced Conversational Sign Language",
    "course-4_desc": "Improve your signing speed, sentence syntax, and understand advanced non-manual markers.",

    // Nova Avatar & Bot Floating Window
    nova_assistant: "Nova Sign AI",
    nova_bot_title: "Nova • Sign Avatar Bot",
    nova_tagline: "Available across all tabs",
    nova_greeting: "👋 Hi! I am Nova, your 3D Sign Language AI. Sign gestures in front of the camera (e.g. ☝️ Courses, ✌️ Home) to navigate anywhere!",
    nova_tab_camera: "Sign Camera",
    nova_tab_chat: "Captions & History",
    nova_tab_guide: "Sign Guide",
    enable_camera: "Enable Sign Camera",
    camera_watching: "Watching signs...",
    quick_commands: "Quick Commands",
    hold_to_trigger: "Hold 0.6s to trigger",
    voice_on: "Voice ON (Speaks aloud)",
    voice_silent: "Silent Mode (Visual only for deaf users)",
    voice_enabled_notice: "🔊 Voice Audio Enabled.",
    voice_silent_notice: "🔇 Silent Mode active.",
    loading_ai: "Loading AI...",
    turn_on_camera_hint: "Turn on camera to control the app with sign language gestures.",

    // Sign Commands
    cmd_courses_action: "Go to Courses",
    cmd_courses_desc: "Points directly to the courses catalog and learning modules",
    cmd_home_action: "Home Dashboard",
    cmd_home_desc: "Returns to your main Deaf/Mute Dashboard overview",
    cmd_practice_action: "Sign Practice & Quiz",
    cmd_practice_desc: "Opens the real-time Sign Language learning & practice arena",
    cmd_select_action: "Select / Confirm",
    cmd_select_desc: "Selects the highlighted option or launches the active course lesson",
    cmd_help_action: "Help & Commands",
    cmd_help_desc: "Asks the AI Avatar for help and displays available sign commands",
    cmd_back_action: "Back / Close",
    cmd_back_desc: "Closes modal or navigates back",

    // Voice Engine Status
    voice_listening: "Listening...",
    voice_speaking: "Speaking...",
    voice_paused: "Paused",
    voice_ready: "Ready",

    // Multi-language Picker
    choose_language: "Select Language",
    language_switched: "Language set to English.",

    // Signup Field Names & Labels
    field_first_name: "First Name",
    field_last_name: "Last Name",
    field_full_name: "Full Name",
    field_email: "Email Address",
    field_phone: "Phone Number",
    field_mobile_number: "Mobile Number",
    field_accessibility: "Accessibility Preferences",
    field_age: "Age",
    field_gender: "Gender",
    field_password: "Password",
    field_confirm_password: "Confirm Password",

    // Dropdown choices
    select_gender: "Select Gender",
    gender_male: "Male",
    gender_female: "Female",
    gender_other: "Other",
    gender_prefer_not: "Prefer not to say",
    pref_blind: "Blind / Low Vision",
    pref_deaf: "Deaf / Hard of Hearing",
    pref_motor: "Motor Impaired",
    pref_none: "None",

    // Signup Titles & Descriptions
    title_signup_blind: "Create Blind Account",
    sub_signup_blind: "Please register using the voice prompt wizard, or fill out credentials below.",
    title_signup_motor: "Create Motor Account",
    sub_signup_motor: "Use hands-free head tracking and dwell or voice prompt wizard to register.",
    title_signup_deaf: "Create Deaf Account",
    sub_signup_deaf: "Register your profile. Configure your caption and visual settings.",

    // Action Buttons & Labels
    btn_create_account: "Create Account",
    btn_creating_account: "Creating account...",
    btn_already_registered: "Already registered?",
    btn_back_to_login: "Back to Login",
    btn_activate_voice: "Activate Voice Assistant",
    btn_stop_voice: "Stop Voice",
    voice_mode_active: "Voice Mode: ACTIVE",
    voice_mode_activate: "Activate Voice Mode",
    badge_voice_assistant: "Voice Assistant",
    label_heard: "Heard",

    // Spoken Prompts & Feedbacks
    prompt_welcome_signup: "Welcome to AccessAI. I will help you create your account. Let's begin. Step 1 of 8. First Name. What is your first name?",
    prompt_step_first_name: "Step 1 of 8. First Name. What is your first name?",
    prompt_confirm_first_name: "I heard {name}. Is that correct? Please say Yes or No.",
    prompt_step_last_name: "Step 2 of 8. Last Name. What is your last name?",
    prompt_confirm_last_name: "I heard {name}. Is that correct? Please say Yes or No.",
    prompt_step_email: "Step 3 of 8. Email Address. Let's enter your email address. We will do it step by step. Please say only the username of your email.",
    prompt_step_phone: "Step 4 of 8. Mobile Number. What is your mobile number?",
    prompt_confirm_phone: "I heard {digits}. Is that correct? Please say Yes or No.",
    prompt_step_age: "Step 5 of 8. Age. What is your age?",
    prompt_confirm_age: "I heard {age}. Is that correct? Please say Yes or No.",
    prompt_step_gender: "Step 6 of 8. Gender. What is your gender?",
    prompt_confirm_gender: "I heard {gender}. Is that correct? Please say Yes or No.",
    prompt_step_password: "Step 7 of 8. Password. Please create your password.",
    prompt_confirm_password: "Please confirm your password.",
    prompt_summary_create: "Step 8 of 8. Create Account. Your account information is complete. Would you like to create your account?",
    prompt_saved: "Saved.",
    prompt_try_again_first_name: "Let's try again. What is your first name?",
    prompt_try_again_last_name: "Let's try again. What is your last name?",
    prompt_try_again: "Let's try again.",
    prompt_passwords_match: "Passwords match. Saved.",
    prompt_passwords_mismatch: "The passwords do not match. Let's try again. Please create a password.",
    prompt_password_min_length: "Password must be at least six characters. Please say it again.",
    prompt_phone_length_error: "Mobile number must be exactly ten digits. Please say it digit by digit.",
    prompt_age_parse_error: "I couldn't understand that age. Please say your age as a number. For example, twenty one.",
    prompt_confirm_say_yes_no: "Please say Yes or No to confirm.",
    prompt_registration_success: "Congratulations. Your AccessAI account has been created successfully. Redirecting you to your dashboard.",
    prompt_registration_failed: "Voice registration failed. Let's restart.",
    prompt_registering_account: "Registering your account now.",
    prompt_start_over: "Let's start over.",
    prompt_voice_cancelled: "Voice assistant cancelled.",
    prompt_name_cleared: "Name cleared. Please say your name again.",
    prompt_email_provider: "Now please tell me your email provider. For example Gmail, Outlook or Yahoo.",
    prompt_confirm_email: "I heard {email}. Is this correct? Please say Yes or No.",
    prompt_email_confirmed: "Email confirmed. Continuing.",
    prompt_email_retry: "Let's enter your email address. We will do it step by step. Please say only the username of your email.",
    prompt_didnt_hear: "I didn't hear that. Please say it again.",
    field_skipped: "{field} skipped.",
    field_required_cannot_skip: "This field is required and cannot be skipped.",
    err_passwords_match: "Passwords do not match.",
    err_phone_length: "Mobile number must be exactly 10 digits."
  },

  hi: {
    // Brand & Header
    app_title: "AccessAI",
    modes_badge: "3 अनुकूली मोड",
    select_mode: "मोड चुनें",
    dashboard: "डैशबोर्ड",
    sign_out: "साइन आउट",
    signed_in_as: "उपयोगकर्ता:",
    current_mode: "वर्तमान मोड:",
    continue_dashboard: "डैशबोर्ड पर जारी रखें",

    // Step Flow on Landing Page
    step_1_title: "अपनी पसंदीदा भाषा चुनें",
    step_1_sub: "आवाज मार्गदर्शन, लाइव उपशीर्षक और नियंत्रणों को अनुकूलित करने के लिए अपनी भाषा चुनें।",
    step_1_badge: "चरण 1 / 2",
    step_2_badge: "चरण 2 / 2",
    step_indicator: "भाषा चयन",
    continue_to_modes: "मोड चयन के लिए आगे बढ़ें",
    change_language: "भाषा बदलें",
    select_language_prompt: "आगे बढ़ने के लिए भाषा चुनें",

    // Landing Hero (Step 2)
    welcome_title: "AccessAI में आपका स्वागत है",
    welcome_sub: "आपकी संवेदी और गतिशीलता आवश्यकताओं के लिए तैयार एक एआई-संचालित मल्टीमॉडल लर्निंग प्लेटफॉर्म। शुरू करने के लिए नीचे एक मोड चुनें।",
    select_prompt: "आगे बढ़ने के लिए ऊपर एक एक्सेसिबिलिटी प्रोफ़ाइल चुनें",
    sign_in: "साइन इन करें",
    create_account: "खाता बनाएं",
    demo_badge: "डेमो मोड सक्रिय",
    selected: "चयनित",
    switch_to_mode: "इस मोड पर स्विच करें",
    active: "सक्रिय",

    // Modes
    mode_blind_title: "दृष्टिबाधित और कम दृष्टि",
    mode_blind_desc: "प्राकृतिक ध्वनि संकेतों, स्क्रीन रीडर कथन और संवादात्मक आवाज नियंत्रण के साथ संपूर्ण आवाज-संचालित अनुभव।",
    mode_deaf_title: "बधिर और श्रवण बाधित",
    mode_deaf_desc: "विजुअल सांकेतिक भाषा एआई अवतार, इंटरैक्टिव ASL/ISL पाठ्यक्रम, रीयल-टाइम साइन रिकग्निशन कैमरा और विस्तृत कैप्शन।",
    mode_motor_title: "मोटर और गतिशीलता",
    mode_motor_desc: "हैंड्स-फ्री हेड ट्रैकिंग कर्सर, ड्वेल क्लिकिंग, अनुकूलन योग्य संवेदनशीलता और चेहरे के हाव-भाव ट्रिगर।",

    // Deaf Dashboard Navigation & Header
    deaf_dash_title: "बधिर एवं मूक शिक्षण केंद्र",
    deaf_dash_subtitle: "विजुअल सांकेतिक भाषा और कैप्शन शिक्षण मंच",
    tab_home: "अवलोकन",
    tab_career_paths: "करियर पथ",
    tab_courses: "पाठ्यक्रम संग्रह",
    tab_learning: "मेरी शिक्षा",
    tab_practice: "साಂकेतिक अभ्यास",
    tab_ai_tutor: "एआई ट्यूटर",
    tab_activity: "गतिविधि डैशबोर्ड",
    tab_profile: "प्रोफ़ाइल और प्रमाणपत्र",
    tab_settings: "एक्सेसिबिलिटी सेटिंग्स",
    deaf_role: "बधिर सुगम्यता विश्लेषक",
    open_sign_arena: "साइन एरिना खोलें",
    stop_camera: "कैमरा रोकें",
    weekly_study_minutes: "साप्ताहिक अध्ययन मिनट",
    fluency_progress: "प्रवाह प्रगति",
    earned_badges: "अर्जित बैज",
    my_certificates: "मेरे प्रमाण पत्र",
    ai_study_companion: "एआई अध्ययन साथी",
    ai_companion_desc: "कस्टम दृश्य क्विज़ बनाएं या व्याकरण संबंधी प्रश्न पूछें।",
    chat_with_tutor: "एआई ट्यूटर से चैट करें",
    recommended_for_you: "आपके लिए अनुशंसित",
    system_notifications: "सिस्टम सूचनाएं",

    // Deaf Dashboard Welcome Banner & Stats
    greeting_user: "नमस्ते, {name}!",
    deaf_welcome_msg: "AccessAI ई-लर्निंग में आपका स्वागत है! अपनी सांकेतिक शब्दावली और व्याकरण का विस्तार करें। सब कुछ आपके लिए विशेष रूप से दृश्य रूप में अनुकूलित है, किसी ऑडियो की आवश्यकता नहीं है।",
    day_streak: "दिनों का स्ट्रीक",
    spent_today: "आज बिताया समय",
    daily_goals: "दैनिक लक्ष्य",
    today_goal_label: "आज का लक्ष्य: 30 मिनट",
    done_pct: "83% पूर्ण",
    progress_overview: "प्रगति अवलोकन",
    completed_courses_label: "2 पूर्ण पाठ्यक्रम",
    average_progress: "50% औसत",

    // Nova Avatar Banner in Dashboard
    nova_banner_title: "नोवा एआई • 3D सांकेतिक भाषा अवतार",
    nova_persistent_badge: "स्थायी बॉट",
    nova_banner_desc: "नोवा अब सभी टैब में नीचे-दाएं कोने में उपलब्ध है। सांकेतिक आदेशों (☝️ पाठ्यक्रम, ✌️ होम, 🤟 अभ्यास) के साथ आसानी से नेविगेट करने के लिए किसी भी समय अपना कैमरा चालू करें।",

    // Continue Learning & Course Library
    continue_learning: "सीखना जारी रखें",
    focused_to_select: "फ़ोकस (चुनने के लिए 👍)",
    beginner_badge: "शुरुआती",
    intermediate_badge: "मध्यवर्ती",
    advanced_badge: "उन्नत",
    course_progress: "पाठ्यक्रम प्रगति",
    filter_all: "सभी श्रेणियां",
    filter_language: "सांकेतिक भाषा",
    filter_vocabulary: "शब्दावली",
    filter_syntax: "व्याकरण और वाक्यविन्यास",
    search_courses: "सांकेतिक भाषा पाठ्यक्रम खोजें...",
    start_lesson: "पाठ शुरू करें",
    resume_course: "पाठ्यक्रम जारी रखें",
    practice_arena: "साइन अभ्यास",
    completed: "पूर्ण",
    in_progress: "प्रगति पर",

    // Translated Courses Content
    "course-1_title": "अमेरिकन सांकेतिक भाषा वर्णमाला",
    "course-1_desc": "अमेरिकन सांकेतिक भाषा में अपना नाम लिखना सीखें और मूल अक्षरों (A-Z) में महारत हासिल करें।",
    "course-2_title": "मूल सांकेतिक वाक्य और अभिवादन",
    "course-2_desc": "सांकेतिक भाषा में आवश्यक अभिवादन, सामान्य भाव और सरल संवादात्मक शुरुआत।",
    "course-3_title": "सांकेतिक भाषा: संख्याएं और रंग",
    "course-3_desc": "सांकेतिक भाषा में गिनती, भाव और रंगों की पहचान के मूल सिद्धांतों को सीखें।",
    "course-4_title": "उन्नत संवादात्मक सांकेतिक भाषा",
    "course-4_desc": "अपनी सांकेतिक गति, वाक्य संरचना में सुधार करें और उन्नत संकेतों को समझें।",

    // Nova Avatar & Bot Floating Window
    nova_assistant: "नोवा साइन एआई",
    nova_bot_title: "नोवा • सांकेतिक अवतार बॉट",
    nova_tagline: "सभी टैब पर उपलब्ध",
    nova_greeting: "👋 नमस्ते! मैं नोवा हूँ, आपका 3D सांकेतिक भाषा एआई। नेविगेट करने के लिए कैमरे के सामने हाथ के संकेत करें (जैसे ☝️ पाठ्यक्रम, ✌️ होम)!",
    nova_tab_camera: "साइन कैमरा",
    nova_tab_chat: "कैप्शन और इतिहास",
    nova_tab_guide: "साइन गाइड",
    enable_camera: "साइन कैमरा सक्षम करें",
    camera_watching: "संकेत देखे जा रहे हैं...",
    quick_commands: "त्वरित आदेश",
    hold_to_trigger: "सक्रिय करने के लिए 0.6s रोकें",
    voice_on: "आवाज चालू (बोलकर बताएगा)",
    voice_silent: "शांत मोड (बधिर उपयोगकर्ताओं के लिए दृश्य)",
    voice_enabled_notice: "🔊 आवाज ऑडियो सक्षम किया गया।",
    voice_silent_notice: "🔇 शांत मोड सक्रिय।",
    loading_ai: "एआई लोड हो रहा है...",
    turn_on_camera_hint: "सांकेतिक भाषा के इशारों से ऐप को नियंत्रित करने के लिए कैमरा चालू करें।",

    // Sign Commands
    cmd_courses_action: "पाठ्यक्रम खोलें",
    cmd_courses_desc: "सीधे पाठ्यक्रम सूची और शिक्षण मॉड्यूल पर ले जाता है",
    cmd_home_action: "मुख्य डैशबोर्ड",
    cmd_home_desc: "मुख्य बधिर/मूक डैशबोर्ड दृश्य पर वापस लौटता है",
    cmd_practice_action: "साइन अभ्यास और क्विज़",
    cmd_practice_desc: "वास्तविक समय सांकेतिक भाषा अभ्यास क्षेत्र खोलता है",
    cmd_select_action: "चुनें / पुष्टि करें",
    cmd_select_desc: "हाइलाइट किए गए विकल्प का चयन करता है या पाठ शुरू करता है",
    cmd_help_action: "मदद और निर्देश",
    cmd_help_desc: "सहायता प्रदान करता है और उपलब्ध सांकेतिक आदेश दिखाता है",
    cmd_back_action: "पीछे / बंद करें",
    cmd_back_desc: "पॉपअप बंद करता है या पिछले पृष्ठ पर जाता है",

    // Voice Engine Status
    voice_listening: "सुन रहा हूँ...",
    voice_speaking: "बोल रहा हूँ...",
    voice_paused: "रोक दिया गया",
    voice_ready: "तैयार",

    // Multi-language Picker
    choose_language: "भाषा चुनें",
    language_switched: "भाषा हिन्दी पर सेट की गई।",

    // Signup Field Names & Labels
    field_first_name: "पहला नाम",
    field_last_name: "अंतिम नाम",
    field_full_name: "पूरा नाम",
    field_email: "ईमेल पता",
    field_phone: "फ़ोन नंबर",
    field_mobile_number: "मोबाइल नंबर",
    field_accessibility: "एक्सेसिबिलिटी प्राथमिकताएं",
    field_age: "आयु",
    field_gender: "लिंग",
    field_password: "पासवर्ड",
    field_confirm_password: "पासवर्ड की पुष्टि करें",

    // Dropdown choices
    select_gender: "लिंग चुनें",
    gender_male: "पुरुष",
    gender_female: "महिला",
    gender_other: "अन्य",
    gender_prefer_not: "बताना नहीं चाहते",
    pref_blind: "दृष्टिबाधित / कम दृष्टि",
    pref_deaf: "बधिर / सुनने में असमर्थ",
    pref_motor: "गतिशीलता अक्षम",
    pref_none: "कोई नहीं",

    // Signup Titles & Descriptions
    title_signup_blind: "ब्लाइंड खाता बनाएं",
    sub_signup_blind: "कृपया वॉयस प्रॉम्प्ट विज़ार्ड का उपयोग करके पंजीकरण करें, या नीचे विवरण भरें।",
    title_signup_motor: "मोटर खाता बनाएं",
    sub_signup_motor: "पंजीकरण के लिए हैंड्स-फ्री हेड ट्रैकिंग या वॉयस प्रॉम्प्ट विज़ार्ड का उपयोग करें।",
    title_signup_deaf: "डेफ खाता बनाएं",
    sub_signup_deaf: "अपनी प्रोफ़ाइल पंजीकृत करें। अपने कैप्शन और दृश्य सेटिंग्स को कॉन्फ़िगर करें।",

    // Action Buttons & Labels
    btn_create_account: "खाता बनाएं",
    btn_creating_account: "खाता बनाया जा रहा है...",
    btn_already_registered: "पहले से पंजीकृत हैं?",
    btn_back_to_login: "लॉगिन पर वापस जाएं",
    btn_activate_voice: "वॉयस असिस्टेंट सक्रिय करें",
    btn_stop_voice: "आवाज रोकें",
    voice_mode_active: "वॉयस मोड: सक्रिय",
    voice_mode_activate: "वॉयस मोड सक्रिय करें",
    badge_voice_assistant: "वॉयस असिस्टेंट",
    label_heard: "सुना गया",

    // Spoken Prompts & Feedbacks
    prompt_welcome_signup: "AccessAI में आपका स्वागत है। मैं आपका खाता बनाने में आपकी मदद करूँगा। चलिए शुरू करते हैं। चरण 1 / 8. पहला नाम। आपका पहला नाम क्या है?",
    prompt_step_first_name: "चरण 1 / 8. पहला नाम। आपका पहला नाम क्या है?",
    prompt_confirm_first_name: "मैंने सुना {name}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_step_last_name: "चरण 2 / 8. अंतिम नाम। आपका अंतिम नाम क्या है?",
    prompt_confirm_last_name: "मैंने सुना {name}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_step_email: "चरण 3 / 8. ईमेल पता। आइए आपका ईमेल पता दर्ज करें। हम इसे चरण दर चरण करेंगे। कृपया केवल अपने ईमेल का यूज़रनेम बोलें।",
    prompt_step_phone: "चरण 4 / 8. मोबाइल नंबर। आपका मोबाइल नंबर क्या है?",
    prompt_confirm_phone: "मैंने सुना {digits}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_step_age: "चरण 5 / 8. आयु। आपकी आयु क्या है?",
    prompt_confirm_age: "मैंने सुना {age}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_step_gender: "चरण 6 / 8. लिंग। आपका लिंग क्या है?",
    prompt_confirm_gender: "मैंने सुना {gender}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_step_password: "चरण 7 / 8. पासवर्ड। कृपया अपना पासवर्ड बनाएं।",
    prompt_confirm_password: "कृपया अपने पासवर्ड की पुष्टि करें।",
    prompt_summary_create: "चरण 8 / 8. खाता बनाएं। आपकी खाता जानकारी पूरी हो गई है। क्या आप अपना खाता बनाना चाहते हैं?",
    prompt_saved: "सहेज लिया गया।",
    prompt_try_again_first_name: "आइए दोबारा प्रयास करें। आपका पहला नाम क्या है?",
    prompt_try_again_last_name: "आइए दोबारा प्रयास करें। आपका अंतिम नाम क्या है?",
    prompt_try_again: "आइए दोबारा प्रयास करें।",
    prompt_passwords_match: "पासवर्ड मेल खाते हैं। सहेज लिया गया।",
    prompt_passwords_mismatch: "पासवर्ड मेल नहीं खाते। आइए दोबारा प्रयास करें। कृपया पासवर्ड बनाएं।",
    prompt_password_min_length: "पासवर्ड कम से कम छह अक्षरों का होना चाहिए। कृपया इसे दोबारा बोलें।",
    prompt_phone_length_error: "मोबाइल नंबर ठीक दस अंकों का होना चाहिए। कृपया एक-एक अंक करके बोलें।",
    prompt_age_parse_error: "मैं वह आयु समझ नहीं पाया। कृपया अपनी आयु संख्या में बताएं। जैसे इक्कीस।",
    prompt_confirm_say_yes_no: "कृपया पुष्टि करने के लिए हाँ या नहीं कहें।",
    prompt_registration_success: "बधाई हो। आपका AccessAI खाता सफलतापूर्वक बन गया है। आपको अपने डैशबोर्ड पर ले जाया जा रहा है।",
    prompt_registration_failed: "पंजीकरण विफल रहा। आइए पुनः आरंभ करें।",
    prompt_registering_account: "अब आपका खाता पंजीकृत किया जा रहा है।",
    prompt_start_over: "आइए फिर से शुरू करें।",
    prompt_voice_cancelled: "वॉयस असिस्टेंट रद्द कर दिया गया।",
    prompt_name_cleared: "नाम साफ़ कर दिया गया। कृपया अपना नाम फिर से बताएं।",
    prompt_email_provider: "अब कृपया अपना ईमेल प्रदाता बताएं। जैसे जीमेल, आउटलुक या याहू।",
    prompt_confirm_email: "मैंने सुना {email}। क्या यह सही है? कृपया हाँ या नहीं कहें।",
    prompt_email_confirmed: "ईमेल की पुष्टि हुई। जारी रख रहे हैं।",
    prompt_email_retry: "आइए आपका ईमेल पता दर्ज करें। कृपया केवल अपने ईमेल का यूज़रनेम बोलें।",
    prompt_didnt_hear: "मैंने नहीं सुना। कृपया इसे दोबारा कहें।",
    field_skipped: "{field} छोड़ दिया गया।",
    field_required_cannot_skip: "यह फ़ील्ड आवश्यक है और इसे छोड़ा नहीं जा सकता।",
    err_passwords_match: "पासवर्ड मेल नहीं खाते।",
    err_phone_length: "मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।"
  },

  kn: {
    // Brand & Header
    app_title: "AccessAI",
    modes_badge: "3 ಹೊಂದಾಣಿಕೆಯ ಮೋಡ್‌ಗಳು",
    select_mode: "ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    sign_out: "ಸೈನ್ ಔಟ್",
    signed_in_as: "ಲಾಗಿನ್ ಆಗಿರುವವರು:",
    current_mode: "ಪ್ರಸ್ತುತ ಮೋಡ್:",
    continue_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",

    // Step Flow on Landing Page
    step_1_title: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    step_1_sub: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ, ಲೈವ್ ಉಪಶೀರ್ಷಿಕೆಗಳು ಮತ್ತು ನಿಯಂತ್ರಣಗಳನ್ನು ಹೊಂದಿಸಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    step_1_badge: "ಹಂತ 1 / 2",
    step_2_badge: "ಹಂತ 2 / 2",
    step_indicator: "ಭಾಷಾ ಆಯ್ಕೆ",
    continue_to_modes: "ಮೋಡ್ ಆಯ್ಕೆಗೆ ಮುಂದುವರಿಯಿರಿ",
    change_language: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    select_language_prompt: "ಮುಂದುವರಿಯಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",

    // Landing Hero (Step 2)
    welcome_title: "AccessAI ಗೆ ಸುಸ್ವಾಗತ",
    welcome_sub: "ನಿಮ್ಮ ಸಂವೇದನಾತ್ಮಕ ಮತ್ತು ಚಲನಶೀಲತೆಯ ಅಗತ್ಯಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವ AI-ಚಾಲಿತ ಬಹುಮಾದರಿ ಕಲಿಕಾ ವೇದಿಕೆ. ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಮೋಡ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    select_prompt: "ಮುಂದುವರಿಯಲು ಮೇಲೆ ಪ್ರವೇಶಿಸುವಿಕೆ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    sign_in: "ಸೈನ್ ಇನ್",
    create_account: "ಖಾತೆ ತೆರೆಯಿರಿ",
    demo_badge: "ಡೆಮೊ ಮೋಡ್ ಸಕ್ರಿಯ",
    selected: "ಆಯ್ಕೆಯಾಗಿದೆ",
    switch_to_mode: "ಈ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ",
    active: "ಸಕ್ರಿಯ",

    // Modes
    mode_blind_title: "ದೃಷ್ಟಿಹೀನ ಮತ್ತು ಕಡಿಮೆ ದೃಷ್ಟಿ",
    mode_blind_desc: "ನೈಸರ್ಗಿಕ ಧ್ವನಿ ಸಂಕೇತಗಳು, ಸ್ಕ್ರೀನ್ ರೀಡರ್ ನಿರೂಪಣೆ ಮತ್ತು ಸಂಭಾಷಣಾ ನಿಯಂತ್ರಣದೊಂದಿಗೆ ಪೂರ್ಣ ಧ್ವನಿ-ಚಾಲಿತ ಅನುಭವ.",
    mode_deaf_title: "ಕಿವುಡ ಮತ್ತು ಶ್ರವಣದೋಷವುಳ್ಳವರು",
    mode_deaf_desc: "ದೃಶ್ಯ ಸನ್ನೆ ಭಾಷೆ AI ಅವತಾರ್, ಸಂವಾದಾತ್ಮಕ ASL/ISL ಪಠ್ಯಕ್ರಮ, ನೈಜ-ಸಮಯದ ಸನ್ನೆ ಗುರುತಿಸುವಿಕೆ ಕ್ಯಾಮೆರಾ ಮತ್ತು ನಿಖರ ಉಪಶೀರ್ಷಿಕೆಗಳು.",
    mode_motor_title: "ಮೋಟಾರ್ ಮತ್ತು ಚಲನಶೀಲತೆ",
    mode_motor_desc: "ಹ್ಯಾಂಡ್ಸ್-ಫ್ರೀ ಹೆಡ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಕರ್ಸರ್, ಡ್ವೆಲ್ ಕ್ಲಿಕ್ಕಿಂಗ್, ಹೊಂದಾಣಿಕೆ ಸೂಕ್ಷ್ಮತೆ ಮತ್ತು ಮುಖದ ಸನ್ನೆ ಪ್ರಚೋದಕಗಳು.",

    // Deaf Dashboard Navigation & Header
    deaf_dash_title: "ಕಿವುಡ ಮತ್ತು ಶ್ರವಣ ಕಲಿಕಾ ಕೇಂದ್ರ",
    deaf_dash_subtitle: "ದೃಶ್ಯ ಸನ್ನೆ ಭಾಷೆ ಮತ್ತು ಉಪಶೀರ್ಷಿಕೆ ಕಲಿಕಾ ವೇದಿಕೆ",
    tab_home: "ಅವಲೋಕನ",
    tab_career_paths: "ವೃತ್ತಿ ಮಾರ್ಗಗಳು",
    tab_courses: "ಕೋರ್ಸ್ ಲೈಬ್ರರಿ",
    tab_learning: "ನನ್ನ ಕಲಿಕೆ",
    tab_practice: "ಸನ್ನೆ ಅಭ್ಯಾಸ",
    tab_ai_tutor: "AI ಬೋಧಕ",
    tab_activity: "ಚಟುವಟಿಕೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    tab_profile: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳು",
    tab_settings: "ಪ್ರವೇಶಿಸುವಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    deaf_role: "ಕಿವುಡ ಪ್ರವೇಶಿಸುವಿಕೆ ವಿಶ್ಲೇಷಕ",
    open_sign_arena: "ಸನ್ನೆ ಅಖಾಡ ತೆರೆಯಿರಿ",
    stop_camera: "ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ",
    weekly_study_minutes: "ವಾರದ ಅಧ್ಯಯನ ನಿಮಿಷಗಳು",
    fluency_progress: "ನಿರರ್ಗಳತೆಯ ಪ್ರಗತಿ",
    earned_badges: "ಗಳಿಸಿದ ಬ್ಯಾಡ್ಜ್‌ಗಳು",
    my_certificates: "ನನ್ನ ಪ್ರಮಾಣಪತ್ರಗಳು",
    ai_study_companion: "AI ಅಧ್ಯಯನ ಒಡನಾಡಿ",
    ai_companion_desc: "ಕಸ್ಟಮ್ ದೃಶ್ಯ ರಸಪ್ರಶ್ನೆ ರಚಿಸಿ ಅಥವಾ ವ್ಯಾಕರಣ ಪ್ರಶ್ನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಕೇಳಿ.",
    chat_with_tutor: "AI ಬೋಧಕರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
    recommended_for_you: "ನಿಮಗಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    system_notifications: "ವ್ಯವಸ್ಥೆಯ ಅಧಿಸೂಚನೆಗಳು",

    // Deaf Dashboard Welcome Banner & Stats
    greeting_user: "ನಮಸ್ಕಾರ, {name}!",
    deaf_welcome_msg: "AccessAI ಇ-ಕಲಿಕೆಗೆ ಸುಸ್ವಾಗತ! ನಿಮ್ಮ ಸನ್ನೆ ಶಬ್ದಕೋಶ ಮತ್ತು ವಾಕ್ಯರಚನೆಯನ್ನು ವಿಸ್ತರಿಸಿ. ಎಲ್ಲವೂ ನಿಮಗಾಗಿ ದೃಶ್ಯ ರೂಪದಲ್ಲಿ ಹೊಂದಿಸಲಾಗಿದೆ, ಯಾವುದೇ ಆಡಿಯೋ ಅಗತ್ಯವಿಲ್ಲ.",
    day_streak: "ದಿನಗಳ ಸರಣಿ",
    spent_today: "ಇಂದು ಕಳೆದ ಸಮಯ",
    daily_goals: "ದೈನಂದಿನ ಗುರಿಗಳು",
    today_goal_label: "ಇಂದಿನ ಗುರಿ: 30 ನಿಮಿಷಗಳು",
    done_pct: "83% ಮುಗಿದಿದೆ",
    progress_overview: "ಪ್ರಗತಿ ಅವಲೋಕನ",
    completed_courses_label: "2 ಪೂರ್ಣಗೊಂಡ ಕೋರ್ಸ್‌ಗಳು",
    average_progress: "50% ಸರಾಸರಿ",

    // Nova Avatar Banner in Dashboard
    nova_banner_title: "ನೋವಾ AI • 3D ಸನ್ನೆ ಭಾಷೆ ಅವತಾರ್",
    nova_persistent_badge: "ಶಾಶ್ವತ ಬಾಟ್",
    nova_banner_desc: "ನೋವಾ ಈಗ ಎಲ್ಲಾ ಟ್ಯಾಬ್‌ಗಳಲ್ಲೂ ಕೆಳಗಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿದೆ. ಸನ್ನೆ ಆಜ್ಞೆಗಳ ಮೂಲಕ (☝️ ಕೋರ್ಸ್‌ಗಳು, ✌️ ಮುಖಪುಟ, 🤟 ಅಭ್ಯಾಸ) ಸಲೀಸಾಗಿ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲು ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಮ್ಮ ಕ್ಯಾಮೆರಾವನ್ನು ಆನ್ ಮಾಡಿ.",

    // Continue Learning & Course Library
    continue_learning: "ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಿ",
    focused_to_select: "ಫೋಕಸ್ (ಆಯ್ಕೆ ಮಾಡಲು 👍)",
    beginner_badge: "ಆರಂಭಿಕ",
    intermediate_badge: "ಮಧ್ಯಮ",
    advanced_badge: "ಸುಧಾರಿತ",
    course_progress: "ಕೋರ್ಸ್ ಪ್ರಗತಿ",
    filter_all: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
    filter_language: "ಸನ್ನೆ ಭಾಷೆ",
    filter_vocabulary: "ಶಬ್ದಕೋಶ",
    filter_syntax: "ವ್ಯಾಕರಣ ಮತ್ತು ವಾಕ್ಯರಚನೆ",
    search_courses: "ಸನ್ನೆ ಭಾಷೆಯ ಕೋರ್ಸ್‌ಗಳನ್ನು ಹುಡುಕಿ...",
    start_lesson: "ಪಾಠ ಪ್ರಾರಂಭಿಸಿ",
    resume_course: "ಕೋರ್ಸ್ ಮುಂದುವರಿಸಿ",
    practice_arena: "ಸನ್ನೆ ಅಭ್ಯಾಸ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    in_progress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",

    // Translated Courses Content
    "course-1_title": "ಅಮೇರಿಕನ್ ಸನ್ನೆ ಭಾಷಾ ವರ್ಣಮಾಲೆ",
    "course-1_desc": "ನಿಮ್ಮ ಹೆಸರನ್ನು ಸ್ಪೆಲ್ ಮಾಡಲು ಕಲಿಯಿರಿ ಮತ್ತು ಮೂಲ ಅಕ್ಷರಗಳನ್ನು (A-Z) ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ.",
    "course-2_title": "ಮೂಲ ಸನ್ನೆ ವಾಕ್ಯಗಳು ಮತ್ತು ಶುಭಾಶಯಗಳು",
    "course-2_desc": "ಸನ್ನೆ ಭಾಷೆಯಲ್ಲಿ ಅಗತ್ಯ ಶುಭಾಶಯಗಳು, ಸಾಮಾನ್ಯ ಅಭಿವ್ಯಕ್ತಿಗಳು ಮತ್ತು ಸಂಭಾಷಣೆಗಳು.",
    "course-3_title": "ಸನ್ನೆ ಭಾಷೆ: ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಬಣ್ಣಗಳು",
    "course-3_desc": "ಎಣಿಕೆ, ಅಭಿವ್ಯಕ್ತಿಗಳು ಮತ್ತು ಬಣ್ಣಗಳನ್ನು ಗುರುತಿಸುವ ಮೂಲಭೂತ ಅಂಶಗಳನ್ನು ಕಲಿಯಿರಿ.",
    "course-4_title": "ಸುಧಾರಿತ ಸಂಭಾಷಣಾ ಸನ್ನೆ ಭಾಷೆ",
    "course-4_desc": "ನಿಮ್ಮ ಸನ್ನೆ ವೇಗ, ವಾಕ್ಯರಚನೆಯನ್ನು ಸುಧಾರಿಸಿ ಮತ್ತು ಸುಧಾರಿತ ಸನ್ನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",

    // Nova Avatar & Bot Floating Window
    nova_assistant: "ನೋವಾ ಸನ್ನೆ AI",
    nova_bot_title: "ನೋವಾ • ಸನ್ನೆ ಅವತಾರ್ ಬಾಟ್",
    nova_tagline: "ಎಲ್ಲಾ ಟ್ಯಾಬ್‌ಗಳಲ್ಲೂ ಲಭ್ಯವಿದೆ",
    nova_greeting: "👋 ನಮಸ್ಕಾರ! ನಾನು ನೋವಾ, ನಿಮ್ಮ 3D ಸನ್ನೆ ಭಾಷೆ AI. ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲು ಕ್ಯಾಮೆರಾದ ಮುಂದೆ ಸನ್ನೆಗಳನ್ನು ತೋರಿಸಿ (ಉದಾ: ☝️ ಕೋರ್ಸ್‌ಗಳು, ✌️ ಮುಖಪುಟ)!",
    nova_tab_camera: "ಸನ್ನೆ ಕ್ಯಾಮೆರಾ",
    nova_tab_chat: "ಉಪಶೀರ್ಷಿಕೆ ಮತ್ತು ಇತಿಹಾಸ",
    nova_tab_guide: "ಸನ್ನೆ ಮಾರ್ಗದರ್ಶಿ",
    enable_camera: "ಸನ್ನೆ ಕ್ಯಾಮೆರಾ ಆನ್ ಮಾಡಿ",
    camera_watching: "ಸನ್ನೆಗಳನ್ನು ಗಮನಿಸಲಾಗುತ್ತಿದೆ...",
    quick_commands: "ತ್ವರಿತ ಆಜ್ಞೆಗಳು",
    hold_to_trigger: "ಪ್ರಚೋದಿಸಲು 0.6ಸೆ ಹಿಡಿದುಕೊಳ್ಳಿ",
    voice_on: "ಧ್ವನಿ ಆನ್ (ಜೋರಾಗಿ ಮಾತನಾಡುತ್ತದೆ)",
    voice_silent: "ಮೌನ ಮೋಡ್ (ಕಿವುಡ ಬಳಕೆದಾರರಿಗೆ ದೃಶ್ಯ ಮಾತ್ರ)",
    voice_enabled_notice: "🔊 ಧ್ವನಿ ಆಡಿಯೋ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.",
    voice_silent_notice: "🔇 ಮೌನ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ.",
    loading_ai: "AI ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    turn_on_camera_hint: "ಸನ್ನೆ ಭಾಷೆಯ ಮೂಲಕ ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ನಿಯಂತ್ರಿಸಲು ಕ್ಯಾಮೆರಾವನ್ನು ಆನ್ ಮಾಡಿ.",

    // Sign Commands
    cmd_courses_action: "ಕೋರ್ಸ್‌ಗಳಿಗೆ ಹೋಗಿ",
    cmd_courses_desc: "ಕೋರ್ಸ್ ಪಟ್ಟಿ ಮತ್ತು ಕಲಿಕಾ ಮಾಡ್ಯೂಲ್‌ಗಳಿಗೆ ನೇರವಾಗಿ ನಿರ್ದೇಶಿಸುತ್ತದೆ",
    cmd_home_action: "ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    cmd_home_desc: "ಮುಖ್ಯ ಕಿವುಡ/ಮೂಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನಕ್ಕೆ ಹಿಂತಿರುಗಿಸುತ್ತದೆ",
    cmd_practice_action: "ಸನ್ನೆ ಅಭ್ಯಾಸ ಮತ್ತು ರಸಪ್ರಶ್ನೆ",
    cmd_practice_desc: "ನೈಜ-ಸಮಯದ ಸನ್ನೆ ಭಾಷೆ ಕಲಿಯುವ ರಂಗವನ್ನು ತೆರೆಯುತ್ತದೆ",
    cmd_select_action: "ಆಯ್ಕೆ / ದೃಢೀಕರಿಸಿ",
    cmd_select_desc: "ಹೈಲೈಟ್ ಮಾಡಿದ ಆಯ್ಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡುತ್ತದೆ ಅಥವಾ ಪಾಠವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ",
    cmd_help_action: "ಸಹಾಯ ಮತ್ತು ಆಜ್ಞೆಗಳು",
    cmd_help_desc: "ಸಹಾಯ ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ಲಭ್ಯವಿರುವ ಸನ್ನೆ ಆಜ್ಞೆಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ",
    cmd_back_action: "ಹಿಂದಕ್ಕೆ / ಮುಚ್ಚಿ",
    cmd_back_desc: "ವಿಂಡೋವನ್ನು ಮುಚ್ಚುತ್ತದೆ ಅಥವಾ ಹಿಂದಿನ ಪುಟಕ್ಕೆ ಹೋಗುತ್ತದೆ",

    // Voice Engine Status
    voice_listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...",
    voice_speaking: "ಮಾತನಾಡುತ್ತಿದೆ...",
    voice_paused: "ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ",
    voice_ready: "ಸಿದ್ಧವಾಗಿದೆ",

    // Multi-language Picker
    choose_language: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    language_switched: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.",

    // Signup Field Names & Labels
    field_first_name: "ಮೊದಲ ಹೆಸರು",
    field_last_name: "ಕೊನೆಯ ಹೆಸರು",
    field_full_name: "ಪೂರ್ಣ ಹೆಸರು",
    field_email: "ಇಮೇಲ್ ವಿಳಾಸ",
    field_phone: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    field_mobile_number: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    field_accessibility: "ಪ್ರವೇಶಿಸುವಿಕೆ ಆದ್ಯತೆಗಳು",
    field_age: "ವಯಸ್ಸು",
    field_gender: "ಲಿಂಗ",
    field_password: "ಪಾಸ್‌ವರ್ಡ್",
    field_confirm_password: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",

    // Dropdown choices
    select_gender: "ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    gender_male: "ಪುರುಷ",
    gender_female: "ಮಹಿಳೆ",
    gender_other: "ಇತರೆ",
    gender_prefer_not: "ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ",
    pref_blind: "ದೃಷ್ಟಿಹೀನ / ಕಡಿಮೆ ದೃಷ್ಟಿ",
    pref_deaf: "ಕಿವುಡ / ಶ್ರವಣದೋಷ",
    pref_motor: "ಮೋಟಾರ್ ದುರ್ಬಲ",
    pref_none: "ಯಾವುದೂ ಇಲ್ಲ",

    // Signup Titles & Descriptions
    title_signup_blind: "ಅಂಧ ಖಾತೆ ತೆರೆಯಿರಿ",
    sub_signup_blind: "ದಯವಿಟ್ಟು ಧ್ವನಿ ಪ್ರಾಂಪ್ಟ್ ವಿಝಾರ್ಡ್ ಬಳಸಿ ನೋಂದಾಯಿಸಿ, ಅಥವಾ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    title_signup_motor: "ಮೋಟಾರ್ ಖಾತೆ ತೆರೆಯಿರಿ",
    sub_signup_motor: "ನೋಂದಾಯಿಸಲು ಹೆಡ್-ಟ್ರ್ಯಾಕಿಂಗ್ ಕರ್ಸರ್ ಬಳಸಿ, ಅಥವಾ ಧ್ವನಿ ಬಳಸಿ.",
    title_signup_deaf: "ಕಿವುಡ ಖಾತೆ ತೆರೆಯಿರಿ",
    sub_signup_deaf: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅನ್ನು ನೋಂದಾಯಿಸಿ. ನಿಮ್ಮ ಉಪಶೀರ್ಷಿಕೆ ಮತ್ತು ದೃಶ್ಯ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಹೊಂದಿಸಿ.",

    // Action Buttons & Labels
    btn_create_account: "ಖಾತೆ ರಚಿಸಿ",
    btn_creating_account: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    btn_already_registered: "ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆಯೇ?",
    btn_back_to_login: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    btn_activate_voice: "ಧ್ವನಿ ಸಹಾಯಕರನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
    btn_stop_voice: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    voice_mode_active: "ಧ್ವನಿ ಮೋಡ್: ಸಕ್ರಿಯ",
    voice_mode_activate: "ಧ್ವನಿ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಿ",
    badge_voice_assistant: "ಧ್ವನಿ ಸಹಾಯಕ",
    label_heard: "ಕೇಳಿದ್ದು",

    // Spoken Prompts & Feedbacks
    prompt_welcome_signup: "AccessAI ಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಪ್ರಾರಂಭಿಸೋಣ. ಹಂತ 1 / 8. ಮೊದಲ ಹೆಸರು. ನಿಮ್ಮ ಮೊದಲ ಹೆಸರು ಏನು?",
    prompt_step_first_name: "ಹಂತ 1 / 8. ಮೊದಲ ಹೆಸರು. ನಿಮ್ಮ ಮೊದಲ ಹೆಸರು ಏನು?",
    prompt_confirm_first_name: "ನಾನು {name} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_step_last_name: "ಹಂತ 2 / 8. ಕೊನೆಯ ಹೆಸರು. ನಿಮ್ಮ ಕೊನೆಯ ಹೆಸರು ಏನು?",
    prompt_confirm_last_name: "ನಾನು {name} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_step_email: "ಹಂತ 3 / 8. ಇಮೇಲ್ ವಿಳಾಸ. ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸೋಣ. ನಾವು ಇದನ್ನು ಹಂತ ಹಂತವಾಗಿ ಮಾಡುತ್ತೇವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ಮಾತ್ರ ಹೇಳಿ.",
    prompt_step_phone: "ಹಂತ 4 / 8. ಮೊಬೈಲ್ ಸಂಖ್ಯೆ. ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಏನು?",
    prompt_confirm_phone: "ನಾನು {digits} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_step_age: "ಹಂತ 5 / 8. ವಯಸ್ಸು. ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
    prompt_confirm_age: "ನಾನು {age} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_step_gender: "ಹಂತ 6 / 8. ಲಿಂಗ. ನಿಮ್ಮ ಲಿಂಗ ಯಾವುದು?",
    prompt_confirm_gender: "ನಾನು {gender} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_step_password: "ಹಂತ 7 / 8. ಪಾಸ್‌ವರ್ಡ್. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ.",
    prompt_confirm_password: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ದೃಢೀಕರಿಸಿ.",
    prompt_summary_create: "ಹಂತ 8 / 8. ಖಾತೆ ರಚಿಸಿ. ನಿಮ್ಮ ಖಾತೆಯ ಮಾಹಿತಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಲು ನೀವು ಬಯಸುವಿರಾ?",
    prompt_saved: "ಉಳಿಸಲಾಗಿದೆ.",
    prompt_try_again_first_name: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸೋಣ. ನಿಮ್ಮ ಮೊದಲ ಹೆಸರು ಏನು?",
    prompt_try_again_last_name: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸೋಣ. ನಿಮ್ಮ ಕೊನೆಯ ಹೆಸರು ಏನು?",
    prompt_try_again: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸೋಣ.",
    prompt_passwords_match: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ. ಉಳಿಸಲಾಗಿದೆ.",
    prompt_passwords_mismatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸೋಣ. ದಯವಿಟ್ಟು ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ.",
    prompt_password_min_length: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ಆರು ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ.",
    prompt_phone_length_error: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಿಖರವಾಗಿ ಹತ್ತು ಅಂಕೆಗಳಿರಬೇಕು. ದಯವಿಟ್ಟು ಅಂಕಿ ಅಂಕಿಯಾಗಿ ಹೇಳಿ.",
    prompt_age_parse_error: "ಆ ವಯಸ್ಸು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ಸಂಖ್ಯೆಯಲ್ಲಿ ಹೇಳಿ. ಉದಾಹರಣೆಗೆ ಇಪ್ಪತ್ತೊಂದು.",
    prompt_confirm_say_yes_no: "ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಲು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_registration_success: "ಅಭಿನಂದನೆಗಳು. ನಿಮ್ಮ AccessAI ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ.",
    prompt_registration_failed: "ಧ್ವನಿ ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಾರಂಭಿಸೋಣ.",
    prompt_registering_account: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಈಗ ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ.",
    prompt_start_over: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸೋಣ.",
    prompt_voice_cancelled: "ಧ್ವನಿ ಸಹಾಯಕರನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
    prompt_name_cleared: "ಹೆಸರನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಮತ್ತೆ ಹೇಳಿ.",
    prompt_email_provider: "ಈಗ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪೂರೈಕೆದಾರರನ್ನು ತಿಳಿಸಿ. ಉದಾಹರಣೆಗೆ ಜಿಮೇಲ್, ಔಟ್‌ಲುಕ್ ಅಥವಾ ಯಾಹೂ.",
    prompt_confirm_email: "ನಾನು {email} ಎಂದು ಕೇಳಿದೆ. ಇದು ಸರಿಯೇ? ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
    prompt_email_confirmed: "ಇಮೇಲ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಮುಂದುವರಿಯುತ್ತಿದ್ದೇವೆ.",
    prompt_email_retry: "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸೋಣ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ಮಾತ್ರ ಹೇಳಿ.",
    prompt_didnt_hear: "ನನಗೆ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ.",
    field_skipped: "{field} ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ.",
    field_required_cannot_skip: "ಈ ಕ್ಷೇತ್ರ ಕಡ್ಡಾಯವಾಗಿದೆ ಮತ್ತು ಬಿಟ್ಟುಬಿಡಲಾಗುವುದಿಲ್ಲ.",
    err_passwords_match: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
    err_phone_length: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಿಖರವಾಗಿ 10 ಅಂಕೆಗಳಾಗಿರಬೇಕು."
  }
};

const LanguageContext = createContext(null);

export const LANGUAGE_STORAGE_KEY = "accessai_preferred_language";
export const LANGUAGE_CONFIGURED_KEY = "accessai_language_confirmed";

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLangState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === "en" || saved === "hi" || saved === "kn")) {
          return saved;
        }
      } catch (err) { }
    }
    return "en";
  });

  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return window.localStorage.getItem(LANGUAGE_CONFIGURED_KEY) === "true";
      } catch (err) { }
    }
    return false;
  });

  const setLanguage = useCallback((langCode) => {
    if (langCode === "en" || langCode === "hi" || langCode === "kn") {
      setCurrentLangState(langCode);
      setHasChosenLanguage(true);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
          window.localStorage.setItem(LANGUAGE_CONFIGURED_KEY, "true");
        } catch (err) { }
      }
    }
  }, []);

  const resetLanguageChoice = useCallback(() => {
    setHasChosenLanguage(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(LANGUAGE_CONFIGURED_KEY);
      } catch (err) { }
    }
  }, []);

  const currentLangMeta = useMemo(() => {
    return LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  }, [currentLang]);

  const t = useCallback((key, fallbackOrVars = "", maybeVars = {}) => {
    let fallback = typeof fallbackOrVars === "string" ? fallbackOrVars : "";
    let vars = typeof fallbackOrVars === "object" ? fallbackOrVars : maybeVars;
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    let str = langDict[key] !== undefined ? langDict[key] : (TRANSLATIONS.en[key] !== undefined ? TRANSLATIONS.en[key] : (fallback || key));
    if (vars && typeof vars === "object") {
      Object.keys(vars).forEach(varKey => {
        str = str.replace(new RegExp(`\\{${varKey}\\}`, "g"), vars[varKey]);
      });
    }
    return str;
  }, [currentLang]);

  const getCourseText = useCallback((course) => {
    if (!course) return { title: "", description: "" };
    const titleKey = `${course.id}_title`;
    const descKey = `${course.id}_desc`;
    return {
      title: t(titleKey, course.title),
      description: t(descKey, course.description)
    };
  }, [t]);

  const value = useMemo(() => ({
    language: currentLang,
    languageMeta: currentLangMeta,
    setLanguage,
    hasChosenLanguage,
    resetLanguageChoice,
    t,
    getCourseText,
    languages: LANGUAGES,
    speechLang: currentLangMeta.speechLang
  }), [currentLang, currentLangMeta, setLanguage, hasChosenLanguage, resetLanguageChoice, t, getCourseText]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en",
      languageMeta: LANGUAGES[0],
      setLanguage: () => { },
      hasChosenLanguage: false,
      resetLanguageChoice: () => { },
      t: (k, fb = "") => fb || k,
      getCourseText: (c) => ({ title: c?.title || "", description: c?.description || "" }),
      languages: LANGUAGES,
      speechLang: "en-US"
    };
  }
  return ctx;
}

export default LanguageContext;
