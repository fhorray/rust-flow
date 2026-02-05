// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Vectors - Creation

Description:
Vectors (`Vec<T>`) are resizable arrays that store elements of the same type on the heap.
They are one of the most commonly used collections in Rust.

You can create them using:
1. `Vec::new()`: Creates an empty vector.
2. `vec![]` macro: Creates a vector with initial values.

Your task is to:
1. Create a mutable vector `v1` using `Vec::new()`.
2. Push the value `10` into `v1`.
3. Create a vector `v2` containing the values `1, 2, 3` using the `vec![]` macro.

Hints:
1. `let mut v: Vec<Type> = Vec::new();`
*/

fn main() {
    // TODO: Create v1 and push 10
    // let mut v1 ...

    // TODO: Create v2
    // let v2 = ...

    // Checks
    // assert_eq!(v1.len(), 1);
    // assert_eq!(v1[0], 10);
    // assert_eq!(v2, vec![1, 2, 3]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
