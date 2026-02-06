# Module 17: Macros

## Learning Objectives

### 1. Declarative Macros (macro_rules!)

- What are macros
- Difference from functions
- `macro_rules!` syntax
- Patterns and matchers
- Repetition operators (`*`, `+`, `?`)
- Fragment specifiers (expr, ident, ty, etc.)
- Hygiene

### 2. Common Standard Macros

- `println!`, `print!`, `format!`
- `vec!`
- `assert!`, `assert_eq!`
- `panic!`
- `todo!`, `unimplemented!`, `unreachable!`
- `dbg!`
- `include_str!`, `include_bytes!`
- `cfg!`

### 3. Procedural Macros (Overview)

- Three types:
  - Derive macros
  - Attribute macros
  - Function-like macros
- Brief introduction (actual implementation is advanced)
- Using derive macros from crates

### 4. When to Use Macros

- Code generation
- DSLs
- Reducing boilerplate
- When NOT to use macros

---

## Exercise Guidelines

### Minimum Exercises Required

1. **macros1.rs** ⭐ - Use common macros
2. **macros2.rs** ⭐⭐ - Simple macro_rules!
3. **macros3.rs** ⭐⭐⭐ - Macro with repetition
4. **macros4.rs** ⭐⭐⭐ - Macro with multiple patterns
5. **macros5.rs** ⭐⭐⭐⭐ - Build a vec! like macro
6. **macros6.rs** ⭐⭐⭐⭐ - Understanding hygiene
7. **macros_quiz.rs** ⭐⭐⭐⭐⭐ - Create a custom assert macro
