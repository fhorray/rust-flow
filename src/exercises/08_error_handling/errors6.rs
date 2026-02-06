// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Error Handling - Wrapping Errors

Description:
Using `map_err` is useful for converting external errors into your own error type.

Your task is to:
1. Define an enum `MyError` with variants `Io(std::io::Error)` and `Parse(std::num::ParseIntError)`.
2. Use `map_err` to convert errors in `read_and_parse`.
*/

use std::fs::File;
use std::io::Read;
use std::num::ParseIntError;

// TODO: Define MyError enum
// enum MyError { ... }

// TODO: Update return type
fn read_and_parse(filename: &str) -> Result<i32, String> { // Fix return type
    let mut file = File::open(filename).map_err(|e| e.to_string())?; // Convert to MyError::Io
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?; // Convert to MyError::Io
    let num: i32 = contents.trim().parse().map_err(|e: ParseIntError| e.to_string())?; // Convert to MyError::Parse
    Ok(num)
}

fn main() {
    // Just a placeholder main
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
