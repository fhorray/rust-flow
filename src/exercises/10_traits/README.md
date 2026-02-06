# Module 10: Traits

## ⚠️ VERY IMPORTANT MODULE ⚠️

Traits are fundamental to Rust's power and flexibility. Master them well.

## Learning Objectives

### 1. Defining Traits

- `trait` keyword
- Method signatures
- Associated functions
- Default implementations
- Associated types (intro)
- Associated constants

### 2. Implementing Traits

- `impl Trait for Type`
- Orphan rule (coherence)
- Implementing standard library traits
- Implementing external traits for local types
- Implementing local traits for external types

### 3. Traits as Parameters

- `impl Trait` syntax
- Trait bounds syntax `<T: Trait>`
- Multiple bounds `<T: Trait1 + Trait2>`
- `where` clause

### 4. Traits as Return Types

- `-> impl Trait`
- Limitations (single concrete type)
- When to use

### 5. Trait Objects

- `dyn Trait`
- Dynamic dispatch vs static dispatch
- Object safety rules
- `Box<dyn Trait>`
- Performance implications

### 6. Standard Library Traits

Must know these traits:

- **Debug**: Development printing
- **Display**: User-facing printing
- **Clone**: Explicit deep copy
- **Copy**: Implicit copy (stack only)
- **Default**: Default values
- **PartialEq, Eq**: Equality comparison
- **PartialOrd, Ord**: Ordering comparison
- **Hash**: Hashing (for HashMap keys)
- **From, Into**: Type conversion
- **TryFrom, TryInto**: Fallible conversion
- **AsRef, AsMut**: Cheap reference conversions
- **Deref, DerefMut**: Smart pointer dereferencing
- **Drop**: Destructor
- **Iterator**: Iteration
- **Send, Sync**: Thread safety markers

### 7. Advanced Trait Concepts

- Supertraits (trait inheritance)
- Blanket implementations
- Marker traits
- Extension traits

---

## Exercise Guidelines

### Minimum Exercises Required

#### Basic Traits (8-10 exercises)

1. **traits1.rs** ⭐ - Define a simple trait
2. **traits2.rs** ⭐⭐ - Implement trait for a struct
3. **traits3.rs** ⭐⭐ - Default trait implementation
4. **traits4.rs** ⭐⭐⭐ - Trait with multiple methods
5. **traits5.rs** ⭐⭐⭐ - Trait as parameter (impl Trait)
6. **traits6.rs** ⭐⭐⭐ - Trait bounds with generics
7. **traits7.rs** ⭐⭐⭐ - Multiple trait bounds
8. **traits8.rs** ⭐⭐⭐⭐ - Returning impl Trait

#### Trait Objects (4-5 exercises)

9. **trait_objects1.rs** ⭐⭐⭐ - Basic trait object
10. **trait_objects2.rs** ⭐⭐⭐ - Vector of trait objects
11. **trait_objects3.rs** ⭐⭐⭐⭐ - Object safety
12. **trait_objects4.rs** ⭐⭐⭐⭐ - Static vs dynamic dispatch comparison

#### Standard Library Traits (10-12 exercises)

13. **std_traits1.rs** ⭐⭐ - Derive Debug
14. **std_traits2.rs** ⭐⭐⭐ - Implement Display
15. **std_traits3.rs** ⭐⭐ - Clone and Copy
16. **std_traits4.rs** ⭐⭐⭐ - Default
17. **std_traits5.rs** ⭐⭐⭐ - PartialEq
18. **std_traits6.rs** ⭐⭐⭐ - PartialOrd
19. **std_traits7.rs** ⭐⭐⭐⭐ - From and Into
20. **std_traits8.rs** ⭐⭐⭐⭐ - TryFrom and TryInto
21. **std_traits9.rs** ⭐⭐⭐⭐ - AsRef
22. **std_traits10.rs** ⭐⭐⭐⭐⭐ - Implement Iterator

#### Advanced (3-4 exercises)

23. **traits_advanced1.rs** ⭐⭐⭐⭐ - Supertraits
24. **traits_advanced2.rs** ⭐⭐⭐⭐⭐ - Blanket implementation
25. **traits_quiz.rs** ⭐⭐⭐⭐⭐ - Build a plugin system using traits

---

## Common Mistakes to Address

1. Violating the orphan rule
2. Expecting trait objects to work like generics
3. Confusing impl Trait vs dyn Trait
4. Forgetting that Copy implies Clone
5. Not implementing enough traits for a type to be useful
