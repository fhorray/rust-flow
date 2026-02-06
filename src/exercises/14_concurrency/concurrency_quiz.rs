// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Concurrency Quiz

Description:
Implement a simple "Job Queue" system.
- Main thread sends jobs (integers) to a channel.
- A worker thread receives jobs and processes them (prints them).
- Main thread waits for worker to finish.
*/

use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    let worker = thread::spawn(move || {
        // TODO: Loop over rx and process
        // for job in rx {
        //     println!("Processing job {}", job);
        // }
    });

    for i in 0..5 {
        tx.send(i).unwrap();
        thread::sleep(Duration::from_millis(50));
    }

    // Close channel by dropping tx
    drop(tx);

    worker.join().unwrap();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
