// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: HashMap - Entry API

Description:
If you want to insert a value only if the key doesn't exist, use the Entry API.
`map.entry(key).or_insert(value)`.

Your task is to use `or_insert` to ensure "Yellow" has a value of 50.
Then try to insert 25 for "Yellow" using the same method, and ensure the value remains 50.
*/

use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    // TODO: Insert "Yellow" with 50 using entry().or_insert()


    // TODO: Try to insert "Yellow" with 25 using entry().or_insert()


    println!("Yellow: {:?}", scores.get("Yellow"));
    assert_eq!(scores.get("Yellow"), Some(&50));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
