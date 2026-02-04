---
description: Stop tracking time and mark exercise as complete
---

# /done Command

This command stops the timer and records the exercise completion.

## Usage

```
/done
```

Or with optional notes:

```
/done [notes]
```

Example: `/done struggled with shadowing concept`

## Steps for AI

1. Read `PROGRESS.md` and get the active session info

2. If no active session:

   ```
   ⚠️ No active exercise timer. Use `/start <exercise>` first.
   ```

3. Calculate duration:
   - Get `started_at` from Active Session
   - Calculate difference to current time
   - Format as minutes (e.g., "14 min" or "1h 23min")

4. Update `PROGRESS.md`:

   a. **Reset Active Session**:

   ```json
   {
     "active": false,
     "exercise": null,
     "started_at": null
   }
   ```

   b. **Add to Completed Exercises table**:

   ```markdown
   | <exercise> | <module> | HH:MM | HH:MM | X min | 1 |
   ```

   c. **Update Statistics**:
   - Increment Total Exercises Completed
   - Add duration to Total Time Spent
   - Recalculate Average Time per Exercise

   d. **Update Weekly Progress**:
   - Find the correct module row
   - Increment exercises count (e.g., 0/24 → 1/24)
   - Add time to Time Spent
   - Change status to 🟡 if first exercise, ✅ if all done

5. Run `cargo run -- run <exercise>` to verify it compiles

6. If it compiles successfully:

   ```
   ✅ Exercise `<exercise>` completed!

   ⏱️ Time: X min
   📊 Total exercises: Y completed
   📈 Average time: Z min/exercise

   Ready for the next exercise? Ask me to create one!
   ```

7. If it doesn't compile:

   ```
   ⚠️ Exercise `<exercise>` has compilation errors.
   Time recorded: X min

   Would you like help fixing the errors?
   ```

8. Read the module's README.md and suggest the next exercise in sequence
