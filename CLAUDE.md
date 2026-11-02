# Team Protocol: Meko Build & Coding Agents (hackCBS 9.0)

This repository follows the **Meko Team Protocol** for shared coding agent context.

## 1. Meko Team Setup
- **Shared Team Build Datapack**: `accessai-build`
- **MCP Endpoint**: `https://mcp.mekodata.ai/mcp`
- **Role Permissions**: Teammates are invited as **Maintainers** in the Meko portal to enable promotion of shared decisions.

## 2. Agent Instruction Protocol
All coding agents (Claude Code, Cursor, Codex, Antigravity) working on AccessAI MUST adhere to the following 4-step workflow:

1. **Recall Before Every Task**:
   - Query the `accessai-build` datapack using `memory_search` before implementing any feature, schema, or route.
   - Respect previously promoted architectural decisions, message schemas, and API contracts.

2. **Summarize After Every Task**:
   - When a task or feature completes, save a concise summary of the implementation, files modified, and test results into the build datapack.

3. **Promote Shared Decisions**:
   - Any architectural decision, shared interface, communication schema, or design constraint that other teammates' agents must follow MUST be promoted.
   - Only promoted rows reach the rest of the team.
   - Always name the teammate who made the decision (e.g., `[Teammate: Nupur Walwadkar]` or `[Teammate: Developer 2]`).

4. **Zero Secrets / Zero Personal Data**:
   - NEVER place API keys, private credentials, tokens, or personal user data into the build datapack.

---

## 3. Check T: Promoted Team Decisions (Build Datapack: `accessai-build`)

1. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Two-Way Meeting Message Schema*:
   Standardized JSON structure: `{ meetingId, senderId, senderName, senderMode ("deaf_mute" | "hearing"), messageType ("sign_to_text" | "text_message" | "speech_to_text"), text, timestamp }`.

2. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Zero Mandatory Permissions Contract*:
   Microphone permission is NEVER mandatory or requested for Deaf/Mute participants. Camera permission is 100% voluntary, default OFF on join, with text as the primary fallback.

3. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Role-Based Meeting Restriction (Join Only)*:
   Deaf/Mute students have strictly participant-level access (`role: "student"`, `isHost: false`, `canKick: false`, `canEndMeeting: false`). `POST /meetings/create` returns 403 Forbidden for students.

4. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Sign Language Detection Pipeline*:
   Combines MediaPipe Tasks Vision Gesture Recognizer with 21 3D hand landmarks geometric classification. Implements 650ms stable hold before committing gestures and 1400ms debounce cooldown.

5. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Text-to-Speech (TTS) Execution Gate*:
   TTS strictly speaks finalized sentences sent by the student. Intermediate continuous gesture predictions are never spoken aloud to prevent audio distortion for hearing participants.

6. **[Teammate: Developer 2 (Hearing Module Lead)]** - *Speech-to-Text & Captions Broadcast*:
   Hearing participants' spoken audio is transcribed via Web Speech Recognition and broadcast to the meeting channel with `messageType: "speech_to_text"` to render real-time captions.

7. **[Teammate: Developer 2 (Hearing Module Lead)]** - *3D Sign Avatar Sync*:
   When speech-to-text messages arrive, the 3D WebGL Avatar (`Avatar3DCanvas`) automatically animates ASL sign poses (`avatarAction: "sign_asl"`) and lip visemes in sync with the captions ticker.

8. **[Teammate: Developer 2 (Hearing Module Lead)]** - *Multi-Transport Real-Time Synchronization*:
   Dual-layer messaging architecture: Zero-latency `BroadcastChannel("accessai_meeting_" + meetingId)` for multi-tab evaluation and fallback Supabase Realtime broadcast for distributed network participants.

9. **[Teammate: Nupur Walwadkar (Developer 1)]** - *Mandatory Text-Based Communication & Quick Responses*:
   Full text chat system with 8 standardized quick responses (`Yes`, `No`, `I agree`, `I disagree`, `Please repeat`, `I have a question`, `I need help`, `Thank you`) that function independently of any camera or microphone hardware.

10. **[Teammate: Developer 2 (Hearing Module Lead)]** - *Idempotent Message Deduplication*:
    All messages carry unique idempotency IDs (`txt-...`, `hearing-...`) cached in a bounded 200-element LRU set across storage and broadcast events to prevent duplicate transcript entries.

