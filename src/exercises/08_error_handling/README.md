# Module 08: Error Handling

## Learning Objectives

### 1. Unrecoverable Errors (panic!)

- When to use panic!
- `panic!` macro
- Backtraces (`RUST_BACKTRACE=1`)
- `unwrap()` and `expect()` as controlled panics

### 2. Recoverable Errors (Result)

- `Result<T, E>` enum review
- Matching on Result
- Shortcut methods

### 3. The ? Operator

- Propagating errors concisely
- Works with Result and Option
- Early return on error
- Must return compatible type

### 4. Custom Error Types

- Creating error enums
- Implementing `std::error::Error`
- Implementing `Display` and `Debug`
- `From` trait for error conversion

### 5. Error Handling Patterns

- When to panic vs return Result
- Application vs library code
- `unwrap()` in main() or tests
- The `anyhow` pattern (brief intro)
- The `thiserror` pattern (brief intro)

### 6. Multiple Error Types

- `Box<dyn Error>` (simple approach)
- Custom Result type alias
- Converting between error types

---

## Exercise Guidelines

### Minimum Exercises Required

1. **errors1.rs** ⭐ - Handle a Result with match
2. **errors2.rs** ⭐⭐ - Use the ? operator
3. **errors3.rs** ⭐⭐ - Propagate errors from function
4. **errors4.rs** ⭐⭐⭐ - Return Result from main
5. **errors5.rs** ⭐⭐⭐ - Create a custom error enum
6. **errors6.rs** ⭐⭐⭐ - Implement Display for custom error
7. **errors7.rs** ⭐⭐⭐⭐ - Convert between error types with From
8. **errors8.rs** ⭐⭐⭐⭐ - Handle multiple error types
9. **errors9.rs** ⭐⭐⭐⭐ - Box<dyn Error> pattern
10. **errors_quiz.rs** ⭐⭐⭐⭐⭐ - Build robust file reading function with complete error handling

---

## Common Mistakes to Address

1. Using unwrap() in production code
2. Not propagating errors (swallowing them)
3. Returning wrong error type
4. Overly generic error messages
