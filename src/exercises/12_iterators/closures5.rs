// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Closures - Move

Description:
By default, closures capture variables by reference.
If you want to take ownership, use the `move` keyword.
This is often required when spawning threads.

Your task is to force the closure to take ownership of `x`.
*/

use std::thread;

fn main() {
    let x = vec![1, 2, 3];

    // TODO: Add `move` keyword
    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", x); // Error: x might outlive the current function, so we must move it into the thread
    });

    handle.join().unwrap();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
