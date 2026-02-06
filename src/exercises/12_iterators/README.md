# Module 12: Iterators & Closures

## Learning Objectives

### 1. Closures

#### 1.1 Closure Basics

- Anonymous functions
- Syntax: `|params| expression`
- Type inference in closures
- Explicit type annotations

#### 1.2 Capturing Environment

- Closures can capture variables from scope
- Three capture modes:
  - `Fn`: borrow immutably
  - `FnMut`: borrow mutably
  - `FnOnce`: take ownership
- `move` keyword

#### 1.3 Closures as Parameters

- `impl Fn(T) -> U`
- Generic with trait bounds
- When to use each Fn trait

#### 1.4 Closures as Return Types

- `impl Fn` return
- Must use `move` when returning

### 2. Iterators

#### 2.1 Iterator Trait

- `next()` method
- Associated type `Item`
- Built-in iterator methods

#### 2.2 Creating Iterators

- `iter()` - borrows
- `iter_mut()` - mutable borrows
- `into_iter()` - takes ownership

#### 2.3 Iterator Adaptors (Lazy)

- `map()` - transform items
- `filter()` - keep matching items
- `flat_map()` - flatten nested
- `take()` - limit items
- `skip()` - skip items
- `zip()` - pair iterators
- `enumerate()` - add index
- `chain()` - concatenate
- `peekable()` - peek ahead
- `rev()` - reverse

#### 2.4 Consuming Adaptors

- `collect()` - into collection
- `sum()` - add up
- `count()` - count items
- `fold()` - reduce with accumulator
- `reduce()` - similar to fold
- `any()` - check if any match
- `all()` - check if all match
- `find()` - first match
- `position()` - index of first match

#### 2.5 Custom Iterators

- Implementing Iterator trait
- State management

---

## Exercise Guidelines

### Minimum Exercises Required

#### Closures (8-10 exercises)

1. **closures1.rs** ⭐ - Basic closure
2. **closures2.rs** ⭐⭐ - Closure capturing variable
3. **closures3.rs** ⭐⭐ - Closure with parameters
4. **closures4.rs** ⭐⭐⭐ - Fn vs FnMut vs FnOnce
5. **closures5.rs** ⭐⭐⭐ - move keyword
6. **closures6.rs** ⭐⭐⭐ - Closure as parameter
7. **closures7.rs** ⭐⭐⭐⭐ - Returning closure
8. **closures8.rs** ⭐⭐⭐⭐ - Practical closure usage

#### Iterators (12-15 exercises)

9. **iterators1.rs** ⭐ - Basic iteration
10. **iterators2.rs** ⭐⭐ - iter() vs into_iter()
11. **iterators3.rs** ⭐⭐ - map()
12. **iterators4.rs** ⭐⭐ - filter()
13. **iterators5.rs** ⭐⭐⭐ - Chaining adaptors
14. **iterators6.rs** ⭐⭐⭐ - collect()
15. **iterators7.rs** ⭐⭐⭐ - fold()
16. **iterators8.rs** ⭐⭐⭐ - enumerate() and zip()
17. **iterators9.rs** ⭐⭐⭐⭐ - flat_map()
18. **iterators10.rs** ⭐⭐⭐⭐ - Implement custom iterator
19. **iterators11.rs** ⭐⭐⭐⭐ - Iterator with closures
20. **iterators_quiz.rs** ⭐⭐⭐⭐⭐ - Process data pipeline

---

## Common Mistakes to Address

1. Forgetting iterators are lazy
2. Not understanding iterator ownership
3. Confusing Fn/FnMut/FnOnce
4. Overusing collect() (prefer chaining)
