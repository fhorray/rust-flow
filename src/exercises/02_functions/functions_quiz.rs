// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Functions Quiz

Description:
This quiz checks your understanding of function definitions, parameters, return types, and basic control flow.

Your task is to implement the function `calculate` which:
1. Takes two integers `a` and `b`.
2. Takes a string slice `op` representing the operation ("+", "-", "*", "/").
3. Returns the result as an integer.

If the operation is not recognized, return 0.

Hints:
1. You can use `if op == "+" { ... } else if ...` or `match op { ... }`.
*/

fn main() {
    let result = calculate(10, 5, "+");
    println!("10 + 5 = {}", result);

    // Simple check in main
    if result == 15 {
        println!("Good job!");
    } else {
        println!("Expected 15, got {}", result);
    }
}

// TODO: Implement the `calculate` function signature and body
fn calculate(a: i32, b: i32, op: &str) -> i32 {
    // Implement logic here
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_addition() {
        assert_eq!(calculate(10, 5, "+"), 15);
    }

    #[test]
    fn test_subtraction() {
        assert_eq!(calculate(10, 5, "-"), 5);
    }

    #[test]
    fn test_multiplication() {
        assert_eq!(calculate(10, 5, "*"), 50);
    }

    #[test]
    fn test_division() {
        assert_eq!(calculate(10, 5, "/"), 2);
    }

    #[test]
    fn test_unknown_op() {
        assert_eq!(calculate(10, 5, "%"), 0);
    }
}
