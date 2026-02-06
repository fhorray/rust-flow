// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Match

Description:
The `match` control flow construct is like a switch statement in other languages, but more powerful and safe.
It forces you to handle *every possible case*.
You can use the wildcard `_` to match "anything else".

Your task is to write a match expression that checks `number` and prints:
- "One" if it is 1
- "Two" if it is 2
- "Three" if it is 3
- "Other" for any other number.

Hints:
1. Syntax:
   match value {
       pattern => code,
       _ => code,
   }
*/

fn main() {
    assert_eq!(number_to_word(1), "One");
    assert_eq!(number_to_word(2), "Two");
    assert_eq!(number_to_word(3), "Three");
    assert_eq!(number_to_word(99), "Other");
    println!("All tests passed!");
}

// TODO: Complete this function using `match`
// It should return:
// - "One" if number is 1
// - "Two" if number is 2
// - "Three" if number is 3
// - "Other" for any other number
fn number_to_word(number: i32) -> &'static str {
    // TODO: Implement using match
    ""
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_number_to_word() {
        assert_eq!(number_to_word(1), "One");
        assert_eq!(number_to_word(2), "Two");
        assert_eq!(number_to_word(3), "Three");
        assert_eq!(number_to_word(100), "Other");
    }
}
