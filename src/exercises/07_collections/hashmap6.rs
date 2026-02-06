// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: HashMap - Updating Values

Description:
`or_insert` returns a mutable reference to the value. You can use this to update the value based on the old one.

Your task is to count the occurrences of each word in the text.
*/

use std::collections::HashMap;

fn main() {
    let text = "hello world hello wonderful world";
    let mut map = HashMap::new();

    for word in text.split_whitespace() {
        // TODO: Count words
        // let count = map.entry(word).or_insert(0);
        // *count += 1;
    }

    println!("{:?}", map);
    assert_eq!(map["hello"], 2);
    assert_eq!(map["world"], 2);
    assert_eq!(map["wonderful"], 1);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
