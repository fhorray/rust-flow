# /advance Command

This workflow combines running the current exercise, verifying its correctness against specific guidelines, and if approved, moving to the next exercise.

## Steps for AI

1. **Identify Exercise**
   - Check `PROGRESS.md` for the active exercise.
   - If no active exercise, abort and tell the user to `/start` one.

2. **Read "Check" Guidelines**
   - Read the `.rs` file for the current exercise.
   - Look for comments starting with `// Check:` or `// Validation:`.
   - If guidelines exist, note them. If not, rely on standard compilation + output correctness (no "I AM NOT DONE", output matches expectation).

3. **Run and Verification**
   // turbo
   - Run `cargo run -- run <exercise_name>`
   - **Verification Logic**:
     - **Compilation**: Must succeed.
     - **Output**: Must match the `// Expected Output:` in the file.
     - **Directives**: Must satisfy any `// Check:` conditions found in step 2.
     - **Anti-Hallucination**: ensure the user _actually_ wrote code. If the file is identical to the template (unmodified), reject it.

4. **Decision**
   - **If Approved**:
     - Run `/done` (simulate key steps: update progress, stats).
     - Run `/next` (simulate key steps: find next, create file, start timer).
     - output: "✅ Exercise passed checks! Moving to next..."
   - **If Rejected**:
     - Explain _specifically_ why.
     - "❌ output did not match expected" OR "❌ Missing required validation: <condition>"
     - Do NOT run `/done`. Do NOT run `/next`.

## usage

User types `/advance` to attempt to move forward.
