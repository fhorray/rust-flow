// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Modules - Use Keyword

Description:
You can bring items into scope using `use`.
This avoids typing the full path every time.

Your task is to use `std::time::SystemTime` so you can just type `SystemTime`.
*/

// TODO: Add use statement
// use ...

fn main() {
    // match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
    //     Ok(n) => println!("1970-01-01 was {} seconds ago!", n.as_secs()),
    //     Err(_) => panic!("Time went backwards!"),
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
