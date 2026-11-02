/**
 * AccessAI Blind Mode Curricula Dataset
 * ══════════════════════════════════════════════════════════════════════════════
 * Practical, accessible, employment-oriented courses specifically designed for
 * blind and visually impaired learners utilizing screen readers and assistive tech.
 *
 * SCOPE: Strictly applies to Blind Mode (/blind/*). Other modes retain their courses.
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const BLIND_CATEGORIES = [
  { id: "all", label: "📚 All Courses", description: "View all practical accessible courses" },
  { id: "digital_literacy", label: "⌨️ Digital Independence", description: "Screen readers & assistive keyboard navigation" },
  { id: "office_skills", label: "💼 Digital Office", description: "Email, documents, spreadsheets & remote workflows" },
  { id: "ai_writing", label: "✍️ Content & AI", description: "AI-assisted copywriting, research & editing" },
  { id: "accessibility_qa", label: "🔍 Accessibility QA", description: "Manual keyboard & screen reader accessibility audits" },
  { id: "audio_production", label: "🎙️ Audio & Podcasts", description: "Accessible recording, timeline editing & mastering" },
];

export const BLIND_MODE_COURSES = [
  {
    id: "blind-course-1",
    title: "Digital Independence With Screen Readers",
    description: "Learn how to navigate computers, websites, documents, and online services independently using assistive technologies.",
    category: "digital_literacy",
    instructor: "David Woodbridge, Senior Assistive Technology Consultant",
    duration: "2h 30m",
    level: "Beginner",
    rating: 4.95,
    badge: "Screen Reader Foundation",
    learningOutcome: "Develop foundational digital skills and greater independence when using computers and screen readers.",
    careerPathways: "Digital Independence, Assistive Technology Proficiency, Computer Operations.",
    video: "dQw4w9WgXcQ",
    topics: [
      "Introduction to screen readers",
      "Keyboard navigation and shortcuts",
      "Accessible website navigation",
      "Reading and editing documents",
      "Using forms and online services",
      "Identifying inaccessible interface elements"
    ],
    practicalExercisesSummary: "Navigate a sample webpage using only keyboard, complete an accessible online form, open and edit sample documents.",
    lessons: [
      {
        id: "les-sr-1",
        title: "Introduction to Screen Readers & Keyboard Shortcuts",
        duration: "25 mins",
        content: "Screen readers such as NVDA, JAWS, and VoiceOver translate visual computer interfaces into natural synthetic speech and refreshable braille displays. Instead of relying on a computer mouse, users operate their system entirely using structured keyboard shortcuts. The fundamental navigation model separates System Focus—which tracks the active input or control—from the Virtual Cursor or Review Cursor, which allows you to inspect static text, read paragraphs, and explore web content without inadvertently triggering actions. Critical shortcuts include Tab to move forward through focusable links and buttons, Shift+Tab to move backward, Enter or Spacebar to activate controls, and Arrow keys with screen-reader modifier keys to read character-by-character, word-by-word, and line-by-line.",
        practicalExercise: {
          title: "Keyboard Focus & Control Activation",
          instruction: "Press the Tab key to move focus to the interactive test control below. Press Spacebar or Enter to activate it without touching a mouse.",
          type: "keyboard_navigation",
          targetLabel: "Verify Keyboard Focus & Activation",
          successMessage: "Great job! Keyboard focus arrived and activated the target control without mouse interaction."
        }
      },
      {
        id: "les-sr-2",
        title: "Accessible Website Navigation & ARIA Landmarks",
        duration: "35 mins",
        content: "Modern accessible websites organize information into semantic ARIA landmarks: <header> for site branding, <nav> for navigation links, <main> for central content, and <footer> for administrative info. Screen reader single-key navigation transforms browsing efficiency: pressing 'H' jumps forward to the next heading, numbers '1' through '6' jump to specific heading levels, and 'D' jumps between ARIA landmarks. Navigating by headings allows blind users to skim complex pages in seconds, just as sighted readers glance at visual headers, rather than being forced to listen to every word sequentially from the top of the page.",
        practicalExercise: {
          title: "Landmark & Semantic Heading Navigation",
          instruction: "Identify the Main Content landmark and jump to the primary Heading 2 section below using standard keyboard navigation.",
          type: "landmark_navigation",
          targetLabel: "Navigate to Main Content Landmark",
          successMessage: "Success! You jumped directly to the main content landmark and verified the semantic heading hierarchy."
        }
      },
      {
        id: "les-sr-3",
        title: "Reading Documents, Accessible Forms & Error Recovery",
        duration: "40 mins",
        content: "Using online banking, government portals, and shopping services requires completing web forms. Accessible forms programmatically pair visible text labels with input controls using the <label for='...'> attribute or aria-labelledby. When focus enters a field, the screen reader announces the field name, input type (text, checkbox, dropdown), and whether it is required or invalid. When validation errors occur, accessible interfaces leverage aria-live regions or aria-describedby to speak the error message immediately, allowing you to fix inputs without losing your place in the form.",
        practicalExercise: {
          title: "Accessible Form Completion Simulation",
          instruction: "Complete the accessible form fields below (Full Name and Preferred Screen Reader), then submit to test live region validation.",
          type: "accessible_form",
          targetLabel: "Submit Form and Verify Live Region",
          successMessage: "Accessible form completed! Labels, inputs, and confirmation live region announced properly."
        }
      }
    ],
    quiz: {
      question: "Which keyboard key is universally used in web browsers and desktop applications to move focus forward to the next interactive control?",
      options: [
        "Tab key",
        "Escape key",
        "Backspace key",
        "Delete key"
      ],
      answer: "Tab key",
      explanation: "The Tab key advances keyboard focus across interactive controls (links, buttons, form fields), while Shift+Tab moves backward."
    },
    practicalTask: {
      title: "Practical Task: Assistive Skimming Strategy",
      instruction: "Choose the fastest and most accessible method for a screen reader user to locate a specific recipe section on a long cooking webpage.",
      challenge: "You arrive on a 3,000-word webpage. What is the most efficient navigation technique to jump directly to the 'Ingredients' list?",
      options: [
        "Press 'H' or '2' to jump through section headings until you hear 'Ingredients (Heading Level 2)'",
        "Listen to the entire article from top to bottom at 1.0x speed without skipping",
        "Click the mouse cursor randomly in the center of the screen",
        "Close the web browser and reopen it"
      ],
      answer: "Press 'H' or '2' to jump through section headings until you hear 'Ingredients (Heading Level 2)'",
      feedback: "Correct! Heading navigation (the 'H' key) is the standard, most efficient technique blind users employ to skim documents and jump directly to desired content."
    }
  },
  {
    id: "blind-course-2",
    title: "Digital Office and Computer Skills",
    description: "Develop practical computer skills for office work, administrative tasks, and remote work using screen readers and keyboard navigation.",
    category: "office_skills",
    instructor: "Karen McCall, Accessible Office Technology Specialist",
    duration: "2h 45m",
    level: "Beginner",
    rating: 4.88,
    badge: "Office Administration",
    learningOutcome: "Develop practical computer skills for administrative tasks, office workflows, and remote employment using keyboard navigation.",
    careerPathways: "Administrative assistance, virtual assistance, and digital office support.",
    video: "u4ZoJKF_VuA",
    topics: [
      "Email communication and attachments",
      "Document creation and editing",
      "Spreadsheet basics",
      "Organising files and folders",
      "Online collaboration tools",
      "Professional digital communication"
    ],
    practicalExercisesSummary: "Draft and send a sample email, create an accessible document with heading styles, enter and organise sample data in a spreadsheet.",
    lessons: [
      {
        id: "les-off-1",
        title: "Professional Email Communication & Accessible Attachments",
        duration: "30 mins",
        content: "Email is the cornerstone of professional and remote office collaboration. Accessible email writing involves clear, descriptive subject lines (e.g., 'Project Status: Weekly QA Report Ready for Review'), concise greetings, and structuring action items with bulleted lists. When attaching files, always use accessible formats such as tagged PDFs or structured Word documents (.docx) with meaningful filenames (e.g., 'October-Expense-Summary.docx' instead of 'Scan002.pdf'). Standard screen-reader shortcuts include Ctrl+Enter to send an email, Ctrl+R to reply, and Alt+I to attach files in desktop email clients.",
        practicalExercise: {
          title: "Draft Accessible Business Email",
          instruction: "Draft a concise project status email with a descriptive subject line and structured action bullet points.",
          type: "email_composition",
          targetLabel: "Verify Email Draft Structure",
          successMessage: "Email drafted! Subject line is descriptive and content follows accessible, professional formatting."
        }
      },
      {
        id: "les-off-2",
        title: "Accessible Document Creation & Semantic Heading Styles",
        duration: "35 mins",
        content: "Creating documents that colleagues, clients, and assistive technology users can easily navigate requires using built-in heading styles (Heading 1, Heading 2, Heading 3) rather than manual font enlargements. In Microsoft Word or Google Docs, pressing Ctrl+Alt+1 or Ctrl+Alt+2 applies semantic styles that generate an automated document outline. Screen reader users can browse this outline to jump directly between sections. Always add concise alternative text descriptions to images and avoid using multiple empty Enter keys to create visual spacing—use paragraph spacing margins instead.",
        practicalExercise: {
          title: "Semantic Document Hierarchy Structuring",
          instruction: "Assign semantic heading levels to organize a three-part administrative project brief into a readable document outline.",
          type: "document_styling",
          targetLabel: "Apply Semantic Heading Hierarchy",
          successMessage: "Document styled! Semantic heading styles provide an accessible outline for all collaborators."
        }
      },
      {
        id: "les-off-3",
        title: "Spreadsheet Basics, Cell Navigation & Data Organization",
        duration: "40 mins",
        content: "Spreadsheets in Microsoft Excel and Google Sheets organize data into structured grids of rows and columns. When navigating with a screen reader, arrow keys move focus cell-by-cell. An accessible spreadsheet must have the top row designated as a Header Row, allowing the screen reader to automatically announce column headers (such as 'October Revenue, Row 4') as you arrow down through rows. Learn essential shortcuts: Ctrl+Arrow to jump to data edges, F2 to edit cell content, and basic mathematical formulas such as =SUM(B2:B10) to total columns.",
        practicalExercise: {
          title: "Spreadsheet Entry & Header Navigation",
          instruction: "Enter administrative values into a sample 3-column table and compute column totals using a structured formula.",
          type: "spreadsheet_entry",
          targetLabel: "Calculate Spreadsheet Summary Formula",
          successMessage: "Spreadsheet entry verified! Column headers and calculation formulas operate correctly."
        }
      }
    ],
    quiz: {
      question: "Why is it important to use built-in Heading styles (Heading 1, Heading 2) rather than just increasing font size and bolding text when creating documents with a screen reader?",
      options: [
        "Built-in headings allow screen reader users to generate a navigable table of contents and jump directly between sections",
        "Built-in headings change the background color of the page automatically",
        "It is only required if the document is being printed on physical paper",
        "Word processors cannot save documents without headings"
      ],
      answer: "Built-in headings allow screen reader users to generate a navigable table of contents and jump directly between sections",
      explanation: "Built-in headings embed structural tags into the document outline that screen readers utilize for instant section-by-section navigation."
    },
    practicalTask: {
      title: "Practical Task: Administrative File Delivery",
      instruction: "Select the most accessible, professional file delivery method for submitting a weekly project report to a remote supervisor.",
      challenge: "Your supervisor requests the weekly administrative summary. Which format and filename is most accessible and professional?",
      options: [
        "A structured document named 'Weekly-Administrative-Summary-Oct26.docx' with semantic headings and tagged tables",
        "An untagged image scan of paper notes named 'IMG_0921.jpg' with no text content",
        "An empty email body with an encrypted zip file and no instructions",
        "A photo of your laptop monitor taken from an angle"
      ],
      answer: "A structured document named 'Weekly-Administrative-Summary-Oct26.docx' with semantic headings and tagged tables",
      feedback: "Excellent! Structured documents with clear filenames ensure that every team member, regardless of assistive technology, can access your work seamlessly."
    }
  },
  {
    id: "blind-course-3",
    title: "Content Writing With AI",
    description: "Learn how to use AI tools to assist with writing, editing, research, and content creation.",
    category: "ai_writing",
    instructor: "Nisha Patel, Digital Content Strategist & Assistive AI Coach",
    duration: "2h 20m",
    level: "Beginner",
    rating: 4.92,
    badge: "AI Content Creation",
    learningOutcome: "Harness AI assistants to brainstorm, draft, edit, and fact-check commercial articles and product descriptions.",
    careerPathways: "Freelance writing, content assistance, and product-description writing.",
    video: "dItUGF8GdTw",
    topics: [
      "Writing clear and useful content",
      "Writing articles and blog posts",
      "Creating product descriptions",
      "Writing social media captions",
      "Using AI for brainstorming and drafting",
      "Fact-checking and proofreading AI-generated content",
      "Using AI tools with screen readers"
    ],
    practicalExercisesSummary: "Write a product description, create a short article, draft social media captions, edit an AI-generated paragraph for clarity and accuracy.",
    lessons: [
      {
        id: "les-aiw-1",
        title: "Prompt Engineering for Brainstorming & Outlining",
        duration: "30 mins",
        content: "Modern AI language models serve as high-speed creative assistants for blind writers. Effective prompting follows the C-T-A-C framework: Context (role and project background), Task (specific deliverable needed), Audience (demographic, reading level, technical familiarity), and Constraints (word count, tone, bulleted structure). For example: 'Act as a product copywriter. Outline a 350-word educational blog post on ergonomic desk accessories for remote workers. Use an encouraging, informative tone.' Using AI with screen readers is smoothest when copying AI responses into your preferred accessible text editor to review and refine line-by-line with familiar cursor commands.",
        practicalExercise: {
          title: "Contextual AI Prompt Formulation",
          instruction: "Craft a structured AI prompt specifying role, audience, tone, and word count constraints to generate a 3-point article outline.",
          type: "prompt_crafting",
          targetLabel: "Verify Structured AI Prompt",
          successMessage: "Prompt formulated! Clear constraints produce high-quality, focused initial drafts."
        }
      },
      {
        id: "les-aiw-2",
        title: "Commercial Copywriting: Product Descriptions & Social Captions",
        duration: "35 mins",
        content: "Commercial writing includes product descriptions for e-commerce websites and engaging social media captions. An effective product description focuses on customer benefits rather than raw technical specifications: instead of merely listing dimensions, explain how the product saves time, enhances comfort, or solves daily frustrations. Social media captions require an engaging opening hook, a concise value proposition, and an explicit Call to Action (CTA) such as 'Visit our website to learn more' or 'Share your experience in the comments'.",
        practicalExercise: {
          title: "Benefit-Driven Product Copywriting",
          instruction: "Draft a 3-sentence e-commerce product description highlighting practical user benefits and an engaging Call to Action.",
          type: "product_description",
          targetLabel: "Check Product Description Quality",
          successMessage: "Product description drafted! Focus on user benefits and clear CTA drives customer interest."
        }
      },
      {
        id: "les-aiw-3",
        title: "Fact-Checking, Proofreading & Eliminating AI Hallucinations",
        duration: "35 mins",
        content: "AI tools often produce plausible-sounding inaccuracies known as hallucinations. Professional writers never deliver AI-generated copy to clients without rigorous human review. Follow a disciplined 3-step proofreading workflow: 1. Verify every statistic, historical claim, and proper name against reputable primary sources; 2. Eliminate repetitive AI clichés and robotic transitions to inject authentic human warmth; 3. Use screen-reader word-by-word reading to catch subtle punctuation errors, sentence fragments, and awkward phrasing.",
        practicalExercise: {
          title: "AI Draft Fact-Check & Editorial Polish",
          instruction: "Audit a sample AI paragraph to identify an unverified factual claim and rewrite it with accurate, verified information.",
          type: "fact_check_audit",
          targetLabel: "Run Editorial Fact-Check Audit",
          successMessage: "Audit complete! Fact-checking and vocal proofreading safeguard editorial credibility."
        }
      }
    ],
    quiz: {
      question: "What is the most critical responsibility of a content writer when utilizing AI writing tools for commercial client deliverables?",
      options: [
        "Fact-checking claims against trusted sources and proofreading for tone, clarity, and human authenticity",
        "Publishing the raw AI output immediately without reading it",
        "Disabling all spell checkers and proofreading tools",
        "Copying text into three different translation apps randomly"
      ],
      answer: "Fact-checking claims against trusted sources and proofreading for tone, clarity, and human authenticity",
      explanation: "AI serves as a powerful drafting assistant, but human judgment, rigorous fact-checking, and editorial polish are required for high-quality, trustworthy writing."
    },
    practicalTask: {
      title: "Practical Task: Freelance Writing Workflow",
      instruction: "Choose the professional procedure for delivering a set of 5 social media captions created with AI assistance to a business client.",
      challenge: "A small business client hires you to write social captions. What is the standard professional workflow to ensure client satisfaction?",
      options: [
        "Prompt the AI with client brand guidelines, verify all facts, refine the hooks and CTAs, and review with a screen reader before delivery",
        "Copy the first AI answer into an email without reading and send an invoice immediately",
        "Tell the client to use AI themselves and refuse the project",
        "Submit completely unrelated text copied from an encyclopedia"
      ],
      answer: "Prompt the AI with client brand guidelines, verify all facts, refine the hooks and CTAs, and review with a screen reader before delivery",
      feedback: "Spot on! Combining AI drafting efficiency with meticulous human proofreading and client brand alignment creates high-value, repeatable freelance opportunities."
    }
  },
  {
    id: "blind-course-4",
    title: "Digital Accessibility Testing",
    description: "Learn how to identify digital accessibility problems and communicate them clearly to developers and organisations.",
    category: "accessibility_qa",
    instructor: "Rachel Vasquez, Certified Accessibility Quality Assurance Lead",
    duration: "3h 00m",
    level: "Intermediate",
    rating: 4.94,
    badge: "Accessibility Testing QA",
    learningOutcome: "Identify digital accessibility barriers using keyboard and screen reader testing, and write professional, actionable defect reports.",
    careerPathways: "Accessibility testing, website quality assurance, and accessibility support.",
    video: "rfscVS0vtbw",
    topics: [
      "Introduction to digital accessibility",
      "Keyboard-only navigation",
      "Screen-reader testing",
      "Accessible forms and buttons",
      "Identifying missing labels and confusing navigation",
      "Writing useful bug reports",
      "Basic accessibility testing workflows"
    ],
    practicalExercisesSummary: "Test a sample webpage using keyboard navigation, identify accessibility issues on a sample website, write a report describing the issue, impact, and reproduction steps.",
    lessons: [
      {
        id: "les-a11y-1",
        title: "Introduction to Digital Accessibility & WCAG Principles",
        duration: "35 mins",
        content: "Digital accessibility ensures that people with disabilities can perceive, understand, navigate, and interact with websites and software tools. The international standard is the Web Content Accessibility Guidelines (WCAG), structured around four POUR principles: Perceivable (content can be perceived through speech, braille, or visuals); Operable (all interactive controls can be operated via keyboard without mouse reliance); Understandable (operations and language are clear and predictable); and Robust (content works reliably across current and future assistive technologies). Blind testers bring vital authentic lived experience to testing teams.",
        practicalExercise: {
          title: "POUR Principles Evaluation",
          instruction: "Review a component scenario and determine which WCAG principle requires all interactive controls to be operable without a mouse.",
          type: "wcag_evaluation",
          targetLabel: "Verify Operable WCAG Principle",
          successMessage: "Correct! The 'Operable' principle mandates full keyboard operability for all interactive components."
        }
      },
      {
        id: "les-a11y-2",
        title: "Keyboard-Only & Screen-Reader Audit Techniques",
        duration: "40 mins",
        content: "Practical accessibility testing begins by setting aside the mouse. Test whether every interactive link, button, and input can be reached and activated using Tab, Shift+Tab, Enter, and Spacebar. Check that visible focus indicators never vanish and that focus does not become trapped inside popups or menus. Next, enable your screen reader to verify that icon buttons have accessible names (e.g., aria-label='Close Dialog' instead of silent buttons), form controls announce their purpose, and image elements have meaningful alternative text.",
        practicalExercise: {
          title: "Audit Unlabeled Icon Button Component",
          instruction: "Inspect a simulated icon button that is silent to screen readers and apply the required accessible name remediation.",
          type: "element_audit",
          targetLabel: "Apply Accessible Name to Icon Button",
          successMessage: "Audit successful! Adding descriptive accessible names (aria-label) resolves screen-reader silence."
        }
      },
      {
        id: "les-a11y-3",
        title: "Writing Actionable Accessibility Bug Reports",
        duration: "45 mins",
        content: "Software engineers need precise technical information to fix accessibility barriers. A high-impact accessibility defect report includes six essential fields: 1. Descriptive Title (e.g., 'Checkout Button: Missing accessible name for screen readers on payment form'); 2. URL or build version; 3. Assistive technology tested (e.g., NVDA 2026.1 on Chrome 130); 4. Clear step-by-step reproduction instructions; 5. Expected vs. Actual behavior; 6. WCAG Criterion violated (e.g., WCAG 4.1.2 Name, Role, Value) and user impact explanation.",
        practicalExercise: {
          title: "Draft Structured Accessibility Bug Report",
          instruction: "Complete the reproduction steps, expected behavior, and user impact fields for a sample inaccessible shopping cart button.",
          type: "bug_report_drafting",
          targetLabel: "Validate Defect Report Structure",
          successMessage: "Report structured! Detailed reproduction steps and WCAG criteria enable developers to patch defects quickly."
        }
      }
    ],
    quiz: {
      question: "When filing an accessibility bug report for an engineering team, which information is most vital to ensure developers can reproduce and fix the issue?",
      options: [
        "Clear step-by-step reproduction instructions, assistive technology tested, expected vs actual behavior, and user impact",
        "Only a general one-line comment stating that the website feels broken",
        "A photo of the monitor with no text description",
        "The web developer's personal home address"
      ],
      answer: "Clear step-by-step reproduction instructions, assistive technology tested, expected vs actual behavior, and user impact",
      explanation: "Detailed reproduction steps, environment details, and expected accessible behavior empower engineering teams to reproduce and patch accessibility barriers quickly."
    },
    practicalTask: {
      title: "Practical Task: Keyboard Trap Detection",
      instruction: "Identify the critical accessibility barrier in a modal dialog where keyboard focus cannot leave the dialog box.",
      challenge: "During a website audit, pressing Tab cycles through fields inside a signup modal, but pressing Escape or tabbing past the last element does not close it or return focus to the page. Which barrier is present?",
      options: [
        "Keyboard Trap (violating WCAG 2.1.2 No Keyboard Trap)",
        "Missing background music",
        "Page font is too dark for desktop screens",
        "Internet connection bandwidth warning"
      ],
      answer: "Keyboard Trap (violating WCAG 2.1.2 No Keyboard Trap)",
      feedback: "Spot on! A keyboard trap completely blocks keyboard-only and screen reader users from navigating past a trapped component."
    }
  },
  {
    id: "blind-course-5",
    title: "Audio Editing and Podcast Production",
    description: "Learn the fundamentals of creating, editing, and preparing audio content using accessible tools and keyboard-based workflows where supported.",
    category: "audio_production",
    instructor: "Jason Dash, Blind Audio Engineer & OSARA Community Contributor",
    duration: "3h 15m",
    level: "Intermediate",
    rating: 4.88,
    badge: "Accessible Audio Production",
    learningOutcome: "Master accessible multi-track audio recording, keyboard-based timeline editing, and loudness mastering for podcast publishing.",
    careerPathways: "Basic audio production, podcast assistance, and audio-content editing.",
    video: "71360000000",
    topics: [
      "Audio recording fundamentals",
      "Importing and organising audio files",
      "Basic audio editing",
      "Removing unwanted pauses and mistakes",
      "Understanding volume and sound quality",
      "Exporting audio files",
      "Preparing audio content for podcasts and online publication"
    ],
    practicalExercisesSummary: "Record a short audio introduction, edit a sample audio recording to remove silences and filler words, export a completed audio file to -16 LUFS broadcast standard.",
    lessons: [
      {
        id: "les-aud-1",
        title: "Recording Fundamentals & Accessible DAW Configurations",
        duration: "40 mins",
        content: "High-quality audio production starts with proper microphone technique and accessible software configuration. In the blind audio engineering community, the premier accessible digital audio workstation is REAPER paired with the free OSARA (Open Source Accessibility for the REAPER Application) extension. OSARA provides speech and braille feedback for track levels, timeline positions, time signatures, and plugin parameters. Alternative accessible tools include Audacity configured with custom accessible keyboard shortcuts, and GoldWave. Key recording practices include keeping a 6-inch distance from a cardioid microphone, using a pop filter to eliminate plosives, and setting recording gain so vocal peaks hit around -12 dBFS to prevent harsh digital clipping.",
        practicalExercise: {
          title: "Microphone Gain & Recording Level Check",
          instruction: "Verify input gain staging to ensure vocal peaks remain safely at -12 dBFS without digital clipping.",
          type: "audio_recording_setup",
          targetLabel: "Verify Microphone Gain Staging (-12 dBFS)",
          successMessage: "Gain staging verified! Peaks at -12 dBFS ensure clean headroom without distortion."
        }
      },
      {
        id: "les-aud-2",
        title: "Keyboard-Based Trimming, Splitting & Ripple Editing",
        duration: "45 mins",
        content: "Accessible audio editing relies on auditory scrubbing rather than visual waveforms. By using Left and Right Arrow keys to scrub through an audio track by milliseconds or seconds, you can identify the exact start and end points of an unwanted cough, false start, or verbal filler ('um', 'uh'). Press 'S' to split the audio item at the cursor, scrub to the end of the mistake, press 'S' again, and press Delete. In Ripple Edit mode, the audio clips downstream automatically slide backward to fill the gap seamlessly, eliminating dead air without disturbing track synchronization.",
        practicalExercise: {
          title: "Keyboard In/Out Point Split & Ripple Delete",
          instruction: "Practice setting In-Point and Out-Point markers around a sample hesitation pause and execute a ripple delete.",
          type: "audio_trimming",
          targetLabel: "Execute Keyboard Ripple Delete",
          successMessage: "Ripple edit completed! Dead air eliminated while preserving downstream track sync."
        }
      },
      {
        id: "les-aud-3",
        title: "Loudness Standards, EQ Tuning & Accessible Export",
        duration: "40 mins",
        content: "Before distributing a podcast to Apple Podcasts, Spotify, or YouTube, audio must be mastered to international broadcast loudness targets. The worldwide podcast standard is -16 LUFS (Loudness Units Full Scale) for stereo files and -19 LUFS for mono voice tracks, with maximum true peaks capped at -1.0 dB to prevent inter-sample clipping during compression. Learn to apply accessible high-pass EQ filters to cut out low-frequency rumble below 80 Hz, run loudness normalization plugins, and export to 320 kbps MP3 or 24-bit WAV formats with embedded episode title and artist ID3 metadata.",
        practicalExercise: {
          title: "Mastering Loudness Normalization & Export",
          instruction: "Apply the -16 LUFS loudness normalization filter and export a sample podcast episode with embedded metadata tags.",
          type: "audio_export",
          targetLabel: "Normalize to -16 LUFS & Export Episode",
          successMessage: "Mastering complete! Podcast meets -16 LUFS broadcast standard with embedded metadata."
        }
      }
    ],
    quiz: {
      question: "Which digital audio workstation and extension combination is widely recognized in the blind community for providing comprehensive, accessible multi-track sound engineering via speech and braille?",
      options: [
        "REAPER digital audio workstation paired with the OSARA accessibility extension",
        "Mouse-only drag-and-drop audio applications that do not announce cursor position",
        "Video compression tools that disable keyboard input",
        "Analog cassette tape decks without computer connectivity"
      ],
      answer: "REAPER digital audio workstation paired with the OSARA accessibility extension",
      explanation: "REAPER + OSARA provides deep, accessible timeline telemetry, speech announcements, and braille display synchronization for professional audio production."
    },
    practicalTask: {
      title: "Practical Task: Podcast Broadcast Delivery",
      instruction: "Choose the proper mastering target and export workflow for delivering an audio interview to a podcast client.",
      challenge: "A client hires you to edit and master a weekly podcast interview. What is the standard broadcast loudness target and delivery specification?",
      options: [
        "-16 LUFS stereo (or -19 LUFS mono) with true peaks capped at -1.0 dB and clean vocal edits",
        "Maximum distorted volume with heavy clipping and no trimming",
        "A low-bitrate compressed voice memo recorded through a phone speaker",
        "A silent audio file with all microphone tracks muted"
      ],
      answer: "-16 LUFS stereo (or -19 LUFS mono) with true peaks capped at -1.0 dB and clean vocal edits",
      feedback: "Spot on! Mastering to -16 LUFS ensures the podcast plays at a consistent, professional volume across all major streaming services."
    }
  }
];

export const BLIND_CAREER_OPPORTUNITIES = [
  {
    id: "portfolio",
    icon: "folder_special",
    title: "Build Your Portfolio",
    description: "Save your completed practical exercises, formatted office documents, sample AI articles, audio edits, and accessibility bug reports into a dedicated portfolio folder. Sharing concrete work samples proves your hands-on competence to prospective remote clients and employers.",
    tip: "💡 Tip: Host your sample files on accessible cloud drives with public read-only links."
  },
  {
    id: "careers",
    icon: "explore",
    title: "Explore Career Paths",
    description: "Connect the skills you learn in Blind Mode directly to independent and remote job roles:",
    paths: [
      { role: "Digital Office Support", desc: "Virtual assistance, email triage, and document formatting." },
      { role: "AI Content Writing", desc: "Freelance drafting, product copy, and editing." },
      { role: "Accessibility Testing", desc: "Manual keyboard QA audits and bug report filing." },
      { role: "Podcast & Audio Editing", desc: "Dialogue cleanup and loudness mastering." },
    ],
    tip: "💡 Tip: Specialize in 1-2 pathways to build deep, repeatable client relationships."
  },
  {
    id: "prep",
    icon: "badge",
    title: "Prepare for Work",
    description: "Gain professional readiness: build an accessible plain-text or structured DOCX resume with semantic headings; set up your accessible remote workstation with headset and shortcuts; and practice clear, concise communication for remote team collaboration.",
    tip: "📋 Checklist: Ensure your resume passes screen reader navigation checks."
  },
  {
    id: "opportunities",
    icon: "travel_explore",
    title: "Find Opportunities",
    description: "Explore real pathways to find freelance and contract engagements: join accessibility tester communities (such as Fable, uTest, and Knowbility); bid on entry-level copy editing and audio cleanup projects on freelance networks; and connect with disability-inclusive remote employers.",
    tip: "ℹ️ Note: AccessAI provides skill development; actual client contracts and employment depend on individual applications and employer requirements."
  }
];

