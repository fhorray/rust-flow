// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Slices - Methods

Description:
Slices behave like arrays and have many useful methods.

Your task is to fix the assertions.
`slice` contains the first 3 elements of `a`.
*/

fn main() {
    let a = [1, 2, 3, 4, 5];
    let slice = &a[0..3]; // [1, 2, 3]

    // TODO: Fix these assertions
    assert_eq!(slice.len(), 0); // Should be 3
    assert_eq!(slice.is_empty(), true); // Should be false
    assert_eq!(slice.first(), Some(&0)); // Should be Some(&1)

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
