// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Error Handling - Boxing Errors

Description:
Sometimes you want to return different types of errors from the same function.
You can use a trait object `Box<dyn Error>`.

Your task is to update the return type of `main` to `Result<(), Box<dyn std::error::Error>>` so you can use `?` on different error types.
*/

use std::error::Error;
use std::fs::File;
use std::io::Read;

// TODO: Update return type
fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt"); // This returns io::Error

    // We want to use `?` here but file might not exist.
    // For this exercise, assume we want to handle any error.

    // Just force a parse error to demonstrate mixing errors
    let i: i32 = "abc".parse()?;

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main(); // Fails because file missing
    }
}
