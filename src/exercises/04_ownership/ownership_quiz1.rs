// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Ownership Quiz - Moves and Clones

Description:
This quiz tests your understanding of Move Semantics.
The code below attempts to use variables after they have been moved, which is not allowed.

Your task is to fix the code so it compiles and prints all lines.

Rules:
1. You CANNOT remove any `println!` statements.
2. You CAN use `.clone()` to create deep copies.
3. You CAN use references (`&`) to borrow values instead of moving them.
4. You CAN change function signatures if necessary.

Hints:
1. `let s2 = s1;` moves `s1`. If you need `s1` later, consider cloning or borrowing.
2. `print_string(s3)` moves `s3` into the function.
*/

fn main() {
    let s1 = String::from("Rust");
    let s2 = s1; // Moves s1 to s2

    // Error: s1 is moved
    println!("s1: {}", s1);
    println!("s2: {}", s2);

    let s3 = s2; // Moves s2 to s3

    // Error: s3 is moved into the function
    print_string(s3);

    // Error: s3 is used after move
    println!("s3: {}", s3);
}

// You might want to change this function to take a reference?
fn print_string(s: String) {
    println!("Printing: {}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
