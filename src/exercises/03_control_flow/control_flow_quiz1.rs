// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Control Flow Quiz - FizzBuzz

Description:
The classic FizzBuzz problem!
Your task is to implement the `fizzbuzz` function which takes an integer `n` and returns a String:
- If `n` is divisible by 3, return "Fizz"
- If `n` is divisible by 5, return "Buzz"
- If `n` is divisible by both 3 and 5, return "FizzBuzz"
- Otherwise, return the number as a string (e.g., "1").

Hints:
1. Use `if/else` or `match`.
2. To convert a number to string, use `n.to_string()`.
3. Order matters! Check for "FizzBuzz" first.
*/

fn main() {
    // You can check your work here
    println!("1: {}", fizzbuzz(1));
    println!("3: {}", fizzbuzz(3));
    println!("5: {}", fizzbuzz(5));
    println!("15: {}", fizzbuzz(15));
}

fn fizzbuzz(n: i32) -> String {
    // TODO: Implement FizzBuzz logic
    String::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fizz() {
        assert_eq!(fizzbuzz(3), "Fizz");
        assert_eq!(fizzbuzz(9), "Fizz");
    }

    #[test]
    fn test_buzz() {
        assert_eq!(fizzbuzz(5), "Buzz");
        assert_eq!(fizzbuzz(10), "Buzz");
    }

    #[test]
    fn test_fizzbuzz() {
        assert_eq!(fizzbuzz(15), "FizzBuzz");
        assert_eq!(fizzbuzz(30), "FizzBuzz");
    }

    #[test]
    fn test_number() {
        assert_eq!(fizzbuzz(1), "1");
        assert_eq!(fizzbuzz(2), "2");
    }
}
