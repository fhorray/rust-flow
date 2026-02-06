// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Iterators - Zip

Description:
`zip` zips two iterators together into pairs.

Your task is to zip `names` and `ages` into a HashMap.
*/

use std::collections::HashMap;

fn main() {
    let names = vec!["Alice", "Bob", "Charlie"];
    let ages = vec![30, 25, 35];

    // TODO: Zip and collect into HashMap
    let people: HashMap<_, _> = HashMap::new();
    // names.into_iter().zip(ages.into_iter()).collect();

    println!("People: {:?}", people);
    // assert_eq!(people["Alice"], 30);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
