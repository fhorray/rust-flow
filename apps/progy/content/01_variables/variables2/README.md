**Difficulty:** ⭐

# Variables - Mutability

## Description

In Rust, variables are immutable by default. This is a deliberate design choice to ensure safety and concurrency.

If a variable is immutable, once a value is bound to a name, you cannot change that value.

The code below tries to reassign `x` to `20`, but the compiler will reject this because `x` was not declared as mutable.

Your task is to modify the declaration of `x` using the `mut` keyword so that its value can be changed.

## Hints

1. The `mut` keyword must be placed after `let` and before the variable name.

2. Example: `let mut my_var = ...;`