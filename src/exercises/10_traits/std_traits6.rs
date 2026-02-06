// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Copy

Description:
`Copy` allows implicit duplication (memcpy).
It requires `Clone`. Types with heap allocations (like String) cannot be Copy.

The struct `Point` has a `String` field, so it cannot derive `Copy`.
Your task is to fix this by changing `String` to `&'static str` (which is Copy) or just removing it.
Let's change it to `&'static str` to keep the label.
*/

// TODO: Modify struct to allow Copy
#[derive(Debug, Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
    label: String, // String is not Copy!
}

fn main() {
    let p1 = Point { x: 10, y: 20, label: String::from("A") };
    // let p2 = p1; // Move
    // println!("{:?}", p1); // Error if move
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
