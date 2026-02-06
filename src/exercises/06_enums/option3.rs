// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Option - Unwrap and Expect

Description:
`unwrap()` retrieves the value inside `Some`, or panics if it's `None`.
`expect()` is similar but lets you provide a custom panic message.
These are useful for prototyping but dangerous in production.

Your task is to use `expect` to extract the value from `maybe_number`.
If it panics, the message should be "The number is missing!".
*/

fn main() {
    let maybe_number = Some(10);

    // TODO: Use expect
    let number = 0; // maybe_number.expect(...);

    println!("The number is {}", number);

    // Test with None to see it panic (commented out for now)
    // let nothing: Option<i32> = None;
    // nothing.expect("This should panic");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
