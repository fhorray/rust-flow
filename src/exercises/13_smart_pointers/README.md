# Module 13: Smart Pointers

## Learning Objectives

### 1. Box<T>

- Heap allocation
- When to use Box
- Recursive types
- Deref coercion

### 2. Rc<T> - Reference Counting

- Shared ownership
- `Rc::clone()` (not deep clone!)
- `Rc::strong_count()`
- When to use
- Single-threaded only

### 3. RefCell<T> - Interior Mutability

- Borrowing rules at runtime
- `borrow()` and `borrow_mut()`
- Panic on rule violation
- Combining `Rc<RefCell<T>>`

### 4. Weak<T>

- Preventing reference cycles
- `Rc::downgrade()`
- `Weak::upgrade()`

### 5. Arc<T> - Atomic Reference Counting

- Thread-safe Rc
- Used with `Mutex` or `RwLock`
- Performance implications

### 6. Mutex<T> and RwLock<T>

- Mutual exclusion
- `lock().unwrap()`
- Deadlock prevention
- `Arc<Mutex<T>>` pattern

### 7. Cell<T>

- Interior mutability for Copy types
- `get()` and `set()`
- When to use vs RefCell

### 8. Cow<T> - Clone on Write

- Efficient borrowing/owning hybrid
- Lazy cloning

---

## Exercise Guidelines

### Minimum Exercises Required

1. **box1.rs** ⭐ - Basic Box usage
2. **box2.rs** ⭐⭐ - Recursive type with Box
3. **box3.rs** ⭐⭐⭐ - Deref trait
4. **rc1.rs** ⭐⭐ - Basic Rc
5. **rc2.rs** ⭐⭐⭐ - Shared ownership scenario
6. **rc3.rs** ⭐⭐⭐ - Strong count
7. **refcell1.rs** ⭐⭐⭐ - Basic RefCell
8. **refcell2.rs** ⭐⭐⭐ - Rc<RefCell<T>> pattern
9. **refcell3.rs** ⭐⭐⭐⭐ - Runtime borrow panic
10. **arc1.rs** ⭐⭐⭐ - Arc basics
11. **arc2.rs** ⭐⭐⭐⭐ - Arc<Mutex<T>>
12. **weak1.rs** ⭐⭐⭐⭐ - Preventing cycles
13. **cow1.rs** ⭐⭐⭐⭐ - Clone on write
14. **smart_pointers_quiz.rs** ⭐⭐⭐⭐⭐ - Build a tree structure

---

## Common Mistakes to Address

1. Using Rc when Arc is needed (threads)
2. Creating reference cycles with Rc
3. Calling borrow_mut() multiple times (panic)
4. Confusing Rc::clone() with deep cloning
