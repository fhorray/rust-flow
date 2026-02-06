// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - If Let

Description:
`if let` is a shorter way to handle values that match one pattern while ignoring the rest.
It is useful when you only care about one case of an enum (like `Option::Some`).

Your task is to complete the `extract_value` function.
It should return the value inside `Some` multiplied by 2, or 0 if `None`.

Hints:
1. Use `if let Some(number) = arg { ... } else { ... }`
*/

fn main() {
    assert_eq!(extract_value(Some(5)), 10);
    assert_eq!(extract_value(Some(0)), 0);
    assert_eq!(extract_value(None), 0);
    println!("All tests passed!");
}

// TODO: Complete this function using `if let`
fn extract_value(arg: Option<i32>) -> i32 {
    // Return the value * 2 if Some, or 0 if None
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_value() {
        assert_eq!(extract_value(Some(7)), 14);
        assert_eq!(extract_value(None), 0);
    }
}
