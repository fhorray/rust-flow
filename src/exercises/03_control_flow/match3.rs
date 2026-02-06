// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Ranges

Description:
You can match ranges of values using `..=`.

Your task is to categorize ages:
- 0 to 12: "Child"
- 13 to 19: "Teenager"
- 20 to 64: "Adult"
- 65 and up: "Senior" (Use the catch-all `_` for 65+)
*/

fn main() {
    assert_eq!(categorize_age(5), "Child");
    assert_eq!(categorize_age(12), "Child");
    assert_eq!(categorize_age(15), "Teenager");
    assert_eq!(categorize_age(30), "Adult");
    assert_eq!(categorize_age(70), "Senior");
    println!("Success!");
}

// TODO: Implement using range patterns (..=)
fn categorize_age(age: u32) -> &'static str {
    match age {
        // TODO: Use ranges:
        // 0..=12 => "Child"
        // 13..=19 => "Teenager"
        // 20..=64 => "Adult"
        // _ => "Senior"
        _ => "Unknown",
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
