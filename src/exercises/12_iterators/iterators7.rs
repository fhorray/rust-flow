// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Iterators - Enumerate

Description:
`enumerate` yields `(index, item)`.

Your task is to filter the vector to keep only items at even indices.
*/

fn main() {
    let v = vec!['a', 'b', 'c', 'd', 'e'];

    // TODO: Keep elements at indices 0, 2, 4...
    let result: Vec<char> = v
        .iter()
        .enumerate()
        .filter(|(i, _)| false) // Fix condition
        .map(|(_, &c)| c)
        .collect();

    println!("Result: {:?}", result);
    assert_eq!(result, vec!['a', 'c', 'e']);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
