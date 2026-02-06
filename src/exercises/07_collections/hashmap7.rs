// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: HashMap - Custom Keys

Description:
To use a custom struct as a key in a HashMap, it must implement `Eq` and `Hash`.

Your task is to add `#[derive(PartialEq, Eq, Hash)]` to the struct `Viking` so the code compiles.
*/

use std::collections::HashMap;

// TODO: Add derive macros
#[derive(Debug)]
struct Viking {
    name: String,
    country: String,
}

impl Viking {
    fn new(name: &str, country: &str) -> Viking {
        Viking {
            name: name.to_string(),
            country: country.to_string(),
        }
    }
}

fn main() {
    let vikings = HashMap::from([
        (Viking::new("Einar", "Norway"), 25),
        (Viking::new("Olaf", "Denmark"), 24),
        (Viking::new("Harald", "Iceland"), 12),
    ]);

    for (viking, health) in &vikings {
        println!("{:?} has {} hp", viking, health);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
