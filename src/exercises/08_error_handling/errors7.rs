// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Error Handling - From Trait

Description:
To use `?` automatically, your error type must implement `From<OtherError>`.
This allows the compiler to convert errors implicitly.

Your task is to implement `From<std::num::ParseIntError>` for `CreationError`.
*/

use std::num::ParseIntError;

#[derive(Debug)]
struct CreationError;

// TODO: Implement From
// impl From<ParseIntError> for CreationError { ... }

fn generate_nametag_text(text: &str) -> Result<i32, CreationError> {
    let num: i32 = text.parse()?; // This fails because From is not implemented
    Ok(num)
}

fn main() {
    let _ = generate_nametag_text("10");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
