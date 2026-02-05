// I AM NOT DONE

/*
Difficulty: ⭐
Topic: HashMap - Creation

Description:
A `HashMap` stores mappings of keys to values. Keys must be unique.
It is not included in the prelude, so you must import it: `use std::collections::HashMap;`.

Your task is to:
1. Create a new, mutable HashMap called `scores`.
2. Insert a team name (String) "Blue" with score 10.
3. Insert a team name (String) "Yellow" with score 50.

Hints:
1. `HashMap::new()`
2. `scores.insert(key, value)`
*/

use std::collections::HashMap;

fn main() {
    // TODO: Create a new HashMap
    // let mut scores = ...;

    // TODO: Insert values
    // scores.insert(...);
    // scores.insert(...);

    // Verify
    // assert_eq!(scores.get("Blue"), Some(&10));
    // assert_eq!(scores.get("Yellow"), Some(&50));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
