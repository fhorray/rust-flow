---
description: Automatically setup and start the next exercise
---

# /next Command

This workflow automates the transition to the next exercise.

## Steps for AI

1. **Analyze Progress**
   - Read `PROGRESS.md` to find the last completed exercise.
   - Determine the module and the next exercise number.
   - If starting a new module, read the module's `README.md` first.

2. **Create Exercise File**
   - Generate the content for the new exercise `.rs` file based on the module's `README.md` instructions and the standard template in `AGENT.md`.
   - **IMPORTANT**: Do not ask for confirmation, just create the file.

3. **Start Timer**
   - Invoke the `/start` command for the new exercise.
   - Example: "Calling /start <new_exercise_name>"

4. **Verify Environment**
   - **Verify creation**: Ensure the file exists. Do NOT add to Cargo.toml or run cargo check.

5. **Handover**
   - Present the new file to the user.
   - Give a brief introduction to the concept being practiced.
   - motivating message: "All set! Time to practice <concept>. Go!"
