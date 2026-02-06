// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Testing - Result

Description:
Tests can return `Result<(), E>`.
This allows using the `?` operator in tests.
If the test returns `Err`, it fails.

Your task is to fix the test signature to return `Result`.
*/

#[cfg(test)]
mod tests {
    #[test]
    // TODO: Fix signature
    fn test_result() {
        if 2 + 2 == 4 {
            Ok(()) // Error: returns Result but signature expects ()
        } else {
            Err(String::from("Math is broken"))
        }
    }
}
