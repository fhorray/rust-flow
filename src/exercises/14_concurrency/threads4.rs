// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Threads - Multiple Threads

Description:
You can spawn multiple threads in a loop.
You need to collect their handles to join them later.

Your task is to fix the code to collect handles and join all of them.
*/

use std::thread;

fn main() {
    let mut handles = vec![];

    for i in 0..10 {
        let handle = thread::spawn(move || {
            println!("Thread {}", i);
        });
        handles.push(handle);
    }

    // TODO: Join all handles
    // for handle in handles { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
