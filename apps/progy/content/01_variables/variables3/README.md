**Difficulty:** ⭐⭐

# Variables - Scope

## Description

Variables in Rust are valid only within the "scope" where they are declared.

A scope usually begins with a curly brace `{` and ends with a closing curly brace `}`.

When a variable goes out of scope, it is dropped and cannot be accessed anymore.

The variable `x` is defined inside an inner block (a new scope), but the code attempts to access it in the outer block.

Your task is to fix the code so that `x` is accessible where it is used in the `println!` statement outside the block.

## Hints

1. You can verify where `x` is declared.

2. Consider declaring `x` before the inner block starts.