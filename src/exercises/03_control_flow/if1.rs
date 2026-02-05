// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow - If/Else

Description:
The `if` statement allows you to branch your code based on a condition.
In Rust, `if` is an **expression**, which means it returns a value.
This allows you to assign the result of an `if` block to a variable or return it from a function.

Your task is to complete the `bigger` function.
It should return the larger of the two numbers, `a` or `b`, without using the `return` keyword (implicit return).

Hints:
1. `if a > b { a } else { b }`
*/

fn main() {
    let a = 10;
    let b = 8;
    println!("Bigger of {} and {} is {}", a, b, bigger(a, b));
}

fn bigger(a: i32, b: i32) -> i32 {
    // TODO: Complete this function using if/else
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bigger() {
        assert_eq!(bigger(10, 8), 10);
        assert_eq!(bigger(32, 42), 42);
        assert_eq!(bigger(5, 5), 5);
    }
}
