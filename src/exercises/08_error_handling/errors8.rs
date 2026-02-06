// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Error Handling - Iterating Results

Description:
When iterating over items that produce a Result, you often want to collect them into a `Result<Vec<T>, E>`.
This means "Give me a vector of all items, or the first error encountered".

Your task is to collect the results of `map` into a `Result<Vec<i32>, ParseIntError>`.
*/

use std::num::ParseIntError;

fn main() {
    let strings = vec!["42", "tofu", "93", "18"];
    let numbers: Result<Vec<i32>, ParseIntError> = strings
        .into_iter()
        .map(|s| s.parse::<i32>());

    // TODO: Add .collect()
    // .collect();

    // println!("Results: {:?}", numbers);
    // assert!(numbers.is_err());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
