// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: HashMap - Overwriting

Description:
If you insert a key that already exists, the old value is overwritten.

Your task is to:
1. Insert ("Blue", 10).
2. Insert ("Blue", 25).
3. Verify the value is 25.
*/

use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();

    scores.insert(String::from("Blue"), 10);

    // TODO: Overwrite the value for "Blue" with 25


    println!("Blue: {:?}", scores.get("Blue"));
    assert_eq!(scores.get("Blue"), Some(&25));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
