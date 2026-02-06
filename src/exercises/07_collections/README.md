# Module 07: Collections

## Learning Objectives

### 1. Vec<T> (Vector)

- Creating vectors: `Vec::new()`, `vec![]` macro
- Adding elements: `push()`
- Accessing elements: indexing `[]` vs `get()`
- Iterating: `for`, `iter()`, `iter_mut()`, `into_iter()`
- Common methods: `len()`, `is_empty()`, `pop()`, `remove()`, `clear()`
- Capacity vs Length
- Slicing vectors

### 2. String

- `String` vs `&str`
- Creating: `String::new()`, `String::from()`, `.to_string()`
- Modifying: `push()`, `push_str()`, `+` operator, `format!` macro
- Indexing (why you can't: UTF-8)
- Iterating: `chars()`, `bytes()`
- Slicing (be careful with UTF-8 boundaries)
- Common methods: `len()`, `is_empty()`, `contains()`, `replace()`

### 3. HashMap<K, V>

- Creating: `HashMap::new()`
- Inserting: `insert()`
- Accessing: `get()`, indexing (panics if key missing)
- Updating: overwrite, insert if not exists (`entry()` API)
- Iterating
- Ownership of keys and values
- `Hash` and `Eq` requirements for keys

### 4. Other Collections (Brief)

- `HashSet<T>`
- `BTreeMap<K, V>` and `BTreeSet<T>` (sorted)
- `VecDeque<T>` (double-ended queue)
- `LinkedList<T>` (rarely used)

---

## Exercise Guidelines

### Minimum Exercises Required

#### Vec (8-10 exercises)

1. **vec1.rs** ⭐ - Create a vector
2. **vec2.rs** ⭐ - Push and pop elements
3. **vec3.rs** ⭐⭐ - Iterate over vector
4. **vec4.rs** ⭐⭐ - Mutable iteration
5. **vec5.rs** ⭐⭐ - Access with get() vs []
6. **vec6.rs** ⭐⭐⭐ - Vector of different types (using enum)
7. **vec7.rs** ⭐⭐⭐ - Ownership when iterating
8. **vec8.rs** ⭐⭐⭐⭐ - Filter and collect

#### String (6-8 exercises)

9. **string1.rs** ⭐ - Create a String
10. **string2.rs** ⭐ - String from &str
11. **string3.rs** ⭐⭐ - Concatenation
12. **string4.rs** ⭐⭐ - format! macro
13. **string5.rs** ⭐⭐⭐ - Iterating over chars
14. **string6.rs** ⭐⭐⭐ - String slicing (UTF-8 aware)
15. **string7.rs** ⭐⭐⭐⭐ - Building strings dynamically

#### HashMap (6-8 exercises)

16. **hashmap1.rs** ⭐ - Create and insert
17. **hashmap2.rs** ⭐⭐ - Access values
18. **hashmap3.rs** ⭐⭐ - Iterate over entries
19. **hashmap4.rs** ⭐⭐⭐ - Update values
20. **hashmap5.rs** ⭐⭐⭐ - Entry API (insert if not exists)
21. **hashmap6.rs** ⭐⭐⭐⭐ - Count word frequency
22. **hashmap7.rs** ⭐⭐⭐⭐ - Ownership with HashMap

#### Combined

23. **collections_quiz.rs** ⭐⭐⭐⭐⭐ - Build a simple phone book or inventory system

---

## Common Mistakes to Address

1. Trying to index a String
2. Moving out of vector while iterating
3. Assuming HashMap maintains insertion order
4. Forgetting that Vec/String grow on heap
