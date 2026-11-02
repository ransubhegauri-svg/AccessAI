
> **Accessible Learning Platform Powered by Meko Shared Context Layer**  
> *Built for hackCBS 9.0 — Track A: Open Project*

AccessAI is an inclusive, adaptive learning platform designed for visually impaired and blind students who navigate digital education purely by voice.

Traditional voice assistants suffer from **session amnesia**: they forget the student's cognitive pace, recurring misconceptions, and preferred explanations. Powered by **Meko**, AccessAI remembers what each student struggles with and promotes shared pedagogical breakthroughs across the entire class.

---

## ⚡ Quick Start (Setup in 3 Commands)

```bash
# 1. Navigate to frontend
cd accessai-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Meko: Load-Bearing Memory Architecture

AccessAI uses Meko in two distinct layers:

### 1. Build-Time (Team Coding Agents)
- Shared build datapack: `accessai-build`
- All team coding agents query and promote architectural decisions live to satisfy **Check T**.

### 2. Runtime (Product Intelligence)
- **Private Student Memory (`student-<uid>-voice`)**: Remembers student speech rate preference (e.g. 0.8x for technical jargon), language comfort (English/Hindi/Kannada), and specific quiz questions where they stumbled.
- **Shared Course Canon (`course-<id>-knowledge`)**: When multiple students struggle with a concept (e.g. recursion or Python loops), the tutor promotes a high-retention auditory explanation to the shared course canon so future students succeed faster.
- **Meko ON vs Meko OFF**: Toggle live in the UI to see how AccessAI adapts when Meko context is present vs generic/amnesic with Meko switched off.
- **Context Inspector**: Students can review and forget remembered context at any time for total privacy.

---

## 🛠️ Tech Stack
- **Voice Engine**: Web Speech Recognition API with barge-in interruption & active echo cancellation
- **Multilingual Support**: Real-time Indic transliteration (English, Hindi, Kannada)
- **Shared Memory Layer**: Meko Context API (`docs.mekodata.ai`)
- **Frontend**: React 19, Tailwind CSS
