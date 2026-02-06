// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Ownership - Returning Ownership

Description:
Functions can return ownership of values.

Your task is to complete the function `take_and_return` so it returns the string it took.
Then use the returned value in main to fix the println.
*/

fn main() {
    let s1 = String::from("hello");

    let s2 = take_and_return(s1);

    // s1 is invalid here, but s2 should own the string
    println!("s2 is {}", s2);
}

// TODO: Make this function return the string
fn take_and_return(s: String) {
    s; // This just drops it currently (or returns () which doesn't match if we change signature)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
