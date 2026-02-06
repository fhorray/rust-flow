// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Multiple Patterns

Description:
You can match multiple patterns in a single arm using the `|` operator (OR).

Your task is to modify the match expression so that:
- 2, 3, 5, 7 print "Prime"
- 1, 4, 6, 8, 9 print "Non-prime"
- Anything else prints "Unknown"
*/

fn main() {
    // Test all cases
    assert_eq!(classify(2), "Prime");
    assert_eq!(classify(3), "Prime");
    assert_eq!(classify(5), "Prime");
    assert_eq!(classify(7), "Prime");
    assert_eq!(classify(1), "Non-prime");
    assert_eq!(classify(4), "Non-prime");
    assert_eq!(classify(6), "Non-prime");
    assert_eq!(classify(10), "Unknown");
    println!("Success!");
}

// TODO: Implement using multiple patterns with |
fn classify(number: i32) -> &'static str {
    match number {
        // TODO: Use | to combine patterns for primes: 2, 3, 5, 7
        // TODO: Use | to combine patterns for non-primes: 1, 4, 6, 8, 9
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
