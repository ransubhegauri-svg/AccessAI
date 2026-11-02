/**
 * AccessAI Deaf/Mute Mode Curricula Dataset
 * ══════════════════════════════════════════════════════════════════════════════
 * Practical, accessible, employment-oriented courses specifically designed for
 * deaf, hard-of-hearing, and non-speaking learners.
 *
 * All courses emphasize visual learning, step-by-step written tutorials,
 * synchronized transcripts, closed captions, and hands-on portfolio projects.
 * No microphone or spoken interaction is ever required.
 *
 * SCOPE: Strictly applies to Deaf/Mute Mode (/deaf/*). Other modes retain their courses.
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const DEAF_CATEGORIES = [
  { id: "all", label: "📚 All Courses", description: "View all practical accessible courses" },
  { id: "design", label: "🎨 Graphic Design", description: "Visual branding, posters, social media & Canva" },
  { id: "office_skills", label: "💼 Digital Office", description: "Documents, spreadsheets, email & remote workflows" },
  { id: "media", label: "🎬 Video & Subtitles", description: "Video editing, captioning, SRT files & accessibility" },
  { id: "writing", label: "✍️ AI Content Writing", description: "Clear writing, social captions, product copy & AI workflows" },
  { id: "marketing", label: "📈 Digital Marketing", description: "Content calendars, campaign planning & audience metrics" },
];

export const DEAF_MODE_COURSES = [
  {
    id: "deaf-course-1",
    title: "Graphic Design with Canva",
    description: "Learn to create professional visual content for businesses, educational institutions and social media using accessible visual design tools.",
    category: "design",
    instructor: "Elena Rostova, Senior Visual Designer",
    duration: "2h 45m",
    level: "Beginner",
    rating: 4.95,
    badge: "Visual Portfolio Track",
    learningOutcome: "Create marketing flyers, social graphics, and promotional posters with accessible contrast, typography hierarchy, and export standards.",
    careerPathways: "Freelance Graphic Designer, Social Media Design Assistant, Visual Content Specialist.",
    video: "un50bs46n1U",
    modules: [
      "Introduction to graphic design",
      "Understanding layouts, fonts and colours",
      "Creating posters and flyers",
      "Designing social media graphics",
      "Preparing a portfolio"
    ],
    lessons: [
      {
        id: "les-canva-1",
        title: "Introduction to Graphic Design & Canvas Setup",
        duration: "25 mins",
        video: "un50bs46n1U",
        content: "Graphic design is the art of communicating ideas visually through typography, imagery, and layout. In this lesson, you will learn to navigate the design interface, choose standard digital dimensions (1080x1080 for square posts, A4 for print flyers, 1920x1080 for presentation slides), and set up visual safety margins to ensure text is never clipped during viewing or printing.",
        visualSteps: [
          "Open your design workspace and select 'Custom Size' or choose a pre-set template such as Flyer (A4) or Instagram Post (1080x1080).",
          "Enable rulers and guides from the View settings to maintain symmetrical alignments across elements.",
          "Set a 0.5-inch inner safety margin around the border where no text or critical logos should be placed."
        ],
        transcript: "Welcome to Lesson 1: Introduction to Graphic Design and Canvas Setup. When starting any visual project, always define your output format before adding elements. Web images use RGB color profiles and 72-96 DPI, while printed posters require CMYK color profiles and 300 DPI for sharp resolution. Grids ensure visual balance across all screen sizes.",
        practicalExercise: {
          title: "Canvas & Grid Setup",
          instruction: "Set up a new digital canvas with 0.5-inch safety margins and create a 3-column layout grid for a visual flyer.",
          targetLabel: "Verify Canvas Setup",
          successMessage: "Canvas dimensions and safety margins successfully configured!"
        }
      },
      {
        id: "les-canva-2",
        title: "Understanding Layouts, Fonts & Accessible Colours",
        duration: "35 mins",
        video: "un50bs46n1U",
        content: "Effective layouts guide the viewer's eye through a clear visual hierarchy. The most important information (headline) must be the largest and boldest, followed by subheadings, and then body text. Color contrast is essential for accessibility: text must meet at least a 4.5:1 contrast ratio against the background so readers of all visual abilities can read it effortlessly.",
        visualSteps: [
          "Choose a primary font for headlines (e.g., bold sans-serif like Montserrat or League Spartan) and a neutral body font (e.g., Open Sans or Inter).",
          "Select a 3-color palette: 60% dominant neutral background, 30% structural secondary color, and 10% high-contrast accent color for buttons and dates.",
          "Check contrast with a visual contrast tool: dark text on light backgrounds or pure white text on dark navy/charcoal backgrounds."
        ],
        transcript: "In Lesson 2, we explore typography hierarchy and color contrast. Avoid using more than two font families in a single graphic. Use weight variations (Bold, Medium, Light) within the same font family to create clean hierarchy. Ensure high contrast so text stands out crisply.",
        practicalExercise: {
          title: "Typography Hierarchy & Contrast Test",
          instruction: "Pair a bold headline font with a readable body font and verify that text contrast meets the 4.5:1 accessibility threshold.",
          targetLabel: "Verify Hierarchy & Contrast",
          successMessage: "Font pairing verified with accessible 4.5:1 contrast ratio!"
        }
      },
      {
        id: "les-canva-3",
        title: "Creating Event Posters & Marketing Flyers",
        duration: "40 mins",
        video: "un50bs46n1U",
        content: "Event posters must answer five key questions in seconds: What is the event? When does it take place? Where is the venue? Who is hosting? How do attendees register? In this lesson, you will construct a clean, visually compelling poster using focal points, balanced negative space, and accessible QR code placement with a white quiet zone.",
        visualSteps: [
          "Position the event title in the top third of the poster using high-impact display typography.",
          "Place event date, time, and venue in an organized visual card in the middle section.",
          "Insert a high-contrast QR code in the lower section with a clear visual call to action: 'Scan to Register'.",
          "Export the finished design as a high-resolution PDF Print with crop marks."
        ],
        transcript: "In Lesson 3, we build a promotional event flyer from scratch. Keep your design uncluttered by preserving whitespace around text blocks. Group related details together so readers immediately absorb date and venue details.",
        practicalExercise: {
          title: "Design a College Event Poster",
          instruction: "Assemble an event poster containing an event title, date/time card, venue, and a clear call-to-action registration link.",
          targetLabel: "Verify Poster Composition",
          successMessage: "Promotional poster composition successfully completed and verified!"
        }
      },
      {
        id: "les-canva-4",
        title: "Designing Multi-Platform Social Media Graphics",
        duration: "35 mins",
        video: "un50bs46n1U",
        content: "Social media graphics must instantly capture attention in fast-scrolling feeds. In this lesson, you will learn to adapt a master design across three major aspect ratios: 1:1 square for feed posts, 9:16 vertical for stories and reels, and 16:9 horizontal for LinkedIn and web banners while preserving consistent brand assets.",
        visualSteps: [
          "Create a master 1080x1080 graphic with brand logo, hero image, and headline.",
          "Resize the layout to 1080x1920 for vertical stories, rearranging elements vertically to fill space without stretching graphics.",
          "Ensure text remains within the safe zone, avoiding the top 200px (user profile bar) and bottom 250px (reaction buttons)."
        ],
        transcript: "Lesson 4 teaches responsive visual adaptation. When repurposing graphics for vertical mobile formats, stack visual elements vertically and increase font sizes so copy remains legible on smaller mobile screens.",
        practicalExercise: {
          title: "Multi-Format Social Asset Package",
          instruction: "Adapt a single promotional design into a 1:1 feed square and a 9:16 vertical mobile story.",
          targetLabel: "Verify Social Package",
          successMessage: "Multi-platform social graphic package generated and validated!"
        }
      },
      {
        id: "les-canva-5",
        title: "Preparing a Professional Design Portfolio",
        duration: "30 mins",
        video: "un50bs46n1U",
        content: "A compelling design portfolio showcases not only the final artwork, but also the problem-solving process. In this lesson, you will curate 3 to 5 distinct design case studies, create realistic digital device mockups, and write concise visual project summaries to present to freelance clients or employers.",
        visualSteps: [
          "Select your 3 best design projects: 1 event poster, 1 social media bundle, and 1 brand identity kit.",
          "Place artwork into realistic digital mockups (e.g. poster framed on a gallery wall or social post displayed on a smartphone screen).",
          "Write a 3-sentence case study for each project: The Goal, The Design Strategy, and The Result."
        ],
        transcript: "In Lesson 5, you assemble your professional portfolio. Quality always beats quantity. Showing three polished, well-explained case studies proves to potential clients that you understand visual communication, layout discipline, and accessibility standards.",
        practicalExercise: {
          title: "Curate a 3-Project Portfolio Overview",
          instruction: "Select 3 design deliverables, write a concise case study for each, and organize them into a presentation-ready portfolio layout.",
          targetLabel: "Finalize Portfolio Showcase",
          successMessage: "Graphic design portfolio showcase completed and ready for client presentation!"
        }
      }
    ],
    practicalAssessment: {
      title: "College Event Promotional Poster",
      instruction: "Create a promotional poster for a college event (e.g. Tech Expo, Art Fair, or Music Showcase). The poster must include a prominent headline, date, time, venue, 4.5:1 contrast ratio, and a clear registration call-to-action.",
      challenge: "Select the most effective layout arrangement for an event poster that maximizes immediate visual comprehension for a fast-moving passerby:",
      options: [
        "Large bold headline at top, organized date/venue card in middle, scan QR code at bottom with 4.5:1 contrast",
        "Tiny text in all corners with low-contrast yellow text on white background and no margins",
        "A solid image with no text, leaving viewers to guess event date and location",
        "30 paragraphs of unformatted text filling every inch of the poster with 5 different fonts"
      ],
      answer: "Large bold headline at top, organized date/venue card in middle, scan QR code at bottom with 4.5:1 contrast",
      feedback: "Excellent visual design practice! Clear headline hierarchy, grouped logistical details, high contrast, and accessible call-to-action ensure maximum readability."
    },
    quiz: {
      question: "Which color contrast ratio is required for standard text to ensure high accessibility and visual readability?",
      options: [
        "At least 4.5:1 contrast ratio against the background",
        "Any light color on light background",
        "Exactly 1:1 contrast ratio",
        "Random gradients without contrast testing"
      ],
      answer: "At least 4.5:1 contrast ratio against the background",
      explanation: "WCAG accessibility guidelines require a minimum 4.5:1 contrast ratio for normal body text to guarantee high legibility for all visual readers."
    }
  },
  {
    id: "deaf-course-2",
    title: "Digital Office and Computer Skills",
    description: "Develop digital skills for administrative work, office support, and remote employment using accessible modern productivity suites.",
    category: "office_skills",
    instructor: "Marcus Vance, Office Systems Specialist",
    duration: "3h 00m",
    level: "Beginner",
    rating: 4.88,
    badge: "Workplace Readiness",
    learningOutcome: "Master professional email communication, structured document editing, spreadsheet data management, and cloud collaboration.",
    careerPathways: "Administrative Assistant, Virtual Assistant, Digital Office Support, Operations Clerk.",
    video: "q1A_B_C1234",
    modules: [
      "Computer and internet fundamentals",
      "Professional email communication",
      "Creating and editing documents",
      "Spreadsheet fundamentals",
      "Organising files and online collaboration"
    ],
    lessons: [
      {
        id: "les-office-1",
        title: "Computer Fundamentals, File Systems & Cloud Storage",
        duration: "30 mins",
        video: "q1A_B_C1234",
        content: "Efficient office administration starts with clean file architecture and cloud storage management. In this lesson, you will learn to construct structured folder directories, implement standard ISO date naming conventions (YYYY-MM-DD), and configure cloud access permissions (Viewer, Commenter, Editor) on platforms like Google Drive and OneDrive.",
        visualSteps: [
          "Create a root office directory with subfolders: 01_Invoices, 02_Reports, 03_Client_Docs, 04_Templates.",
          "Name files using standard convention: `2026-11-03_Client_QuarterlyReport_v01.docx`.",
          "When sharing a link, select 'Viewer' for read-only recipients and 'Editor' only for active collaborative teammates."
        ],
        transcript: "Welcome to Lesson 1: Computer Fundamentals and File Management. Disorganized files cost teams hours of lost productivity. By using standardized date prefixes and explicit version numbers, all documents automatically sort in chronological order.",
        practicalExercise: {
          title: "File Organization & Naming Standard",
          instruction: "Build a 4-tier folder hierarchy and rename 3 sample files following the YYYY-MM-DD naming standard.",
          targetLabel: "Verify File Structure",
          successMessage: "Office file hierarchy and naming conventions verified!"
        }
      },
      {
        id: "les-office-2",
        title: "Professional Email Communication & Digital Etiquette",
        duration: "35 mins",
        video: "q1A_B_C1234",
        content: "Professional email communication requires clarity, brevity, and structure. In this lesson, you will master the anatomy of a business email: writing descriptive 4-to-6 word subject lines, polite greetings, bulleted key updates, explicit call-to-actions with deadlines, and formal email signatures.",
        visualSteps: [
          "Write clear subject lines: `[Action Required] Project Proposal Review - Due Nov 10`.",
          "Open with a respectful greeting: `Dear Mr. Davis,` or `Hello Team,`.",
          "Use bullet points for lists and bold font for critical dates or deliverables.",
          "Close with a professional sign-off and complete signature containing your name, role, and contact email."
        ],
        transcript: "In Lesson 2, we cover professional email etiquette. In remote workplace environments, written messages are your primary handshake. Clear bullet points prevent misunderstandings and reduce back-and-forth emails.",
        practicalExercise: {
          title: "Draft an Executive Status Email",
          instruction: "Draft a formal status update email to a manager containing 3 project bullet points, an attached file note, and a Friday deadline.",
          targetLabel: "Verify Email Draft",
          successMessage: "Professional email draft verified with proper business etiquette!"
        }
      },
      {
        id: "les-office-3",
        title: "Creating, Formatting & Structuring Documents",
        duration: "40 mins",
        video: "q1A_B_C1234",
        content: "Well-structured documents are easier to read and navigate. In this lesson, you will learn to apply paragraph styles (Title, Heading 1, Heading 2), format tables with designated header rows, insert accessible alt text on charts, and generate automated tables of contents in word processing tools.",
        visualSteps: [
          "Apply built-in styles: Heading 1 for main sections, Heading 2 for subsections.",
          "Format data tables with bold header rows and alternating row shading for visual contrast.",
          "Generate an automated Table of Contents linked to your document heading hierarchy.",
          "Export your document as an accessible PDF for distribution."
        ],
        transcript: "Lesson 3 focuses on document formatting. Applying actual Heading styles rather than just bolding text enables automatic outline navigation and ensures full accessibility across document viewers.",
        practicalExercise: {
          title: "Structure a Formal Office Report",
          instruction: "Format a 2-page office report with a Title, two Heading 1 sections, a formatted data table, and an automated Table of Contents.",
          targetLabel: "Verify Document Formatting",
          successMessage: "Accessible document structure and heading hierarchy verified!"
        }
      },
      {
        id: "les-office-4",
        title: "Spreadsheet Fundamentals: Formulas, Sorting & Filtering",
        duration: "45 mins",
        video: "q1A_B_C1234",
        content: "Spreadsheets are the backbone of office data tracking and budgeting. In this lesson, you will master cell addressing, basic arithmetic formulas (`=SUM`, `=AVERAGE`, `=COUNT`), sorting data alphabetically and numerically, and applying filters to isolate specific categories.",
        visualSteps: [
          "Enter headers in Row 1: Item ID, Description, Category, Quantity, Unit Price, Total Cost.",
          "Compute total cost using the formula: `=D2*E2` and fill the formula down column F.",
          "Calculate summary totals at the bottom using `=SUM(F2:F20)` and `=AVERAGE(E2:E20)`.",
          "Enable Auto-Filter on Row 1 to filter rows by Category."
        ],
        transcript: "Lesson 4 explores spreadsheet calculations. Formulas eliminate manual calculation errors. Always verify that cell ranges in formulas accurately cover all active data rows.",
        practicalExercise: {
          title: "Build an Office Expense Tracker",
          instruction: "Build an expense tracking table with 5 items, calculate subtotals using formulas, and apply an active category filter.",
          targetLabel: "Verify Spreadsheet Formulas",
          successMessage: "Spreadsheet formulas and table filtering successfully verified!"
        }
      },
      {
        id: "les-office-5",
        title: "Online Collaboration & Remote Team Workflows",
        duration: "30 mins",
        video: "q1A_B_C1234",
        content: "Modern digital office workers collaborate asynchronously across time zones. In this lesson, you will learn to manage real-time document comments, tag teammates (`@colleague`), resolve revision feedback, and manage calendar invitations for remote team syncs.",
        visualSteps: [
          "Highlight text and add a targeted comment with an action assignment (`@teammate please review line 12`).",
          "Track revision history to view who made edits and restore prior versions when necessary.",
          "Schedule a shared team calendar event with meeting agenda bullets and document links attached."
        ],
        transcript: "In Lesson 5, we look at remote team collaboration. Clear comments and version history make remote work smooth and transparent without requiring real-time voice calls.",
        practicalExercise: {
          title: "Simulate Collaborative Review & Version Handoff",
          instruction: "Add an actionable review comment tagging a colleague and inspect the version history log.",
          targetLabel: "Complete Collaboration Workflow",
          successMessage: "Collaboration workflow and asynchronous handoff completed!"
        }
      }
    ],
    practicalAssessment: {
      title: "Executive Document & Data Spreadsheet",
      instruction: "Create a formal 1-page office report with structured headings and an accompanying 5-item expense spreadsheet calculated with SUM and AVERAGE formulas.",
      challenge: "Which formula correctly calculates the sum of total expenses listed in cells F2 through F25 in a spreadsheet?",
      options: [
        "=SUM(F2:F25)",
        "=TOTAL(F2..F25)",
        "=ADD(F2+F25)",
        "=COUNT(F2-F25)"
      ],
      answer: "=SUM(F2:F25)",
      feedback: "Correct! The =SUM(F2:F25) formula reliably totals all numerical values across the specified cell range."
    },
    quiz: {
      question: "Which file naming convention best maintains clear version tracking and avoids accidental file overwrites in remote office teams?",
      options: [
        "2026-11-03_Project_Report_v02.docx",
        "Project_Report_Final_Final2_latest.docx",
        "document1.docx",
        "new_file_final.pdf"
      ],
      answer: "2026-11-03_Project_Report_v02.docx",
      explanation: "ISO date format (YYYY-MM-DD) combined with a descriptive title and explicit version numbers ensures automatic chronological sorting and zero ambiguity."
    }
  },
  {
    id: "deaf-course-3",
    title: "Video Editing and Captioning",
    description: "Learn basic timeline video editing and how to create accurate, synchronized closed captions, open subtitles, and accessible media exports.",
    category: "media",
    instructor: "David Vance, Accessible Media Director",
    duration: "3h 15m",
    level: "Intermediate",
    rating: 4.94,
    badge: "Accessible Media Track",
    learningOutcome: "Edit multi-clip video sequences, generate SRT subtitles, synchronize speech timestamps, and produce accessible video exports.",
    careerPathways: "Captioning Assistant, Subtitle Editor, Video Editing Assistant, Accessible Media Producer.",
    video: "rF8pL8G6s1U",
    modules: [
      "Introduction to video editing",
      "Organising video and audio files",
      "Cutting and arranging video clips",
      "Adding and editing subtitles",
      "Correcting transcription errors",
      "Exporting a finished video"
    ],
    lessons: [
      {
        id: "les-video-1",
        title: "Introduction to Video Editing & Project Setup",
        duration: "30 mins",
        video: "rF8pL8G6s1U",
        content: "Video editing is the process of arranging video shots to convey a coherent narrative. In this lesson, you will explore the non-linear editing workspace: media bins, sequence timelines, source preview monitors, and canvas aspect ratios (16:9 for YouTube/presentations, 9:16 for vertical reels).",
        visualSteps: [
          "Create a new video project and set timeline resolution to 1920x1080 at 30 frames per second (fps).",
          "Organize raw footage in the project bin: create folders for 01_Interview_A-Roll, 02_Visual_B-Roll, and 03_Captions.",
          "Drag A-Roll interview clips to Video Track 1 (V1) on your timeline."
        ],
        transcript: "Welcome to Lesson 1: Introduction to Video Editing. A clean timeline starts in the project bin. Labeling clips and organizing footage by scene saves hours of searching during the editing phase.",
        practicalExercise: {
          title: "Timeline & Project Bin Setup",
          instruction: "Set up a 1080p timeline and organize imported media into A-Roll and B-Roll bins.",
          targetLabel: "Verify Timeline Setup",
          successMessage: "Editing sequence and project bins successfully organized!"
        }
      },
      {
        id: "les-video-2",
        title: "Cutting, Trimming & Arranging Video Clips",
        duration: "35 mins",
        video: "rF8pL8G6s1U",
        content: "Trimming removes unwanted pauses and keeps video content concise and engaging. In this lesson, you will learn to set In/Out points in the source monitor, use the Razor/Split tool on the timeline, execute ripple deletes to close empty gaps, and layer visual B-roll on Track 2 (V2) over the main speaker.",
        visualSteps: [
          "Use hotkey 'I' for In-point and 'O' for Out-point to select only the best portion of a clip before inserting it.",
          "Use the split/cut tool to trim out filler pauses or false starts in speech.",
          "Layer supplementary B-roll footage on Track 2 to illustrate concepts while preserving audio continuity."
        ],
        transcript: "In Lesson 2, we cut and trim video footage. Pacing is crucial: cut to visual B-roll whenever a speaker mentions a specific tool, graphic, or product to keep the viewer visually engaged.",
        practicalExercise: {
          title: "Sequence Trimming & B-Roll Layering",
          instruction: "Trim 2 interview clips, eliminate the dead space between them, and place 1 overlay B-roll clip on Track 2.",
          targetLabel: "Verify Clip Trimming",
          successMessage: "Clip trimming and B-roll layering verified!"
        }
      },
      {
        id: "les-video-3",
        title: "Adding, Formatting & Timing Subtitles (SRT & VTT)",
        duration: "40 mins",
        video: "rF8pL8G6s1U",
        content: "Accurate captions make video content 100% accessible to deaf and hard-of-hearing audiences. In this lesson, you will learn standard captioning rules: 37 characters maximum per line, 2 lines maximum per card, synchronized display durations (minimum 1.5 seconds, maximum 6 seconds), and proper subtitle placement avoiding lower-third graphics.",
        visualSteps: [
          "Create a subtitle track above all video layers.",
          "Format text: sans-serif font (Arial or Roboto), 22-26pt size, pure white text with a subtle black border or semi-transparent background box.",
          "Break sentences logically at natural punctuation pauses rather than mid-phrase."
        ],
        transcript: "Lesson 3 covers subtitle formatting and timing standards. Subtitles should never be a visual wall of text. Keeping captions to at most two lines ensures viewers have time to both read the text and watch the visual action.",
        practicalExercise: {
          title: "Create 2-Line Formatted Subtitles",
          instruction: "Create 3 subtitle cards adhering to the 37-character per line standard and 2-line maximum rule.",
          targetLabel: "Verify Subtitle Timing",
          successMessage: "Subtitle cards formatted and timed to accessibility standards!"
        }
      },
      {
        id: "les-video-4",
        title: "Correcting Transcription Errors & Multi-Speaker Sync",
        duration: "45 mins",
        video: "rF8pL8G6s1U",
        content: "Automated speech-to-text algorithms frequently misinterpret specialized terms, proper names, and homophones. In this lesson, you will learn to proofread automated transcripts, correct technical jargon, add speaker identifiers `[Dr. Smith]:`, and describe essential non-speech auditory cues `[Applause]` or `[Upbeat music plays]`.",
        visualSteps: [
          "Review auto-generated captions alongside the video timeline to catch spelling and homophone errors.",
          "Insert speaker tags when multiple people speak: `[Narrator]:` or `[Alex]:`.",
          "Include meaningful sound effect descriptions in brackets to provide equivalent auditory context."
        ],
        transcript: "In Lesson 4, we correct transcription errors. Automatic captions often mishear technical words. As an accessible caption editor, your accuracy directly impacts the learner's comprehension.",
        practicalExercise: {
          title: "Proofread & Synchronize Multi-Speaker Captions",
          instruction: "Proofread a 1-minute automated transcript, fix 3 terminology errors, and add speaker tags for two alternating speakers.",
          targetLabel: "Verify Proofreading & Sync",
          successMessage: "Transcription proofreading and speaker synchronization verified!"
        }
      },
      {
        id: "les-video-5",
        title: "Exporting Videos with Embedded & Sidecar Subtitles",
        duration: "45 mins",
        video: "rF8pL8G6s1U",
        content: "The final step is delivering the finished media in client-ready formats. In this lesson, you will learn the difference between 'Burned-In' open captions (permanently baked into the video pixels) and 'Sidecar' closed caption files (`.srt` or `.vtt`), and export an optimized 1080p MP4 file using H.264 compression.",
        visualSteps: [
          "Export a separate `.srt` subtitle file containing timestamps and caption text.",
          "Export a high-definition 1080p MP4 master video with open captions for social media feeds.",
          "Test the exported file across both desktop video players and mobile screens to verify text legibility."
        ],
        transcript: "Lesson 5 concludes with export workflows. Sidecar files let viewers toggle subtitles on or off, while burned-in open captions guarantee 100% caption visibility on mobile feeds where autoplay defaults to mute.",
        practicalExercise: {
          title: "Export Finished Video & SRT File",
          instruction: "Export an accessible video sequence along with its corresponding synchronized `.srt` sidecar caption file.",
          targetLabel: "Finalize Video Export",
          successMessage: "Accessible video and sidecar SRT export verified!"
        }
      }
    ],
    practicalAssessment: {
      title: "Synchronized Video Captioning Project",
      instruction: "Prepare a short video clip with synchronized 2-line subtitles, speaker identifiers, and an accompanying plain-text transcript.",
      challenge: "According to accessible broadcast and web captioning guidelines, what is the maximum recommended number of lines displayed simultaneously on screen?",
      options: [
        "No more than 2 lines at a time",
        "Up to 5 lines of continuous text",
        "10 lines covering the entire lower half of the video",
        "As many lines as can fit on screen"
      ],
      answer: "No more than 2 lines at a time",
      feedback: "Correct! Caption guidelines restrict on-screen text to a maximum of 2 lines to ensure reading speed matches visual pacing without blocking visual content."
    },
    quiz: {
      question: "Which file format is the universal industry standard for closed caption and subtitle timecodes?",
      options: [
        ".srt (SubRip Subtitle)",
        ".exe (Executable binary)",
        ".mp3 (Audio only)",
        ".zip (Compressed archive)"
      ],
      answer: ".srt (SubRip Subtitle)",
      explanation: ".srt files are lightweight, universal plain-text files containing sequential numbers, start/end timecodes, and corresponding subtitle text."
    }
  },
  {
    id: "deaf-course-4",
    title: "Content Writing with AI",
    description: "Learn to create useful written content with the assistance of AI tools, fact-checking workflows, and professional writing portfolio preparation.",
    category: "writing",
    instructor: "Aisha Patel, Senior Content Strategist",
    duration: "2h 50m",
    level: "Beginner",
    rating: 4.90,
    badge: "AI Copywriting Track",
    learningOutcome: "Draft engaging articles, product descriptions, and social media copy using prompt frameworks and meticulous fact-checking.",
    careerPathways: "Freelance Writer, Content Assistant, Product Description Writer, Digital Copywriter.",
    video: "HAnw168huqA",
    modules: [
      "Fundamentals of clear writing",
      "Writing social media captions",
      "Creating product descriptions",
      "Using AI for drafting and brainstorming",
      "Fact-checking and proofreading",
      "Building a writing portfolio"
    ],
    lessons: [
      {
        id: "les-write-1",
        title: "Fundamentals of Clear, Engaging Writing",
        duration: "25 mins",
        video: "HAnw168huqA",
        content: "Good digital writing is concise, direct, and easy to read. In this lesson, you will learn the inverted pyramid structure (placing the most important conclusion in the very first sentence), active voice versus passive voice, avoiding corporate jargon, and writing scannable paragraphs consisting of only 2 to 3 sentences.",
        visualSteps: [
          "Lead with the primary benefit: 'Save 3 hours every week' instead of 'Our software facilitates time management'.",
          "Convert passive sentences to active: Replace 'The report was completed by Sarah' with 'Sarah completed the report'.",
          "Break long text blocks into visual lists and short readable paragraphs."
        ],
        transcript: "Welcome to Lesson 1: Fundamentals of Clear Writing. Online readers do not read word-for-word; they scan in an F-shaped pattern. Clear headings, bold keywords, and short sentences ensure your message connects instantly.",
        practicalExercise: {
          title: "Rewrite Complex Copy into Plain Language",
          instruction: "Rewrite a 4-sentence dense corporate paragraph into 2 concise, active-voice, scannable sentences.",
          targetLabel: "Verify Plain Language",
          successMessage: "Plain language rewrite verified for clarity and scannability!"
        }
      },
      {
        id: "les-write-2",
        title: "Writing High-Converting Social Media Captions",
        duration: "35 mins",
        video: "HAnw168huqA",
        content: "Social media captions must capture attention within the first 60 characters before the 'See More' cutoff. In this lesson, you will learn the Hook-Value-CTA framework: writing an intriguing first line, delivering 2-3 value points, and ending with a clear question or call to action that sparks engagement.",
        visualSteps: [
          "Draft 3 hook variations: Question hook, Surprising statistic hook, and Problem-Solution hook.",
          "Format the body copy with purposeful line breaks and emojis as visual bullet points.",
          "Conclude with an action call: 'Which tip will you try first? Comment below!'"
        ],
        transcript: "In Lesson 2, we craft social media captions. The hook is 80% of your caption's success. If the first line doesn't trigger curiosity, the reader scrolls past without reading your value points.",
        practicalExercise: {
          title: "Craft a Hook-Value-CTA Social Caption",
          instruction: "Write a 100-word social media caption with a strong opening hook, 3 bulleted insights, and a concluding question.",
          targetLabel: "Verify Social Caption",
          successMessage: "Social caption verified with strong Hook-Value-CTA structure!"
        }
      },
      {
        id: "les-write-3",
        title: "Writing Scannable Product Descriptions",
        duration: "30 mins",
        video: "HAnw168huqA",
        content: "E-commerce product descriptions bridge the gap between technical specs and buyer benefits. In this lesson, you will learn the 'Features tell, benefits sell' principle, writing sensory bullet points, addressing customer objections proactively, and incorporating accessible search keywords naturally.",
        visualSteps: [
          "List 3 technical features and translate each into an emotional benefit (e.g. Feature: 'Anodized aluminum body' -> Benefit: 'Lightweight and built to survive daily travel').",
          "Structure the description: Short 2-sentence overview -> 4 bulleted key benefits -> Technical specs table.",
          "Include sizing and compatibility notes to eliminate buyer uncertainty."
        ],
        transcript: "Lesson 3 explores product copywriting. Customers buy the result of a product, not just the raw materials. Focus on how the product makes their workday easier, faster, or more comfortable.",
        practicalExercise: {
          title: "Write a Benefit-Driven Product Description",
          instruction: "Write a 75-word product description for an ergonomic keyboard including 3 benefit bullets and compatibility details.",
          targetLabel: "Verify Product Description",
          successMessage: "Benefit-driven product description verified!"
        }
      },
      {
        id: "les-write-4",
        title: "Prompting AI for Brainstorming, Outlining & Drafting",
        duration: "40 mins",
        video: "HAnw168huqA",
        content: "AI is a powerful collaborative brainstorming partner when given clear constraints. In this lesson, you will learn the CTAC prompting formula: Context (who you are writing for), Task (exact deliverable), Audience (reader background), and Constraints (word count, tone, keywords to avoid).",
        visualSteps: [
          "Construct structured prompt: 'You are an accessible design copywriter. Write a 150-word outline for a blog post on accessible remote workplaces for managers. Use active voice and include 3 subheadings.'",
          "Request 5 distinct title angle variations to explore fresh perspectives.",
          "Use iterative refinement prompts to deepen specific sub-points."
        ],
        transcript: "In Lesson 4, we leverage AI for drafting. AI tools produce their best work when given strict boundaries. Never ask for a generic article; provide your outline and audience profile first.",
        practicalExercise: {
          title: "Construct a CTAC Prompt & Outline",
          instruction: "Write a complete CTAC prompt and generate a 3-part structured article outline using AI assistance.",
          targetLabel: "Verify Prompt & Outline",
          successMessage: "CTAC prompt structure and article outline verified!"
        }
      },
      {
        id: "les-write-5",
        title: "Fact-Checking, Verifying & Editing AI Outputs",
        duration: "40 mins",
        video: "HAnw168huqA",
        content: "AI models predict word sequences; they do not possess verified knowledge. In this lesson, you will learn rigorous fact-checking procedures: verifying every statistic and quoted source against primary publications, spotting AI hallucinations, eliminating repetitive corporate buzzwords, and refining tone for human authenticity.",
        visualSteps: [
          "Highlight every factual claim, date, and statistic in an AI draft and trace it to an authoritative primary source.",
          "Remove cliché AI phrases: 'In this digital age', 'Delve into', 'Testament to', 'Seamless tapestry'.",
          "Read copy visually sentence-by-sentence to verify logical flow and rhythmic sentence length variation."
        ],
        transcript: "In Lesson 5, we master fact-checking. A professional writer is legally and ethically responsible for every word they publish. Treating AI output as an unverified rough draft protects your professional reputation.",
        practicalExercise: {
          title: "Fact-Check & Polish an AI Draft",
          instruction: "Review a sample AI-generated text, remove 3 robotic cliché phrases, and verify factual assertions.",
          targetLabel: "Finalize Fact-Checked Article",
          successMessage: "Fact-checking and editorial polish successfully completed!"
        }
      }
    ],
    practicalAssessment: {
      title: "Sample Business Product Copy & Social Campaign",
      instruction: "Write 2 benefit-driven product descriptions and 3 social media captions for a sample eco-friendly business, verifying facts and applying clear visual formatting.",
      challenge: "Why must human writers meticulously fact-check and verify information produced by AI models before publication?",
      options: [
        "AI models can confidently generate plausible-sounding but completely fabricated facts (hallucinations)",
        "AI text is always 100% verified by government databases automatically",
        "AI models only produce text in ancient languages",
        "Fact-checking is only needed for printed textbooks"
      ],
      answer: "AI models can confidently generate plausible-sounding but completely fabricated facts (hallucinations)",
      feedback: "Correct! Generative AI models generate text based on statistical patterns and can hallucinate false citations or facts. Human fact-checking against primary sources is mandatory."
    },
    quiz: {
      question: "In the CTAC prompt framework for AI content writing, what does the letter 'C' at the end represent?",
      options: [
        "Constraints (word counts, tone rules, and exclusions)",
        "Calculation (complex arithmetic)",
        "Confusion (making the prompt difficult)",
        "Color (font styling)"
      ],
      answer: "Constraints (word counts, tone rules, and exclusions)",
      explanation: "CTAC stands for Context, Task, Audience, and Constraints. Constraints set the exact boundaries such as length, tone, and prohibited terms."
    }
  },
  {
    id: "deaf-course-5",
    title: "Digital Marketing and Social Media",
    description: "Learn to plan, create, and manage digital marketing campaigns, content calendars, and audience engagement across modern digital platforms.",
    category: "marketing",
    instructor: "Jordan Taylor, Digital Growth Consultant",
    duration: "3h 20m",
    level: "Intermediate",
    rating: 4.86,
    badge: "Marketing Operations",
    learningOutcome: "Plan multi-week social content calendars, design campaign briefs, analyze engagement metrics, and optimize digital reach.",
    careerPathways: "Social Media Assistant, Digital Marketing Assistant, Content Coordinator, Brand Operations Specialist.",
    video: "m1B_G1234",
    modules: [
      "Introduction to digital marketing",
      "Understanding social media platforms",
      "Creating a content calendar",
      "Planning marketing campaigns",
      "Understanding audience engagement",
      "Reviewing basic campaign performance"
    ],
    lessons: [
      {
        id: "les-mktg-1",
        title: "Introduction to Digital Marketing & Core Channels",
        duration: "30 mins",
        video: "m1B_G1234",
        content: "Digital marketing connects businesses with prospective customers through online channels. In this lesson, you will explore the digital marketing ecosystem: owned media (website, email newsletter), earned media (mentions, reviews, shares), and paid media (search and social ads), and understand the customer journey from Awareness to Conversion.",
        visualSteps: [
          "Diagram the 3 stages of the marketing funnel: Top of Funnel (Awareness), Middle (Consideration), Bottom (Purchase).",
          "Map specific content types to each funnel stage: Educational graphics at Top, Customer Reviews at Middle, Discount Offers at Bottom.",
          "Identify the difference between organic reach and paid advertising."
        ],
        transcript: "Welcome to Lesson 1: Introduction to Digital Marketing. Successful digital marketing is about delivering the right message to the right audience at the right time. Understanding the marketing funnel helps you choose the best content format.",
        practicalExercise: {
          title: "Map Marketing Funnel Content",
          instruction: "Classify 6 sample marketing posts into Top-of-Funnel (Awareness), Middle-of-Funnel (Consideration), or Bottom-of-Funnel (Action).",
          targetLabel: "Verify Funnel Mapping",
          successMessage: "Marketing funnel content classification verified!"
        }
      },
      {
        id: "les-mktg-2",
        title: "Platform Dynamics: LinkedIn, Instagram & YouTube",
        duration: "35 mins",
        video: "m1B_G1234",
        content: "Different social platforms cater to distinct user mindsets. In this lesson, you will compare platform dynamics: LinkedIn emphasizes professional growth, industry data, and career development; Instagram focuses on aesthetic visual curation, carousels, and stories; while YouTube values deep educational tutorials and search longevity.",
        visualSteps: [
          "Review platform visual dimensions: 1:1 and 4:5 for Instagram feeds, 16:9 for YouTube landscapes, 1200x628 for LinkedIn link previews.",
          "Tailor tone of voice: Authoritative and peer-to-peer on LinkedIn; inspiring and conversational on Instagram.",
          "Incorporate accessibility: Always include descriptive Alt text for all image posts across platforms."
        ],
        transcript: "Lesson 2 explores platform demographics and formats. Never broadcast the exact same generic post to every platform. Adapting your visual framing to fit user expectations maximizes organic reach.",
        practicalExercise: {
          title: "Platform-Specific Content Strategy",
          instruction: "Adapt a single company milestone announcement into two distinct posts: one for LinkedIn and one for Instagram.",
          targetLabel: "Verify Platform Adaptation",
          successMessage: "Platform-specific content adaptations verified!"
        }
      },
      {
        id: "les-mktg-3",
        title: "Building a Practical Weekly Content Calendar",
        duration: "40 mins",
        video: "m1B_G1234",
        content: "Consistency is the foundation of digital community building. In this lesson, you will learn to build a weekly social media content calendar using the 4 core content pillars: Educational (40%), Community & Behind-the-Scenes (30%), Customer Stories & Social Proof (20%), and Promotional (10%).",
        visualSteps: [
          "Set up a calendar grid: Days of the week (Monday through Sunday), Time of posting, Platform, Pillar, Visual Asset link, Caption draft, and Status.",
          "Schedule batch creation days so graphics and captions are completed one week in advance.",
          "Track key national awareness days and seasonal events relevant to your target community."
        ],
        transcript: "In Lesson 3, we build a structured content calendar. Posting inconsistently confuses algorithms and loses audience attention. A content calendar lets you plan high-quality assets in advance without daily deadline pressure.",
        practicalExercise: {
          title: "Build a 7-Day Content Calendar Grid",
          instruction: "Build a 7-day social media calendar assigning balanced content pillars, visual asset notes, and scheduled posting times.",
          targetLabel: "Verify Content Calendar",
          successMessage: "7-day structured content calendar verified!"
        }
      },
      {
        id: "les-mktg-4",
        title: "Planning & Executing a Cohesive Campaign",
        duration: "45 mins",
        video: "m1B_G1234",
        content: "A marketing campaign coordinates multiple digital touchpoints around a single unified objective (e.g. product launch, workshop enrollment, seasonal promotion). In this lesson, you will learn to write a SMART campaign brief, set up tracking UTM links, and execute a 3-phase rollout: Teaser, Launch, and Last Call.",
        visualSteps: [
          "Define SMART campaign goal: 'Generate 200 webinar registrations within 14 days'.",
          "Draft campaign brief: Key message, target audience persona, visual hashtag, deliverable checklist.",
          "Schedule the 3 campaign phases: Teaser phase (Days 1-3), Main Launch (Days 4-10), Last Chance Urgency (Days 11-14)."
        ],
        transcript: "Lesson 4 teaches campaign execution. Campaigns tell a progressive story over several days. Phase-based rollouts build anticipation and convert interested prospects into committed participants.",
        practicalExercise: {
          title: "Design a 3-Phase Campaign Brief",
          instruction: "Draft a 1-page campaign brief detailing a 3-phase rollout for a seasonal community workshop.",
          targetLabel: "Verify Campaign Brief",
          successMessage: "3-phase campaign brief and rollout strategy verified!"
        }
      },
      {
        id: "les-mktg-5",
        title: "Reviewing Engagement & Performance Metrics",
        duration: "50 mins",
        video: "m1B_G1234",
        content: "Data-driven marketing improves future performance through objective analysis. In this lesson, you will learn to interpret key analytics: Impressions (total views), Reach (unique accounts), Engagement Rate `((Likes + Comments + Shares + Saves) / Reach * 100)`, and Click-Through Rate (CTR) to understand what content truly resonates with your audience.",
        visualSteps: [
          "Calculate Engagement Rate on a sample post with 500 impressions, 25 likes, 10 comments, 5 shares, and 10 saves: `((25+10+5+10)/500)*100 = 10%`.",
          "Identify high-performing visual themes and iterate on successful formats.",
          "Compile a monthly 1-page executive performance summary with key lessons learned."
        ],
        transcript: "In Lesson 5, we analyze campaign analytics. Vanity metrics like follower counts mean little without engagement. High saves and shares prove that your content delivered real educational value to your audience.",
        practicalExercise: {
          title: "Calculate Metrics & Executive Summary",
          instruction: "Calculate the engagement rate of 3 sample posts and write 2 actionable recommendations for the next campaign.",
          targetLabel: "Finalize Performance Analysis",
          successMessage: "Performance analytics calculation and recommendations verified!"
        }
      }
    ],
    practicalAssessment: {
      title: "One-Week Social Media Campaign Plan",
      instruction: "Create a 7-day social media campaign schedule for a fictional small business (e.g. local bakery, eco-retailer, or design studio), including daily objectives, visual asset concepts, hooks, and call-to-actions.",
      challenge: "What is the primary benefit of maintaining a structured content calendar in social media marketing?",
      options: [
        "Ensures consistent posting, balanced content themes, and reduces last-minute creation stress",
        "Guarantees every post will go viral automatically",
        "Eliminates the need to ever create images or visual assets",
        "Prevents viewers from commenting on your posts"
      ],
      answer: "Ensures consistent posting, balanced content themes, and reduces last-minute creation stress",
      feedback: "Correct! Content calendars guarantee predictable publishing cadence, maintain balanced content pillars, and allow teams to produce accessible visual assets ahead of time."
    },
    quiz: {
      question: "How is Social Media Engagement Rate standardly calculated on a published post?",
      options: [
        "((Total Engagements [Likes + Comments + Shares + Saves]) / Reach or Impressions) * 100",
        "By counting only the total number of followers",
        "By dividing total words in the caption by 10",
        "By multiplying total likes by the year"
      ],
      answer: "((Total Engagements [Likes + Comments + Shares + Saves]) / Reach or Impressions) * 100",
      explanation: "Engagement rate measures active viewer interaction (likes, comments, shares, saves) relative to total views (impressions or reach)."
    }
  }
];

export const DEAF_LEARN_PRACTISE_EARN = [
  {
    id: "portfolio",
    title: "Build Your Portfolio",
    icon: "folder_shared",
    color: "from-blue-600 to-indigo-700",
    description: "Every practical exercise you complete in these courses generates a real work artifact. Learn how to curate your design mockups, spreadsheets, caption files, and writing samples into a professional digital portfolio.",
    items: [
      "Save your Canva event posters, social media sets, and branding guides in high-res PDF and PNG formats.",
      "Store formatted business memos and expense spreadsheets as clean cloud links.",
      "Host short video clips with synchronized `.srt` caption files showcasing accessible media editing.",
      "Organize writing samples on Notion, GitHub Pages, or a personal portfolio site."
    ],
    callToAction: "Add Completed Course Projects to Portfolio"
  },
  {
    id: "career_paths",
    title: "Explore Career Paths",
    icon: "explore",
    color: "from-cyan-600 to-teal-700",
    description: "These courses prepare you for practical, visual, and asynchronous digital roles that thrive on written communication and attention to detail:",
    items: [
      "🎨 Graphic Design & Social Media: Freelance visual designer, marketing asset assistant, social media coordinator.",
      "💼 Digital Office & Administration: Virtual assistant, remote document specialist, administrative clerk.",
      "🎬 Captioning & Subtitle Production: Video captioner, subtitle editor, accessible media coordinator.",
      "✍️ AI Content & Copywriting: Freelance writer, product description writer, content assistant.",
      "📈 Digital Marketing Support: Content calendar coordinator, community manager, marketing operations assistant."
    ],
    callToAction: "Review Career Track Competencies"
  },
  {
    id: "prepare_work",
    title: "Prepare for Work",
    icon: "psychology",
    color: "from-amber-600 to-orange-700",
    description: "Guidance on transitioning your skills into workplace opportunities with confidence and professional communication:",
    items: [
      "📄 Skills-Based CV: Lead with technical proficiencies (Canva, Excel, Subtitle timing, Prompting) and project links rather than generic job titles.",
      "💬 Asynchronous Communication: Master concise, polite business emails, task tracking comments, and written project handoffs.",
      "🌐 Remote Platforms & Contracts: Explore reputable freelance marketplaces and remote-friendly job boards with clear milestones.",
      "⚠️ Career Guidance Disclosure: These educational materials provide professional preparation and portfolio building skills; they represent career guidance and do not promise guaranteed employment or income."
    ],
    callToAction: "Access Workplace Readiness Checklist"
  }
];

