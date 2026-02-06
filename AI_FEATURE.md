# 🤖 Proactive AI Mentor Feature

> **Status**: Planned for future manual implementation.
> **Goal**: Move from a simple "Error Explainer" to a "Coding Coach" that understands the student's learning context.

## 🎯 Concept

Instead of just fixing syntax errors, the AI Mentor proactively suggests best practices, offers refactoring challenges, and adapts to the student's struggle level.

## 🏗️ Technical Implementation

### 1. Context-Aware Prompts

The backend will construct a strict prompt context when calling the LLM. It shouldn't just be the current file content.

**Context Payload:**

```json
{
  "code": "...",
  "compiler_errors": ["..."],
  "history": [{ "attempt_id": 1, "failed_tests": ["test_borrow"] }],
  "topic": "Ownership & Borrowing",
  "pedagogical_goal": "Teach the difference between Move and Copy"
}
```

### 2. Adaptive Generation Loop

If a student is stuck (e.g., fails the same test 3 times):

1.  **Trigger**: System detects frustration signal.
2.  **Action**: AI generates a _Bridge Exercise_.
    - This is a simplified version of the current problem.
    - It isolates the specific concept the student is failing at.
3.  **Storage**: The generated exercise is saved to `lessons/practice/generated_<id>.rs`.
4.  **UI**: "It looks like you're stuck on Borrowing. Try this simplified challenge first!"

### 3. Instructor Persona

Instructors should be able to configure the "personality" of the AI in `course.json`:

- **Strict**: "This code compiles but allocates memory unnecessarily. Fix it."
- **Supportive**: "Great start! You're almost there. Have you thought about..."

## 🧩 Why this solves a problem

Current AI tools (Copilot/ChatGPT) just give the answer. This feature is designed to **teach**, withholding the answer when necessary to promote learning retention.
