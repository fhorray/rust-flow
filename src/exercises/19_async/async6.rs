// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Async - Select

Description:
`select!` allows waiting for the *first* future to complete.

Your task is to select between `t1` and `t2`.
*/

async fn t1() { /* ... */ }
async fn t2() { /* ... */ }

async fn run() {
    // TODO: Select
    /*
    select! {
        _ = t1().fuse() => println!("t1 finished first"),
        _ = t2().fuse() => println!("t2 finished first"),
    }
    */
}

fn main() {}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
