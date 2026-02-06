// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Collections Quiz

Description:
Task: Given a list of names, return a HashMap where key is the name and value is the count.
*/

use std::collections::HashMap;

fn count_names(names: Vec<&str>) -> HashMap<&str, i32> {
    // TODO: Implement this function
    HashMap::new()
}

fn main() {
    let names = vec!["Alice", "Bob", "Alice", "Charlie", "Bob", "Alice"];
    let counts = count_names(names);

    assert_eq!(counts["Alice"], 3);
    assert_eq!(counts["Bob"], 2);
    assert_eq!(counts["Charlie"], 1);

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
