// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Async - Join

Description:
To run futures concurrently, you can use `join!`.
(Using `futures::join!` macro, simulated here).

Your task is to simulate joining two futures.
*/

async fn task1() { println!("Task 1"); }
async fn task2() { println!("Task 2"); }

async fn run() {
    // TODO: Run them concurrently (simulated)
    // join!(task1(), task2());
}

fn main() {}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
