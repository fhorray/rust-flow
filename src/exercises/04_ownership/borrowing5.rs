// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Borrowing - Scope

Description:
Before Rust 2018, references lasted until the end of the block.
Now, they end when they are last used. This is called Non-Lexical Lifetimes (NLL).

The code below has a use of `r1` after `r2` (mutable) is created. This violates borrowing rules.
Fix it by moving the usage of `r1` before `r2` is created.
*/

fn main() {
    let mut s = String::from("hello");

    let r1 = &s; // Immutable borrow

    let r2 = &mut s; // Mutable borrow starts here

    println!("r1: {}", r1); // Error: r1 used here, so its scope extends to here, overlapping with r2

    r2.push_str(" world");
    println!("r2: {}", r2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
