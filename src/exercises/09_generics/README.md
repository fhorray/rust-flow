# Module 09: Generics

## Learning Objectives

### 1. Why Generics?

- Code reuse without duplication
- Type safety with flexibility
- Zero-cost abstraction (monomorphization)

### 2. Generic Functions

- Type parameter syntax `<T>`
- Multiple type parameters `<T, U>`
- Using generic types in parameters
- Using generic types in return

### 3. Generic Structs

- Struct with type parameter
- Multiple type parameters
- Methods on generic structs
- Different impls for specific types

### 4. Generic Enums

- Option<T> as example
- Result<T, E> as example
- Custom generic enums

### 5. Trait Bounds

- Constraining generic types
- `T: Trait` syntax
- Multiple bounds with `+`
- `where` clauses for readability
- Default type parameters

### 6. Monomorphization

- How Rust compiles generics
- No runtime cost
- Potential binary size increase

---

## Exercise Guidelines

### Minimum Exercises Required

1. **generics1.rs** ⭐ - Simple generic function
2. **generics2.rs** ⭐⭐ - Generic function with multiple types
3. **generics3.rs** ⭐⭐ - Generic struct
4. **generics4.rs** ⭐⭐⭐ - Methods on generic struct
5. **generics5.rs** ⭐⭐⭐ - Generic enum
6. **generics6.rs** ⭐⭐⭐ - Trait bounds intro
7. **generics7.rs** ⭐⭐⭐ - Multiple trait bounds
8. **generics8.rs** ⭐⭐⭐⭐ - where clause
9. **generics9.rs** ⭐⭐⭐⭐ - Implement generic data structure (basic)
10. **generics_quiz.rs** ⭐⭐⭐⭐⭐ - Build a generic Stack or Queue

---

## Common Mistakes to Address

1. Overusing generics when concrete types would suffice
2. Forgetting trait bounds when needed
3. Confusing generic types with trait objects
