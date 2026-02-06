// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Error Handling - Custom Errors

Description:
You can define your own error types. They are usually structs or enums.
For them to be useful, they should implement `std::fmt::Display` and `std::fmt::Debug`.

Your task is to:
1. Define a struct `CreationError`.
2. Implement `Display` for it.
3. Return it from the function.
*/

use std::fmt;

#[derive(Debug)]
struct CreationError;

// TODO: Implement Display
impl fmt::Display for CreationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Creation error")
    }
}

fn generate_nametag_text(name: String) -> Result<String, CreationError> {
    if name.is_empty() {
        // TODO: Return Err(CreationError)
        Ok(String::new())
    } else {
        Ok(format!("Hi! My name is {}", name))
    }
}

fn main() {
    let result = generate_nametag_text(String::new());
    println!("{:?}", result);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
