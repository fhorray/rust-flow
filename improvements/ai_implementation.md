# AI Implementation Plan

This document outlines the plan to integrate AI features into Progy, leveraging the **Vercel AI SDK** with a strict **Local-First** approach for privacy and security.

## Core Philosophy

1.  **Local Keys**: API keys are stored **only** on the user's machine (`~/.progy/config.json`) and never synced to our cloud.
2.  **User Choice**: Users choose their provider (OpenAI, Anthropic, etc.) and model.
3.  **Context-Aware**: AI assistance isn't generic; it uses the specific context of the current exercise (code, error logs, course instructions).

## Architecture

### 1. Configuration (CLI & Local)
We will extend the `config` command to manage AI settings.

-   **Storage**: `~/.progy/config.json` (managed via `helpers.ts`)
-   **New Fields**:
    ```json
    {
      "ai": {
        "provider": "openai", // or 'anthropic', 'google', 'ollama'
        "model": "gpt-4o-mini",
        "apiKey": "sk-..."
      }
    }
    ```
-   **CLI Commands**:
    -   `progy config set ai.provider openai`
    -   `progy config set ai.apiKey <key>`
    -   `progy config set ai.model gpt-4o-mini`

### 2. Backend API (`apps/progy/src/backend/endpoints/ai.ts`)
We will transform the placeholder endpoint into a real AI gateway using the Vercel AI SDK (`ai` package).

-   **Dependencies**: `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/grok`, `zod`.
-   **Endpoints**:
    -   `POST /api/ai/chat`: Streaming chat interface.
    -   `POST /api/ai/hint`: One-off specific help based on current error.
-   **Logic**:
    1.  Read `ai` config from global config using `helpers.ts`.
    2.  Instantiate the correct provider (dynamically).
    3.  Construct a **System Prompt** containing:
        -   "You are Progy, a helpful coding tutor."
        -   "The user is working on [Course Name], Exercise [Name]."
    4.  Inject **Context**:
        -   Current File Content.
        -   Last Runner Output (Standard Output + Error Code).
        -   Quiz Status (if applicable).
    5.  Stream the response back to the client.

### 3. Frontend Integration (`apps/progy/src/frontend`)
-   **UI Components**:
    -   **`AIChatPanel`**: A tailored chat interface (using `useChat` from `@ai-sdk/react` or manual streaming).
    -   **"Get Hint" Button**: Appears when a runner fails.
-   **State**:
    -   Updates to `course-store.ts` to manage the chat visibility and history.

## Features to Implement

### Phase 1: The "Smart Hint" (MVP)
-   **Trigger**: User clicks "Ask AI" after a failed test.
-   **Prompt**: "The user failed exercise X. Here is the code: ... Here is the error: ... Give a helpful, Socratic hint without giving away the answer."
-   **Output**: Short text hint displayed in the UI.

### Phase 2: Interactive Chat
-   **Trigger**: Dedicated "AI Mentor" tab in the sidebar.
-   **Capabilities**:
    -   "Explain this code"
    -   "Why did my test fail?"
    -   general Q&A about the language (Rust/Go).

### Phase 3: Local LLMs (Ollama)
-   Support for `ollama` provider for fully offline/private AI (if the user has the hardware).

## Security & Privacy Checklist
-   [ ] Ensure `apiKey` is never logged to console.
-   [ ] Ensure `apiKey` is excluded from any crash reports.
-   [ ] Verify `apiKey` is NOT sent to Progy's central cloud backend (only to the AI provider).

## Roadmap

1.  **Setup**: Install `ai` and provider packages in `apps/progy`.
2.  **Config**: Update `helpers.ts` and `cli.ts` to handle AI config.
3.  **Backend**: Implement `aiHintHandler` in `endpoints/ai.ts`.
4.  **Frontend**: Connect the UI to the backend.
