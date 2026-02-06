// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Option - Safe Unwrapping

Description:
Instead of panicking, you can use `unwrap_or(default)` to provide a fallback value if the Option is `None`.

Your task is to use `unwrap_or` to get the value from `maybe_number`, defaulting to 0 if it's `None`.
*/

fn main() {
    let nothing: Option<i32> = None;

    // TODO: Use unwrap_or to default to 0
    let number = 1; // Fix this

    println!("The number is {}", number);
    assert_eq!(number, 0);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
