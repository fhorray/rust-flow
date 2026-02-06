// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Borrowing - Immutable References

Description:
Often we want to access data without taking ownership of it. This is called "borrowing".
We can borrow a value by creating a reference to it using the `&` symbol.
References are immutable by default, meaning you can read the data but not change it.
Crucially, while a reference exists, the original owner cannot be moved or destroyed.

Your task is to create a reference `r` to the string `s` and print it.

Hints:
1. Use `&s` to create a reference.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Create a reference `r` to `s`
    let r = ""; // Change this line

    println!("r is {}", r);
    println!("s is still {}", s);

    // Using `r` and `s` together proves `s` wasn't moved.
    assert_eq!(r, "hello");
}

// ???: What's the difference between ownership and borrowing?
// (Think about who is responsible for freeing the memory)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
