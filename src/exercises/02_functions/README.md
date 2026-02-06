# Module 02: Functions

## Learning Objectives

### 1. Function Basics

- `fn` keyword
- Function naming convention (snake_case)
- Function body with curly braces
- Calling functions

### 2. Parameters

- Parameter declaration with explicit types
- Multiple parameters
- Order of parameters matters
- Pass by value vs pass by reference (intro)

### 3. Return Values

- `->` syntax for return type
- Implicit return (expression without semicolon)
- Explicit `return` keyword
- Early return
- Unit type `()` (no return value)

### 4. Statements vs Expressions

- Statements: perform action, don't return value
- Expressions: evaluate to a value
- Semicolon turns expression into statement
- Block expressions `{ }`

### 5. Function Scope

- Variables inside functions are local
- Functions can be defined anywhere in the file
- Forward declarations not needed

---

## Exercise Guidelines

### Minimum Exercises Required

1. **functions1.rs** ⭐ - Call a simple function
2. **functions2.rs** ⭐ - Function with parameters (fix missing types)
3. **functions3.rs** ⭐⭐ - Multiple parameters
4. **functions4.rs** ⭐ - Return type (fix missing return type)
5. **functions5.rs** ⭐⭐ - Implicit return (remove semicolon)
6. **functions6.rs** ⭐⭐ - Explicit return keyword
7. **functions7.rs** ⭐⭐ - Early return
8. **functions8.rs** ⭐⭐⭐ - Expressions vs statements
9. **functions9.rs** ⭐⭐⭐ - Block expressions returning values
10. **functions10.rs** ⭐⭐⭐ - Function returning tuple
11. **functions11.rs** ⭐⭐⭐ - Nested function calls
12. **functions_quiz.rs** ⭐⭐⭐⭐ - Combine all concepts (build a mini calculator)

---

## Common Mistakes to Address

1. Forgetting type annotations on parameters
2. Forgetting return type annotation
3. Adding semicolon when trying to implicitly return
4. Misunderstanding expression vs statement
5. Returning wrong type

---

## Key Points to Emphasize

- Rust is an expression-based language
- The last expression in a function is automatically returned (if no semicolon)
- Type checking is strict - return type must match exactly
