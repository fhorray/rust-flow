---
description: Get a pedagogy-aware hint for the current exercise
---

# /hint Command

This workflow provides hints without giving away the answer immediately.

## Steps for AI

1. **Context Analysis**
   - Identify the active exercise from `PROGRESS.md` or currently open file.
   - Read the `.rs` file content.

2. **Check for Errors**
   // turbo
   - Compile to check errors: `rustc <path_to_exercise.rs> --emit=metadata -o temp_check` (clean up temp file after)
   - OR run `cargo run -- run <exercise_name>` and capture compilation output.

3. **Determine Hint Level**
   - **Level 1 (First ask)**: Point to the general concept or specific line causing trouble. Do not show code fix.
   - **Level 2 (Second ask)**: Explain _why_ the error is happening using `AGENT.md` analogies. Suggest the specific function or method needed.
   - **Level 3 (Stuck)**: Provide a snippet of the solution, but ask the user to type it themselves.

4. **Response Format**
   - "💡 **Hint**: ..."
   - If compiler error: "Rust is complaining about X because Y..."
   - Link to relevant documentation if applicable.
