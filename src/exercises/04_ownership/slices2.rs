// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Slices - Array Slices

Description:
You can also take slices of arrays.
This creates a reference to a contiguous section of the array.

Your task is to create a slice `slice` that contains the middle 3 elements of `a` ([20, 30, 40]).
*/

fn main() {
    let a = [10, 20, 30, 40, 50];

    // TODO: Create a slice containing [20, 30, 40]
    let slice = &a[0..0];

    println!("Slice: {:?}", slice);

    assert_eq!(slice, &[20, 30, 40]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
