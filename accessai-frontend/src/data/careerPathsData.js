export const CAREER_PATHS = [
  {
    id: "career-web-dev",
    title: "Full Stack Web Development Career Path",
    track: "Accessible Frontend & Full Stack Engineering",
    description: "Master end-to-end web software engineering: from accessible semantic markup and responsive CSS layout architectures to modern JavaScript logic, React UI components, and secure backend RESTful APIs.",
    badge: "Industry Verified Track",
    icon: "code",
    totalCourses: 5,
    skills: [
      "Semantic HTML5 & WAI-ARIA Accessibility Standards",
      "Modern Responsive CSS3 Layouts, Flexbox & Grid",
      "JavaScript (ES6+), Asynchronous Logic & DOM Architecture",
      "React Component Lifecycle, Hooks & State Management",
      "RESTful API Integration, Node.js & Cloud Deployment"
    ],
    careerStatement: "Confirms completion of 5 comprehensive web development courses and demonstrated competencies in accessible full-stack software development for career-readiness and professional portfolio presentation.",
    courses: [
      {
        id: "web-101",
        title: "HTML5 Architecture & Accessible Semantics",
        description: "Learn semantic elements, accessibility tags, document tree structure, and screen-reader compatibility.",
        duration: "2h 15m",
        video: "qz0aGYrrlhU",
        category: "frontend",
        quiz: {
          question: "What is the primary accessibility benefit of using HTML5 semantic elements like <header>, <main>, and <nav>?",
          options: [
            "They provide accessible screen reader landmarks and clear document structure",
            "They automatically style pages without CSS",
            "They speed up browser JavaScript execution",
            "They compress image files on load"
          ],
          answer: "They provide accessible screen reader landmarks and clear document structure"
        }
      },
      {
        id: "web-102",
        title: "CSS3 Modern Layouts, Flexbox & Grid Systems",
        description: "Master two-dimensional layouts, flexbox alignments, responsive media queries, and high-contrast design.",
        duration: "2h 45m",
        video: "1Rs2ND1ryYc",
        category: "styling",
        quiz: {
          question: "Which CSS display property creates a two-dimensional layout system with rows and columns?",
          options: [
            "display: flex",
            "display: grid",
            "display: inline-block",
            "display: table"
          ],
          answer: "display: grid"
        }
      },
      {
        id: "web-103",
        title: "JavaScript Essentials & Asynchronous Programming",
        description: "Deep dive into ES6+ syntax, closures, event loops, promises, async/await, and accessible DOM manipulation.",
        duration: "3h 30m",
        video: "W6NZfCO5SIk",
        category: "programming",
        quiz: {
          question: "Which keyword is used inside an async function to pause execution until a Promise resolves?",
          options: [
            "defer",
            "yield",
            "await",
            "resolve"
          ],
          answer: "await"
        }
      },
      {
        id: "web-104",
        title: "React Application Engineering & Custom Hooks",
        description: "Build dynamic, accessible web apps with reusable components, state hooks, effect management, and routing.",
        duration: "4h 00m",
        video: "bMknfKXIFA8",
        category: "frameworks",
        quiz: {
          question: "Which React Hook is primarily used for managing local component state across renders?",
          options: [
            "useEffect",
            "useMemo",
            "useState",
            "useRef"
          ],
          answer: "useState"
        }
      },
      {
        id: "web-105",
        title: "Full Stack RESTful APIs & Production Deployment",
        description: "Integrate backend endpoints, handle JSON requests, authenticate users securely, and deploy web applications.",
        duration: "3h 15m",
        video: "Oe421EPjeBE",
        category: "backend",
        quiz: {
          question: "Which standard HTTP method is conventionally used to update an existing record on a RESTful API server?",
          options: [
            "GET",
            "PUT",
            "DELETE",
            "HEAD"
          ],
          answer: "PUT"
        }
      }
    ]
  },
  {
    id: "career-python-dev",
    title: "Python Programming Career Path",
    track: "Python Software & Backend Engineering",
    description: "Develop full professional fluency in Python programming: master core syntax, structured data algorithms, object-oriented software engineering, relational database management, and backend microservice APIs.",
    badge: "Software Engineering Track",
    icon: "terminal",
    totalCourses: 5,
    skills: [
      "Core Python 3 Syntax, Variable Types & Exception Handling",
      "Advanced Data Structures, Hash Maps, Lists & File I/O",
      "Object-Oriented Programming (OOP) & Inheritance Patterns",
      "Relational Database Management & SQL Query Architecture",
      "Microservice REST APIs with Flask, Automation & Unit Testing"
    ],
    careerStatement: "Confirms completion of 5 comprehensive Python software courses and demonstrated competencies in Python software architecture and backend engineering for career-readiness and professional portfolio presentation.",
    courses: [
      {
        id: "py-101",
        title: "Python Core Fundamentals & Variables",
        description: "Write basic scripts, handle primitive data types, control flow structures, and user inputs.",
        duration: "2h 00m",
        video: "rfscVS0vtbw",
        category: "python",
        quiz: {
          question: "Which keyword is used to declare a function in Python?",
          options: [
            "function",
            "def",
            "func",
            "fn"
          ],
          answer: "def"
        }
      },
      {
        id: "py-102",
        title: "Data Structures: Lists, Dictionaries & Tuples",
        description: "Master memory collections, key-value mappings, list comprehensions, and data transformations.",
        duration: "2h 30m",
        video: "kqtD5dpn9C8",
        category: "python",
        quiz: {
          question: "Which built-in Python collection is immutable (cannot be altered after creation)?",
          options: [
            "List",
            "Dictionary",
            "Tuple",
            "Set"
          ],
          answer: "Tuple"
        }
      },
      {
        id: "py-103",
        title: "Object-Oriented Programming in Python",
        description: "Design modular code with classes, encapsulation, inheritance, polymorphism, and magic methods.",
        duration: "3h 15m",
        video: "JeznW_7DlB0",
        category: "python",
        quiz: {
          question: "What special method acts as the class constructor / initializer in Python?",
          options: [
            "__start__",
            "__construct__",
            "__init__",
            "__new__"
          ],
          answer: "__init__"
        }
      },
      {
        id: "py-104",
        title: "Database Management & SQLite with Python",
        description: "Store and query structured data, write parameterized SQL statements, and manage transactions safely.",
        duration: "2h 45m",
        video: "HXV3zeQKqGY",
        category: "databases",
        quiz: {
          question: "Which SQL clause is used to filter records matching specific criteria in a SELECT query?",
          options: [
            "GROUP BY",
            "HAVING",
            "WHERE",
            "ORDER BY"
          ],
          answer: "WHERE"
        }
      },
      {
        id: "py-105",
        title: "Backend Microservices & REST APIs with Flask",
        description: "Build high-performance web APIs, route incoming HTTP requests, serialize JSON, and handle errors.",
        duration: "3h 45m",
        video: "Z1RJmh_OqeA",
        category: "backend",
        quiz: {
          question: "Which Python decorator in Flask binds a view function to a specific incoming URL endpoint?",
          options: [
            "@app.route",
            "@app.endpoint",
            "@app.bind",
            "@app.view"
          ],
          answer: "@app.route"
        }
      }
    ]
  },
  {
    id: "career-ai-fundamentals",
    title: "AI Fundamentals Career Path",
    track: "Artificial Intelligence & Assistive Technologies",
    description: "Build practical competencies in Artificial Intelligence: understand machine learning theory, data preprocessing pipelines, deep learning neural network architectures, and inclusive assistive AI technologies.",
    badge: "Artificial Intelligence Track",
    icon: "psychology",
    totalCourses: 5,
    skills: [
      "Machine Learning Mathematical & Conceptual Foundations",
      "Data Wrangling, Feature Scaling & Matrix Computing with NumPy",
      "Supervised & Unsupervised Machine Learning Algorithms",
      "Deep Neural Networks, Multi-Layer Perceptrons & Optimization",
      "Applied Generative AI, Large Language Models & Inclusive Tech"
    ],
    careerStatement: "Confirms completion of 5 comprehensive AI & Machine Learning courses and demonstrated competencies in intelligent algorithms and assistive AI for career-readiness and professional portfolio presentation.",
    courses: [
      {
        id: "ai-101",
        title: "Introduction to Artificial Intelligence & ML Foundations",
        description: "Learn the paradigms of AI, data representations, problem formulation, and model evaluation metrics.",
        duration: "2h 30m",
        video: "JMUxmLgwMT8",
        category: "ai",
        quiz: {
          question: "Which branch of machine learning trains models using labeled input-output training datasets?",
          options: [
            "Supervised Learning",
            "Unsupervised Learning",
            "Reinforcement Learning",
            "Clustering"
          ],
          answer: "Supervised Learning"
        }
      },
      {
        id: "ai-102",
        title: "Data Wrangling & Matrix Computing for AI",
        description: "Clean raw datasets, perform vectorized numerical calculations, and prepare tensor inputs using NumPy.",
        duration: "2h 45m",
        video: "QUT1VHiLmmI",
        category: "ai",
        quiz: {
          question: "Which Python library is the foundational standard for high-performance multidimensional array computing in AI?",
          options: [
            "Requests",
            "NumPy",
            "Flask",
            "Jinja2"
          ],
          answer: "NumPy"
        }
      },
      {
        id: "ai-103",
        title: "Supervised & Unsupervised Learning Algorithms",
        description: "Implement regression models, decision trees, random forests, clustering techniques, and vector machines.",
        duration: "3h 15m",
        video: "7eh4d6sabA0",
        category: "ai",
        quiz: {
          question: "Which classification algorithm identifies an optimal hyperplane maximizing the decision boundary margin between classes?",
          options: [
            "K-Means",
            "Support Vector Machine (SVM)",
            "Principal Component Analysis",
            "Linear Regression"
          ],
          answer: "Support Vector Machine (SVM)"
        }
      },
      {
        id: "ai-104",
        title: "Deep Learning & Neural Network Architectures",
        description: "Understand artificial neurons, activation functions, loss calculations, forward passes, and backpropagation.",
        duration: "3h 45m",
        video: "aircAruvnKk",
        category: "ai",
        quiz: {
          question: "What algorithmic process updates neural network weights based on the gradient of the loss function?",
          options: [
            "Forward Propagation",
            "Backpropagation",
            "Random Sampling",
            "Feature Pruning"
          ],
          answer: "Backpropagation"
        }
      },
      {
        id: "ai-105",
        title: "Generative AI & Inclusive Assistive Technologies",
        description: "Explore Large Language Models, prompt engineering, accessibility agents, and computer vision gesture tracking.",
        duration: "3h 00m",
        video: "G2fqAlgmoPo",
        category: "ai",
        quiz: {
          question: "In Transformer AI architectures, what core mechanism enables the model to weigh the contextual importance of different tokens dynamically?",
          options: [
            "Self-Attention",
            "Convolutional Pooling",
            "Gradient Clipping",
            "Recurrent Gates"
          ],
          answer: "Self-Attention"
        }
      }
    ]
  }
];
