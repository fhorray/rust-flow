# Module 18: Unsafe Rust

## ⚠️ CAUTION ⚠️

Unsafe code should be used sparingly and with great care.

## Learning Objectives

### 1. What is Unsafe?

- Unsafe superpowers
- When it's needed
- Safe abstractions over unsafe

### 2. Unsafe Operations

- Dereference raw pointers
- Call unsafe functions
- Access mutable static variables
- Implement unsafe traits
- Access fields of unions

### 3. Raw Pointers

- `*const T` and `*mut T`
- Creating from references
- Dangling pointers
- Null pointers

### 4. Unsafe Functions

- `unsafe fn`
- Calling unsafe functions
- Documenting safety requirements

### 5. Unsafe Traits

- When traits are unsafe
- `Send` and `Sync` as examples
- Implementing unsafe traits

### 6. FFI (Foreign Function Interface)

- Calling C from Rust
- `extern "C"`
- Linking to C libraries
- Safety considerations

### 7. Best Practices

- Minimize unsafe blocks
- Document invariants
- Safe wrappers

---

## Exercise Guidelines

### Minimum Exercises Required

1. **unsafe1.rs** ⭐⭐ - Raw pointer creation
2. **unsafe2.rs** ⭐⭐⭐ - Dereference raw pointer
3. **unsafe3.rs** ⭐⭐⭐ - Unsafe function
4. **unsafe4.rs** ⭐⭐⭐⭐ - Mutable static
5. **unsafe5.rs** ⭐⭐⭐⭐ - Safe abstraction
6. **unsafe_quiz.rs** ⭐⭐⭐⭐⭐ - Implement a simple unsafe data structure
