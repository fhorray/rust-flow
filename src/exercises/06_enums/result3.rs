// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Result - Unwrap

Description:
You can unwrap a Result just like an Option.
If it's `Err`, it will panic with the error message.

Your task is to use `expect` to get the value, providing a message "Failed to parse".
*/

fn main() {
    let result: Result<i32, &str> = Ok(42);

    // TODO: Use expect
    let value = 0; // result.expect(...);

    println!("Value is {}", value);
    assert_eq!(value, 42);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
