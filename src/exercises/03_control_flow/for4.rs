// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Control Flow - Mutable Iteration

Description:
If you want to modify elements while iterating, you need a mutable iterator.
Use `iter_mut()` or `&mut collection`.

Your task is to:
1. Iterate over the array `numbers` mutably.
2. Multiply each number by 2.
*/

fn main() {
    let mut numbers = [1, 2, 3, 4, 5];

    // TODO: Use iter_mut() to modify the array in place


    println!("Numbers: {:?}", numbers);
    assert_eq!(numbers, [2, 4, 6, 8, 10]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
