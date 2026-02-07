**Difficulty:** ⭐

# Constants

## Description

Constants in Rust are values that are bound to a name and are not allowed to change.

They are similar to immutable variables, but with a few differences:

1. They are declared using `const` instead of `let`.

2. You MUST annotate the type of the value.

3. They can be set only to a constant expression, not the result of a value that could only be computed at runtime.

The code below tries to define a constant `NUMBER` but is missing its type annotation.

Your task is to add the correct type annotation to the constant declaration.

## Hints

1. The value `3` fits into an integer type like `i32`.

2. Syntax: `const NAME: TYPE = VALUE;`