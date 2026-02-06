**Difficulty:** ⭐⭐

# Type Casting

## Description

Rust does not perform implicit type conversion (coercion) between primitive types (e.g. `u8` to `u32`).

You must use the `as` keyword to cast explicitly.

The code below tries to add a float `x` and an integer `y`. This fails.

Your task is to cast `x` to an integer (`i32`) so they can be added.