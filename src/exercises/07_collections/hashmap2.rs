// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: HashMap - Accessing

Description:
You can access values by key using `.get()`. It returns `Option<&V>`.

Your task is to get the score for "Blue" and print it.
*/

use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    // TODO: Get the score for "Blue"
    // let score = scores.get(...);
    let score = None;

    if let Some(s) = score {
        println!("Blue team score: {}", s);
    } else {
        println!("Blue team has no score");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
