# Module 14: Concurrency

## Learning Objectives

### 1. Threads

- `std::thread::spawn`
- `JoinHandle` and `join()`
- Moving data into threads
- Thread panics

### 2. Send and Sync Traits

- `Send`: safe to transfer between threads
- `Sync`: safe to share between threads
- Auto-implementation
- Why Rc is not Send

### 3. Message Passing

- Channels: `mpsc::channel()`
- `Sender` and `Receiver`
- `send()` and `recv()`
- Multiple producers
- Bounded vs unbounded channels

### 4. Shared State

- `Mutex<T>`
- `lock()` returns `MutexGuard`
- `Arc<Mutex<T>>` pattern
- `RwLock<T>` for read-heavy workloads

### 5. Atomic Types

- `AtomicBool`, `AtomicUsize`, etc.
- Lock-free operations
- Memory ordering (intro)

### 6. Parallel Iteration (Rayon)

- `par_iter()`
- When to parallelize
- Brief introduction to data parallelism

### 7. Common Patterns

- Thread pools
- Worker queues
- Fan-out/fan-in

---

## Exercise Guidelines

### Minimum Exercises Required

1. **threads1.rs** ⭐ - Spawn a thread
2. **threads2.rs** ⭐⭐ - Join threads
3. **threads3.rs** ⭐⭐ - Move data into thread
4. **threads4.rs** ⭐⭐⭐ - Multiple threads
5. **channels1.rs** ⭐⭐ - Basic channel
6. **channels2.rs** ⭐⭐⭐ - Send multiple messages
7. **channels3.rs** ⭐⭐⭐ - Multiple producers
8. **mutex1.rs** ⭐⭐⭐ - Basic mutex
9. **mutex2.rs** ⭐⭐⭐ - Arc<Mutex<T>>
10. **mutex3.rs** ⭐⭐⭐⭐ - Counter with multiple threads
11. **rwlock1.rs** ⭐⭐⭐⭐ - RwLock usage
12. **atomics1.rs** ⭐⭐⭐⭐ - Atomic counter
13. **concurrency_quiz.rs** ⭐⭐⭐⭐⭐ - Producer-consumer pattern

---

## Common Mistakes to Address

1. Data races (Rust prevents most at compile time)
2. Deadlocks (not prevented by compiler)
3. Using Rc instead of Arc
4. Holding locks too long
