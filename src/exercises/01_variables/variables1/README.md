**Difficulty:** ⭐

# Variables - Declaration

## Description

Rust is a statically typed language, ensuring type safety at compile time.

However, it also supports type inference, so you often don't need to specify types explicitly.

A fundamental rule in Rust is that every variable must be declared before it can be used.

To declare a variable, we use the `let` keyword.

Example:

```rust
let my_variable = 100;
```

The code below attempts to assign the value `5` to `x`, but `x` has not been introduced to the compiler properly.

Your task is to properly declare `x` using the `let` keyword so that the program can store the value `5` and print it.

## Hints

1. Use `let` followed by the variable name.

2. Ensure the variable is initialized with the value `5`.