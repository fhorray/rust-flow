// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Arrays

Description:
Arrays in Rust have a fixed length and contain elements of the same type.
They are allocated on the stack.

Your task is to:
1. Create an array named `a` containing the numbers 1 through 5.
2. Access the second element (index 1) and print it.

Hints:
1. Array syntax uses square brackets: `[v1, v2, v3]`.
2. Array indexing starts at 0.
*/

fn main() {
    // TODO: Define the array `a` with numbers 1 to 5
    let a = [0; 5]; // Placeholder with wrong values

    println!("The second element is {}", a[1]);

    // Check results
    assert_eq!(a.len(), 5, "Array length must be 5");
    assert_eq!(a[0], 1, "First element should be 1");
    assert_eq!(a[4], 5, "Last element should be 5");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_array_content() {
        // We can't easily access main's variables, but main contains assertions.
        super::main();
    }
}
