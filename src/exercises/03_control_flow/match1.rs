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
    let number = 2;

    // TODO: Write the match expression
    // match number { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
