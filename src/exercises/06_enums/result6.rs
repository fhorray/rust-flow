// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Result - Map Error

Description:
Sometimes you need to convert one error type to another.
`map_err` allows you to transform the `Err` variant.

Your task is to use `map_err` to convert the parse error (ParseIntError) into a String error.
The error message should be "Invalid number: {original_error}".
*/

use std::num::ParseIntError;

fn main() {
    let result = parse_number("abc");
    // We expect the error to be converted to String
    assert_eq!(result, Err("Invalid number: invalid digit found in string".to_string()));
}

fn parse_number(s: &str) -> Result<i32, String> {
    // TODO: Use map_err to convert the error
    s.parse::<i32>() // This returns Result<i32, ParseIntError>, but we need Result<i32, String>
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
