**Difficulty:** ⭐⭐

# Integer Overflow

## Description

Integers have fixed sizes. If you try to store a value larger than the maximum (or smaller than the minimum), it will cause an overflow.

The code below tries to store `300` in a `u8` variable, which can only hold up to `255`.

Your task is to change the type of `x` to something that can hold `300`, like `u16`.

## Hints

1. `u8` max is 255.

2. `u16` max is 65535.