// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Error Handling - Result

Description:
Most errors in Rust are recoverable, meaning the program can handle them and continue.
For these, Rust uses the `Result<T, E>` enum:
    enum Result<T, E> {
        Ok(T),
        Err(E),
    }

The code below parses a string into a number. Currently, it uses `.unwrap()`, which panics if parsing fails.
Your task is to change the function `parse_number` to return a `Result` instead of unwrapping, allowing the caller to handle the error.

Hints:
1. Return type should be `Result<i64, std::num::ParseIntError>`.
2. Remove `.unwrap()` and allow `.parse()` to return its Result directly.
*/

use std::num::ParseIntError;

fn main() {
    let numbers = vec!["42", "invalid", "93"];
    for number in numbers {
        match parse_number(number) {
            Ok(n) => println!("Parsed: {}", n),
            Err(e) => println!("Error: {}", e),
        }
    }
}

// TODO: Change return type to Result<i64, ParseIntError> and return the result from parse()
fn parse_number(text: &str) -> i64 {
    text.parse::<i64>().unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_success() {
        assert!(parse_number("10").is_ok());
        assert_eq!(parse_number("10").unwrap(), 10);
    }

    #[test]
    fn test_failure() {
        assert!(parse_number("NaN").is_err());
    }
}
