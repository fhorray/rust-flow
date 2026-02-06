// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Smart Pointers - Arc (Atomic Reference Count)

Description:
`Arc` is the thread-safe version of `Rc`.
It allows sharing data across threads.

Your task is to use `Arc` to share a number between threads.
*/

use std::sync::Arc;
use std::thread;

fn main() {
    let five = Arc::new(5);

    for _ in 0..10 {
        // TODO: Clone the Arc
        let five = Arc::clone(&five);

        thread::spawn(move || {
            println!("Inside thread: {}", five);
        });
    }

    // Note: main might finish before threads, which is fine for this example.
    // Or we can join them if we collected handles.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
