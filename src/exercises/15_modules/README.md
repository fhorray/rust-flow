# Module 15: Modules & Packages

## Learning Objectives

### 1. Modules

- `mod` keyword
- Inline modules
- File modules (same name as module)
- Directory modules (mod.rs or name/mod.rs)
- Nested modules

### 2. Visibility

- Private by default
- `pub` keyword
- `pub(crate)` - crate-visible
- `pub(super)` - parent-visible
- `pub(in path)` - path-visible

### 3. Use Keyword

- Bringing items into scope
- `use` paths
- `use ... as` for renaming
- Nested paths `use std::{io, fs}`
- Glob operator `*`

### 4. Re-exporting

- `pub use`
- Creating public API
- Hiding implementation details

### 5. Crates

- Binary vs Library crates
- Crate root (main.rs or lib.rs)
- Multiple binaries

### 6. Packages

- Cargo.toml
- Dependencies
- Dev dependencies
- Build dependencies
- Features

### 7. Workspaces

- Multiple packages
- Shared dependencies
- When to use

---

## Exercise Guidelines

### Minimum Exercises Required

1. **modules1.rs** ⭐ - Basic module
2. **modules2.rs** ⭐⭐ - Nested modules
3. **modules3.rs** ⭐⭐ - Public items
4. **modules4.rs** ⭐⭐⭐ - Use keyword
5. **modules5.rs** ⭐⭐⭐ - Re-exporting
6. **modules6.rs** ⭐⭐⭐ - File modules
7. **modules7.rs** ⭐⭐⭐⭐ - Directory modules
8. **modules8.rs** ⭐⭐⭐⭐ - Visibility modifiers
9. **modules_quiz.rs** ⭐⭐⭐⭐⭐ - Organize a multi-module project

---

## Note for AI

For this module, some exercises may require creating multiple files. Guide the user through project structure.
