# Module 11: Lifetimes

## ⚠️ CHALLENGING MODULE ⚠️

Lifetimes are typically the hardest concept for newcomers. Take time here.

## Learning Objectives

### 1. What Are Lifetimes?

- Every reference has a lifetime
- Lifetimes ensure references are valid
- The borrow checker uses lifetimes
- Usually inferred, sometimes explicit

### 2. Lifetime Annotations

- Syntax: `'a`, `'b`, etc.
- They describe relationships, not durations
- Lifetime parameters on functions
- Connecting input and output lifetimes

### 3. Lifetime Elision Rules

- Rust's inference rules
- When you don't need to write lifetimes
- The three elision rules
- When elision fails

### 4. Lifetimes in Structs

- Structs holding references
- All references need lifetime annotation
- Lifetime bounds on structs

### 5. Lifetime in impl Blocks

- Methods with lifetime parameters
- Relating struct lifetime to method return

### 6. Static Lifetime

- `'static` meaning
- String literals are `'static`
- When to use (and not overuse)

### 7. Advanced Lifetimes

- Multiple lifetime parameters
- Lifetime subtyping (`'a: 'b`)
- Higher-ranked trait bounds (HRTB) - intro only

---

## Exercise Guidelines

### Minimum Exercises Required

1. **lifetimes1.rs** ⭐⭐ - Understand dangling reference error
2. **lifetimes2.rs** ⭐⭐ - Add lifetime annotation to function
3. **lifetimes3.rs** ⭐⭐⭐ - Function returning reference with lifetime
4. **lifetimes4.rs** ⭐⭐⭐ - Multiple input lifetimes
5. **lifetimes5.rs** ⭐⭐⭐ - Struct with lifetime
6. **lifetimes6.rs** ⭐⭐⭐ - Methods on struct with lifetime
7. **lifetimes7.rs** ⭐⭐⭐⭐ - Static lifetime
8. **lifetimes8.rs** ⭐⭐⭐⭐ - Lifetime elision in practice
9. **lifetimes9.rs** ⭐⭐⭐⭐⭐ - Complex lifetime scenario
10. **lifetimes_quiz.rs** ⭐⭐⭐⭐⭐ - Debug lifetime errors in multi-function code

---

## Common Mistakes to Address

1. Thinking lifetimes extend how long data lives
2. Returning reference to local variable
3. Overannotating when elision would work
4. Confusion about 'static meaning eternal
