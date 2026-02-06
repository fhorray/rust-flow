// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Async - Multiple Awaits

Description:
You can await multiple futures sequentially.

Your task is to await `f1` then `f2`.
*/

async fn f1() -> i32 { 1 }
async fn f2() -> i32 { 2 }

async fn run() {
    // TODO: Await both
    let a = f1(); // Missing await
    let b = f2(); // Missing await

    // println!("Sum: {}", a + b);
}

fn main() {}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
