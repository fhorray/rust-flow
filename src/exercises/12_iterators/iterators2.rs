// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Iterators - Map

Description:
`map` transforms each item in the iterator.
It is lazy, so it doesn't do anything until you consume it (e.g., with `collect`).

Your task is to:
1. Create an iterator from `v`.
2. Use `map` to add 1 to each element.
3. Collect the result into a `Vec<i32>`.
*/

fn main() {
    let v = vec![1, 2, 3];

    // TODO: Map and collect
    let v2: Vec<i32> = Vec::new(); // Fix this

    println!("v2: {:?}", v2);
    assert_eq!(v2, vec![2, 3, 4]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
