// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Functions - Returning Tuples

Description:
Functions can return multiple values by wrapping them in a tuple.

Your task is to implement the function `swap` which takes two integers `a` and `b`,
and returns them in reverse order as a tuple `(b, a)`.
*/

fn main() {
    let (a, b) = swap(10, 20);
    println!("Swapped: {}, {}", a, b);

    assert_eq!(a, 20);
    assert_eq!(b, 10);
}

// TODO: Implement the `swap` function
fn swap(a: i32, b: i32) -> (i32, i32) {
    // Return the tuple (b, a)
    (0, 0) // placeholder
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
