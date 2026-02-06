**Difficulty:** ⭐⭐⭐

# Type Casting - Truncation

## Description

Casting a larger integer type to a smaller one (e.g. `u16` to `u8`) will truncate the value.

This means you lose data!

The code below casts `1000` (which fits in `u16`) to `u8` (which maxes at 255).

Your task is to:

1. Run the code and observe the result.

2. Modify the value of `big_n` so that it fits into `u8` without losing data (e.g., make it 255 or less).