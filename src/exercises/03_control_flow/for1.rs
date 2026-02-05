// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Loops - For Range

Description:
The `for` loop is the most common loop in Rust. It iterates over an iterator or a range.
Ranges are written as `start..end` (exclusive of end) or `start..=end` (inclusive of end).

Your task is to use a `for` loop to calculate the sum of numbers from 1 to 100 inclusive.

Hints:
1. Syntax: `for var in start..=end { ... }`
*/

fn main() {
    let mut sum = 0;

    // TODO: Use a for loop to iterate from 1 to 100 (inclusive) and add each number to `sum`

    println!("Sum is {}", sum);

    // Sum of 1..=100 is 5050
    assert_eq!(sum, 5050);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
