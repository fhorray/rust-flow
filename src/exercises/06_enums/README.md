# Module 06: Enums & Pattern Matching

## Learning Objectives

### 1. Enum Definition

- `enum` keyword
- Variants
- Naming convention

### 2. Enums with Data

- Variants with no data
- Variants with unnamed data (tuple-like)
- Variants with named data (struct-like)
- Different variants can have different data

### 3. Option<T>

- Definition: `Some(T)` or `None`
- Why Rust doesn't have null
- Common methods: `unwrap()`, `expect()`, `is_some()`, `is_none()`
- Safe methods: `unwrap_or()`, `unwrap_or_else()`, `map()`, `and_then()`
- The `?` operator with Option

### 4. Result<T, E>

- Definition: `Ok(T)` or `Err(E)`
- Error handling in Rust
- Common methods: `unwrap()`, `expect()`, `is_ok()`, `is_err()`
- Safe methods: `unwrap_or()`, `map()`, `map_err()`, `and_then()`
- The `?` operator with Result
- Propagating errors

### 5. Pattern Matching with Enums

- Matching all variants
- Extracting data from variants
- Nested matching
- Combining with match guards

### 6. if let and while let

- Concise alternative to match
- When to use each

---

## Exercise Guidelines

### Minimum Exercises Required

#### Basic Enums (5-6 exercises)

1. **enums1.rs** ⭐ - Define and use a simple enum
2. **enums2.rs** ⭐⭐ - Enum with data
3. **enums3.rs** ⭐⭐ - Enum with different data types per variant
4. **enums4.rs** ⭐⭐⭐ - Methods on enums
5. **enums5.rs** ⭐⭐⭐ - Matching on enum variants

#### Option<T> (6-8 exercises)

6. **option1.rs** ⭐ - Basic Some and None
7. **option2.rs** ⭐⭐ - Matching on Option
8. **option3.rs** ⭐⭐ - unwrap and expect (and why they're dangerous)
9. **option4.rs** ⭐⭐⭐ - Safe unwrapping (unwrap_or, unwrap_or_else)
10. **option5.rs** ⭐⭐⭐ - map() and and_then()
11. **option6.rs** ⭐⭐⭐ - Option in function returns
12. **option7.rs** ⭐⭐⭐⭐ - Chaining Option operations

#### Result<T, E> (6-8 exercises)

13. **result1.rs** ⭐ - Basic Ok and Err
14. **result2.rs** ⭐⭐ - Matching on Result
15. **result3.rs** ⭐⭐ - The ? operator
16. **result4.rs** ⭐⭐⭐ - Propagating errors
17. **result5.rs** ⭐⭐⭐ - Custom error types (intro)
18. **result6.rs** ⭐⭐⭐⭐ - Converting between error types
19. **result7.rs** ⭐⭐⭐⭐ - Result and Option together

#### if let / while let (3-4 exercises)

20. **if_let1.rs** ⭐⭐ - Basic if let
21. **if_let2.rs** ⭐⭐⭐ - if let with else
22. **while_let1.rs** ⭐⭐⭐ - while let loop

#### Combined

23. **enums_quiz.rs** ⭐⭐⭐⭐⭐ - Build a state machine with enums

---

## Common Mistakes to Address

1. Non-exhaustive matching
2. Using unwrap() without checking
3. Forgetting to handle the None/Err case
4. Not understanding that Option/Result are just enums
