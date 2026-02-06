# Module 01: Variables & Primitive Types

## Learning Objectives

The user must understand ALL of the following before moving to the next module:

### 1. Variable Declaration

- `let` keyword
- Immutability by default
- `let mut` for mutable variables
- Variable initialization requirement
- Shadowing (re-declaring with `let`)

### 2. Constants

- `const` keyword
- Naming convention (SCREAMING_SNAKE_CASE)
- Must have explicit type annotation
- Must be a constant expression (known at compile time)
- Difference between `const` and `let`

### 3. Scalar Types

#### 3.1 Integers

| Length  | Signed | Unsigned |
| ------- | ------ | -------- |
| 8-bit   | i8     | u8       |
| 16-bit  | i16    | u16      |
| 32-bit  | i32    | u32      |
| 64-bit  | i64    | u64      |
| 128-bit | i128   | u128     |
| arch    | isize  | usize    |

- Default is `i32`
- Signed vs unsigned
- Integer overflow (debug vs release)
- Numeric literals: decimal, hex (`0x`), octal (`0o`), binary (`0b`)
- Underscores for readability (`1_000_000`)

#### 3.2 Floating-Point

- `f32` (single precision)
- `f64` (double precision, default)
- IEEE-754 standard
- When to use each

#### 3.3 Boolean

- `bool` type
- `true` and `false` values
- Size: 1 byte
- Use in conditions

#### 3.4 Character

- `char` type
- Single quotes (`'a'`)
- Unicode scalar value (4 bytes)
- Difference from strings
- Emojis and special characters

### 4. Compound Types

#### 4.1 Tuples

- Fixed length, different types allowed
- Declaration: `let tup: (i32, f64, u8) = (500, 6.4, 1);`
- Accessing: dot notation (`tup.0`, `tup.1`)
- Destructuring: `let (x, y, z) = tup;`
- Unit type: `()` (empty tuple)

#### 4.2 Arrays

- Fixed length, same type required
- Declaration: `let arr: [i32; 5] = [1, 2, 3, 4, 5];`
- Initialize with same value: `let arr = [3; 5];` creates `[3, 3, 3, 3, 3]`
- Accessing: bracket notation (`arr[0]`)
- Out-of-bounds access (panic at runtime)
- Difference from Vec (covered later)

### 5. Type Casting

- `as` keyword
- Safe casts vs lossy casts
- Cannot cast between incompatible types

---

## Exercise Guidelines

### Minimum Exercises Required

Create AT LEAST the following exercises. Add more if the user struggles.

1. **variables1.rs** ⭐ - Fix immutability error
2. **variables2.rs** ⭐ - Fix uninitialized variable
3. **variables3.rs** ⭐⭐ - Shadowing basics
4. **variables4.rs** ⭐⭐ - Shadowing with type change
5. **constants1.rs** ⭐ - Fix constant declaration (missing type)
6. **constants2.rs** ⭐⭐ - Constants vs let (understand the difference)
7. **integers1.rs** ⭐ - Different integer types
8. **integers2.rs** ⭐⭐ - Signed vs unsigned, overflow scenario
9. **integers3.rs** ⭐⭐ - Numeric literals (hex, binary, octal)
10. **floats1.rs** ⭐ - f32 vs f64
11. **floats2.rs** ⭐⭐ - Precision and comparison issues
12. **booleans1.rs** ⭐ - Basic boolean operations
13. **booleans2.rs** ⭐⭐ - Boolean logic (AND, OR, NOT)
14. **chars1.rs** ⭐ - Char basics
15. **chars2.rs** ⭐⭐ - Unicode and emojis
16. **tuples1.rs** ⭐ - Create and access tuple
17. **tuples2.rs** ⭐⭐ - Destructuring
18. **tuples3.rs** ⭐⭐⭐ - Nested tuples, return tuples from functions
19. **arrays1.rs** ⭐ - Create and access array
20. **arrays2.rs** ⭐⭐ - Initialize array with same value
21. **arrays3.rs** ⭐⭐⭐ - Array bounds and iteration
22. **casting1.rs** ⭐⭐ - Basic type casting
23. **casting2.rs** ⭐⭐⭐ - Lossy casts and understanding truncation
24. **primitive_types_quiz.rs** ⭐⭐⭐⭐ - Combine all concepts

---

## Common Mistakes to Address

1. Trying to reassign an immutable variable
2. Using a variable before initializing it
3. Forgetting type annotation on constants
4. Comparing different numeric types without casting
5. Confusing `char` with `&str`
6. Array index out of bounds
7. Expecting arrays to be dynamically sized

---

## Challenge Ideas

- Create a function that returns multiple values using a tuple
- Work with different integer sizes and observe truncation
- Build a simple calculator that handles different numeric types
