// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - If Let Else

Description:
You can use `else` with `if let` to handle the case where the pattern doesn't match.

Your task is to complete the `describe_option` function.
It should return "Value: X" if the option is Some(X), or "No value" if None.

Hints:
1. Use `if let Some(x) = opt { ... } else { ... }`
*/

fn main() {
    assert_eq!(describe_option(Some(42)), "Value: 42");
    assert_eq!(describe_option(None), "No value");
    println!("All tests passed!");
}

// TODO: Complete this function using `if let` with `else`
fn describe_option(opt: Option<i32>) -> String {
    // Return "Value: X" if Some, or "No value" if None
    String::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_describe_option() {
        assert_eq!(describe_option(Some(10)), "Value: 10");
        assert_eq!(describe_option(None), "No value");
    }
}
