// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Ownership - Copy Trait

Description:
Custom types (structs) are NOT `Copy` by default. Moving them invalidates the original.
However, if all fields are `Copy`, you can derive `Copy` (and `Clone`) to make the struct behave like an integer.

Your task is to add `#[derive(Copy, Clone)]` to `Point` so the code compiles.
*/

// TODO: Add the derive attribute
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 10, y: 20 };
    let p2 = p1; // This moves p1 unless Point is Copy

    println!("p1: {:?}, p2: {:?}", p1, p2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
