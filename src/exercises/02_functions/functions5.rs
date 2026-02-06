// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Expressions vs Statements

Description:
In Rust, the distinction between expressions and statements is important.
- **Expressions** evaluate to a value (e.g., `5 + 5`, `x`).
- **Statements** perform an action and do not return a value (usually ending with `;`).

A function body is a block of code. If the last line of the block is an expression (no semicolon), that value is returned.
If the last line is a statement (ends with semicolon), the function returns `()` (unit).

The function `square` below is declared to return an `i32`, but the body ends with a semicolon, making it a statement.

Your task is to fix the function so it returns the squared value.

Hints:
1. Remove the semicolon `;` at the end of the line `num * num;`.
*/

fn main() {
    let answer = square(3);
    println!("The square of 3 is {}", answer);
}

// TODO: Fix the return value by converting the statement into an expression
fn square(num: i32) -> i32 {
    num * num;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_square() {
        assert_eq!(square(2), 4);
        assert_eq!(square(5), 25);
    }
}
