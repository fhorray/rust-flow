# Module 16: Testing

## Learning Objectives

### 1. Unit Tests

- `#[test]` attribute
- `#[cfg(test)]` module
- `assert!`, `assert_eq!`, `assert_ne!`
- Custom failure messages
- `#[should_panic]`
- `#[should_panic(expected = "...")]`
- Result<T, E> in tests
- `#[ignore]`

### 2. Running Tests

- `cargo test`
- Running specific tests
- Running ignored tests
- Controlling threads
- Capturing output

### 3. Test Organization

- Tests in same file
- Tests module convention
- Testing private functions

### 4. Integration Tests

- `tests/` directory
- Testing public API
- Shared setup code
- `tests/common/mod.rs`

### 5. Documentation Tests

- Examples in doc comments
- `# ` to hide lines
- `no_run` and `ignore` annotations
- `compile_fail` annotation

### 6. Test Utilities

- Test fixtures
- Mocking strategies
- Property-based testing (proptest)

---

## Exercise Guidelines

### Minimum Exercises Required

1. **tests1.rs** ⭐ - Write a basic test
2. **tests2.rs** ⭐⭐ - Test with assert_eq!
3. **tests3.rs** ⭐⭐ - Test expected panic
4. **tests4.rs** ⭐⭐⭐ - Test returning Result
5. **tests5.rs** ⭐⭐⭐ - Custom failure message
6. **tests6.rs** ⭐⭐⭐ - Testing private functions
7. **tests7.rs** ⭐⭐⭐⭐ - Test organization
8. **tests_quiz.rs** ⭐⭐⭐⭐⭐ - Write comprehensive tests for a module
