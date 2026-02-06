# Module 19: Async/Await

## Learning Objectives

### 1. Async Basics

- What is async programming
- Difference from threads
- Cooperative vs preemptive
- When to use async

### 2. async/await Syntax

- `async fn`
- `.await`
- Future trait (conceptual)
- Async blocks

### 3. Async Runtimes

- Why runtimes are needed
- Tokio (most popular)
- async-std
- `#[tokio::main]`
- `tokio::spawn`

### 4. Async I/O

- Async file operations
- Async network I/O
- `tokio::fs`, `tokio::net`

### 5. Concurrency with Async

- `tokio::join!`
- `tokio::select!`
- Cancellation
- Timeouts

### 6. Channels in Async

- `tokio::sync::mpsc`
- `tokio::sync::oneshot`
- `tokio::sync::broadcast`
- `tokio::sync::watch`

### 7. Streams

- Async iteration
- StreamExt trait
- Creating streams

### 8. Common Patterns

- Connection handling
- Request/response
- Background tasks

### 9. Pinning

- `Pin<T>` (conceptual)
- Why it's needed for async
- `Box::pin`

---

## Exercise Guidelines

### Minimum Exercises Required

1. **async1.rs** ⭐⭐ - Basic async function
2. **async2.rs** ⭐⭐ - .await syntax
3. **async3.rs** ⭐⭐⭐ - Multiple async tasks
4. **async4.rs** ⭐⭐⭐ - tokio::spawn
5. **async5.rs** ⭐⭐⭐ - join! macro
6. **async6.rs** ⭐⭐⭐⭐ - select! macro
7. **async7.rs** ⭐⭐⭐⭐ - Async channels
8. **async8.rs** ⭐⭐⭐⭐ - Timeouts
9. **async9.rs** ⭐⭐⭐⭐⭐ - Streams
10. **async_quiz.rs** ⭐⭐⭐⭐⭐ - Build an async server

---

## Note for AI

This module requires adding `tokio` as a dependency. Guide the user through Cargo.toml setup.
