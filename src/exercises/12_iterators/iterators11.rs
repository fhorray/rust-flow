// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Iterators - Any and All

Description:
`any` returns true if any element satisfies the predicate.
`all` returns true if all elements satisfy the predicate.

Your task is to check if:
1. `any` number is greater than 10.
2. `all` numbers are positive.
*/

fn main() {
    let v = vec![1, 5, 12, 3];

    // TODO: Check any > 10
    let has_large = false;

    // TODO: Check all > 0
    let all_positive = false;

    println!("Has large: {}, All positive: {}", has_large, all_positive);
    assert!(has_large);
    assert!(all_positive);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
