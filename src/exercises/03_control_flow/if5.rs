// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Control Flow - Nested If

Description:
You can nest `if` statements, but it can get messy.
The code below uses nested ifs to determine a number's sign and parity.

Your task is to refactor or just fix the logic to correctly identify:
- "positive odd"
- "positive even"
- "negative odd"
- "negative even"
- "zero"
*/

fn main() {
    assert_eq!(describe_number(10), "positive even");
    assert_eq!(describe_number(7), "positive odd");
    assert_eq!(describe_number(-10), "negative even");
    assert_eq!(describe_number(-7), "negative odd");
    assert_eq!(describe_number(0), "zero");
    println!("Success!");
}

fn describe_number(n: i32) -> &'static str {
    if n > 0 {
        if n % 2 == 0 {
            "positive even"
        } else {
            // TODO: missing something here?
            ""
        }
    } else if n < 0 {
        // TODO: Handle negative numbers
        "negative"
    } else {
        "zero"
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
