# Module 04: Ownership

## ⚠️ CRITICAL MODULE ⚠️

This is the MOST IMPORTANT concept in Rust. The user MUST fully understand this before proceeding. Take extra time here. Create as many exercises as needed.

## Learning Objectives

### 1. The Ownership Rules

Three rules that govern Rust's memory management:

1. Each value has an **owner**
2. There can only be **one owner** at a time
3. When the owner goes out of scope, the value is **dropped**

### 2. Stack vs Heap

- Stack: fixed size, fast, automatic cleanup
- Heap: dynamic size, slower, requires explicit management (in other languages)
- How Rust handles both automatically

### 3. Move Semantics

- Assignment moves ownership for heap data
- Original variable becomes invalid
- Why this prevents double-free bugs
- `Copy` types (stack-only data) are copied, not moved

### 4. Clone

- Deep copy with `.clone()`
- When to use clone
- Performance implications

### 5. Ownership and Functions

- Passing values to functions moves ownership
- Returning values transfers ownership back
- Why this matters

### 6. References and Borrowing

- Immutable references: `&T`
- Mutable references: `&mut T`
- Borrowing rules:
  - Can have EITHER one mutable OR many immutable references
  - References must always be valid (no dangling)
- Reference scope (Non-Lexical Lifetimes - NLL)

### 7. The Borrow Checker

- How Rust enforces these rules at compile time
- Common borrow checker errors and how to fix them

### 8. Slices

- String slices: `&str`
- Array slices: `&[T]`
- Slices are references to a portion of data
- Relationship to ownership

---

## Exercise Guidelines

### Minimum Exercises Required

#### Ownership Basics (8-10 exercises)

1. **ownership1.rs** ⭐ - Simple move (String)
2. **ownership2.rs** ⭐ - Understand why a variable is invalid after move
3. **ownership3.rs** ⭐⭐ - Copy types vs Move types
4. **ownership4.rs** ⭐⭐ - Ownership and functions (passing)
5. **ownership5.rs** ⭐⭐ - Ownership and functions (returning)
6. **ownership6.rs** ⭐⭐⭐ - Multiple ownership transfers
7. **ownership7.rs** ⭐⭐⭐ - Clone vs Move
8. **ownership8.rs** ⭐⭐⭐ - Why Copy trait matters

#### Borrowing (8-10 exercises)

9. **borrowing1.rs** ⭐ - Basic immutable reference
10. **borrowing2.rs** ⭐ - Multiple immutable references
11. **borrowing3.rs** ⭐⭐ - Mutable reference
12. **borrowing4.rs** ⭐⭐ - Cannot have mutable and immutable at same time
13. **borrowing5.rs** ⭐⭐⭐ - Reference scope (NLL)
14. **borrowing6.rs** ⭐⭐⭐ - Borrowing in functions
15. **borrowing7.rs** ⭐⭐⭐ - Returning references (intro to lifetimes)
16. **borrowing8.rs** ⭐⭐⭐⭐ - Complex borrowing scenario

#### Slices (4-5 exercises)

17. **slices1.rs** ⭐ - String slices basics
18. **slices2.rs** ⭐⭐ - Array slices
19. **slices3.rs** ⭐⭐ - Slice methods
20. **slices4.rs** ⭐⭐⭐ - Slices and ownership
21. **slices5.rs** ⭐⭐⭐ - First word exercise (classic)

#### Combined Challenges

22. **ownership_quiz1.rs** ⭐⭐⭐⭐ - Track ownership through complex code
23. **ownership_quiz2.rs** ⭐⭐⭐⭐⭐ - Debug ownership errors in multi-function program

---

## Common Mistakes to Address

1. Using a value after it's been moved
2. Trying to modify through an immutable reference
3. Having mutable and immutable references at the same time
4. Creating dangling references
5. Confusing `String` (owned) vs `&str` (borrowed)
6. Forgetting that passing to a function is a move

---

## Key Analogies to Use

1. **Ownership = Owning a book**: You can give it away (move), but then you don't have it anymore
2. **Immutable borrow = Lending a book**: Others can read it, but can't write in it
3. **Mutable borrow = Lending with edit rights**: Only one person can have it at a time
4. **Clone = Photocopying**: Now there are two independent copies

---

## Visual Explanations

Draw ASCII diagrams showing:

- Variable pointing to heap data
- What happens during move
- Reference arrows vs ownership arrows
