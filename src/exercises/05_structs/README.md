# Module 05: Structs

## Learning Objectives

### 1. Struct Definition

- Keyword `struct`
- Named fields
- Naming convention (PascalCase)

### 2. Struct Instantiation

- Creating instances
- Field init shorthand (when variable name = field name)
- Struct update syntax (`..other_instance`)

### 3. Struct Types

- Classic structs (named fields)
- Tuple structs (unnamed fields, useful for newtypes)
- Unit-like structs (no fields, useful for traits)

### 4. Ownership in Structs

- Structs can own their data
- Using references in structs (requires lifetimes)
- When to use String vs &str in structs

### 5. Methods (impl blocks)

- `impl` keyword
- `self`, `&self`, `&mut self`
- Associated functions (no self, like constructors)
- Multiple impl blocks
- Method chaining

### 6. Derived Traits for Structs

- `#[derive(Debug)]`
- `#[derive(Clone)]`
- `#[derive(PartialEq)]`
- Custom Display implementation

---

## Exercise Guidelines

### Minimum Exercises Required

1. **structs1.rs** ⭐ - Define and instantiate a struct
2. **structs2.rs** ⭐ - Access struct fields
3. **structs3.rs** ⭐⭐ - Mutable struct (modify fields)
4. **structs4.rs** ⭐⭐ - Field init shorthand
5. **structs5.rs** ⭐⭐ - Struct update syntax
6. **structs6.rs** ⭐⭐ - Tuple structs
7. **structs7.rs** ⭐⭐⭐ - Unit-like structs
8. **methods1.rs** ⭐⭐ - Basic method with &self
9. **methods2.rs** ⭐⭐ - Method with &mut self
10. **methods3.rs** ⭐⭐⭐ - Method with parameters
11. **methods4.rs** ⭐⭐⭐ - Associated function (constructor pattern)
12. **methods5.rs** ⭐⭐⭐ - Method returning Self
13. **methods6.rs** ⭐⭐⭐⭐ - Builder pattern intro
14. **structs_quiz.rs** ⭐⭐⭐⭐ - Build a complete struct with multiple methods

---

## Common Mistakes to Address

1. Forgetting `mut` to modify struct fields
2. Trying to use struct after partial move
3. Confusing `self` vs `&self` vs `&mut self`
4. Returning struct without all fields initialized
