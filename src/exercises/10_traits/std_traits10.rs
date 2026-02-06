// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Traits - Debug and Display

Description:
`Debug` (`{:?}`) is for programmers. `Display` (`{}`) is for users.

Your task is to implement `Display` for `Temperature` to print "X°C".
*/

use std::fmt;

struct Temperature {
    degrees: f64,
}

// TODO: Implement Display
// impl fmt::Display for Temperature { ... }

fn main() {
    let t = Temperature { degrees: 23.5 };
    // println!("{}", t);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
