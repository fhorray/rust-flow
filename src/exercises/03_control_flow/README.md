# Module 03: Control Flow

## Learning Objectives

### 1. Conditional Expressions

#### 1.1 if/else

- Basic `if` syntax
- `else` and `else if`
- Condition must be `bool` (no truthy/falsy)
- `if` as an expression (returning values)
- Arms must return same type

#### 1.2 if let

- Destructuring with `if let`
- When to use vs `match`

### 2. Loops

#### 2.1 loop (Infinite Loop)

- `loop` keyword
- `break` to exit
- `break` with value (loop as expression)
- `continue` to skip iteration

#### 2.2 while Loop

- Condition-based loop
- Difference from `loop`

#### 2.3 for Loop

- Iterating over ranges (`0..10`, `0..=10`)
- Iterating over collections
- `enumerate()` for index + value
- `iter()`, `iter_mut()`, `into_iter()`
- `rev()` for reverse iteration

#### 2.4 Loop Labels

- Named loops with `'label:`
- Breaking outer loops
- Continuing outer loops

### 3. Pattern Matching

#### 3.1 match Expression

- Basic `match` syntax
- Arms and patterns
- `_` wildcard
- Must be exhaustive
- `match` as expression

#### 3.2 Pattern Types

- Literal patterns
- Variable binding
- Multiple patterns with `|`
- Range patterns (`1..=5`)
- Destructuring in patterns
- Match guards (`if` conditions)

---

## Exercise Guidelines

### Minimum Exercises Required

#### if/else (5-7 exercises)

1. **if1.rs** ⭐ - Basic if/else
2. **if2.rs** ⭐ - Multiple conditions (else if)
3. **if3.rs** ⭐⭐ - if as expression (assign result to variable)
4. **if4.rs** ⭐⭐ - Mismatched types in if arms
5. **if5.rs** ⭐⭐⭐ - Complex nested conditions
6. **if_let1.rs** ⭐⭐ - Basic if let
7. **if_let2.rs** ⭐⭐⭐ - if let with else

#### loops (8-10 exercises)

8. **loop1.rs** ⭐ - Basic infinite loop with break
9. **loop2.rs** ⭐⭐ - Loop returning a value
10. **loop3.rs** ⭐⭐ - Nested loops
11. **loop4.rs** ⭐⭐⭐ - Loop labels (break outer loop)
12. **while1.rs** ⭐ - Basic while loop
13. **while2.rs** ⭐⭐ - While with complex condition
14. **for1.rs** ⭐ - For loop with range
15. **for2.rs** ⭐⭐ - For loop with enumerate
16. **for3.rs** ⭐⭐ - For loop with iter() on array
17. **for4.rs** ⭐⭐⭐ - Mutable iteration with iter_mut()

#### match (6-8 exercises)

18. **match1.rs** ⭐ - Basic match expression
19. **match2.rs** ⭐⭐ - Match with multiple patterns (|)
20. **match3.rs** ⭐⭐ - Match with ranges
21. **match4.rs** ⭐⭐⭐ - Match as expression (return value)
22. **match5.rs** ⭐⭐⭐ - Match with destructuring
23. **match6.rs** ⭐⭐⭐ - Match guards
24. **match7.rs** ⭐⭐⭐⭐ - Exhaustive matching (why it matters)

#### Combined (2-3 exercises)

25. **control_flow_quiz1.rs** ⭐⭐⭐⭐ - FizzBuzz implementation
26. **control_flow_quiz2.rs** ⭐⭐⭐⭐⭐ - Simple state machine with match

---

## Common Mistakes to Address

1. Using non-bool condition in `if`
2. Returning different types from if/else arms
3. Forgetting `break` in `loop`
4. Non-exhaustive `match`
5. Confusing `..` (exclusive) and `..=` (inclusive) ranges
6. Modifying collection while iterating

---

## Key Points to Emphasize

- Control flow constructs are expressions in Rust
- Pattern matching is very powerful (will be used extensively with enums)
- Rust forces exhaustive matching for safety
