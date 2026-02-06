// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Functions - Return Type

Description:
Functions can return values to the caller.
The return type must be specified after an arrow `->` in the function definition.
If no return type is specified, the function returns the unit type `()`.

The function `is_even` calculates whether a number is even, but the return type is missing from the signature.

Your task is to add `-> bool` to the function signature so it compiles.

Hints:
1. Place the return type after the parameter list and before the opening brace `{`.
*/

fn main() {
    let original_price = 51;
    println!("Is {} even? {}", original_price, is_even(original_price));
}

// TODO: Add the return type to the function signature
fn is_even(num: i32) {
    num % 2 == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_even() {
        assert_eq!(is_even(2), true);
        assert_eq!(is_even(3), false);
    }
}
