// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Iterators - Chain

Description:
`chain` connects two iterators into one.

Your task is to chain `v1` and `v2` and iterate over all elements.
*/

fn main() {
    let v1 = vec![1, 2, 3];
    let v2 = vec![4, 5, 6];

    // TODO: Chain them
    let combined: Vec<i32> = Vec::new(); // v1.iter().chain(v2.iter())...

    println!("Combined: {:?}", combined);
    assert_eq!(combined, vec![1, 2, 3, 4, 5, 6]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
