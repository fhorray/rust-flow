// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: HashMap - Iterating

Description:
You can iterate over keys and values in a HashMap.
Note that the order is arbitrary!

Your task is to iterate over `scores` and print "{team}: {score}".
*/

use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    // TODO: Iterate and print
    // for (key, value) in ... { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
