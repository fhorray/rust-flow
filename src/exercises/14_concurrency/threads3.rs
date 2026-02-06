// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Threads - Move Closures

Description:
To use variables from the main thread inside a spawned thread, you need to `move` ownership.

Your task is to fix the code by adding the `move` keyword to the closure.
*/

use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    // TODO: Add `move`
    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v); // Error: v borrowed
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
