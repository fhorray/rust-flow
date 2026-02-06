// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Borrowing - Dangling References

Description:
You cannot return a reference to a value created inside the function.
When the function returns, the value is dropped, leaving the reference pointing to invalid memory.

The code below tries to return a reference to a local string.

Your task is to fix it by returning the String directly (transferring ownership).
*/

fn main() {
    let reference_to_nothing = dangling();
    println!("r: {}", reference_to_nothing);
}

// TODO: Fix signature and body
fn dangling() -> &String {
    let s = String::from("hello");
    &s // Error: `s` is dropped here while still borrowed
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
