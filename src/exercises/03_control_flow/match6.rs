// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Match - Guards

Description:
A match guard is an extra `if` condition specified after the pattern.
The arm matches only if the pattern matches AND the condition is true.

Your task is to use a match guard to return "Big" if the number is greater than 100.
*/

fn main() {
    assert_eq!(classify_number(150), "Big");
    assert_eq!(classify_number(50), "Small");
    assert_eq!(classify_number(100), "Small");
    println!("Success!");
}

// TODO: Implement using a match guard (if condition after pattern)
fn classify_number(number: i32) -> &'static str {
    match number {
        // TODO: Use a match guard: x if x > 100 => "Big"
        _ => "Small",
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
