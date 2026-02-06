// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Smart Pointers - Box

Description:
`Box<T>` is the simplest smart pointer in Rust. It allows you to store data on the heap rather than the stack.
What remains on the stack is the pointer to the heap data.
This is useful when:
1. You have a type whose size can't be known at compile time (recursive types).
2. You want to transfer ownership of a large amount of data without copying it.

Your task is to create a `Box` that stores the integer `5` on the heap.

Hints:
1. `Box::new(value)`
*/

fn main() {
    // TODO: Create a Box containing 5
    let b = 0; // Fix this

    println!("b = {}", b);

    // Check if it works like a number (dereference with *)
    assert_eq!(*b, 5);
    assert_eq!(*b, 5);
}

// ???: When would you use `Box<T>` instead of storing variable directly on the stack?
// (Think about large data structures or recursive types like Linked Lists)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
