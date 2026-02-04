---
description: Run the current exercise with cargo
---

# /run Command

Quick shortcut to run the current exercise without typing the full command.

## Steps for AI

1. **Identify Exercise**
   - Check `PROGRESS.md` for active session exercise name.
   - If no active session, check the currently open `.rs` file.
   - If neither, ask user: "Which exercise do you want to run?"

2. **Execute**
   // turbo
   - Run `cargo run -- run <exercise_name>`

3. **Analyze Output**
   - If **success** (exit code 0):
     - "✅ Exercise compiled and ran successfully!"
     - Show the output.
     - Suggest: "Ready to mark complete? Run `/done`"
   - If **compilation error**:
     - Show the error message.
     - Suggest: "Need help? Run `/hint` for a hint or `/why` for a deep explanation."
   - If **runtime panic**:
     - Show the panic message.
     - Explain what panics mean in Rust (unrecoverable error).
