// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Iterators - Fold

Description:
`fold` (also known as reduce) combines all elements into a single value.

Your task is to use `fold` to calculate the sum of the vector `v`.
Start with an initial value of 0.
*/

fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // TODO: Use fold
    let sum = 0; // v.iter().fold(...);

    println!("Sum: {}", sum);
    assert_eq!(sum, 15);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
