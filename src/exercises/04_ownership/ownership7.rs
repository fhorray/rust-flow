// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Ownership - Scope and Drop

Description:
When a variable goes out of scope, Rust automatically calls `drop` to free its memory.
This is why we don't have to manually free memory.

The code below tries to access `s` after it has gone out of scope.

Your task is to move the println inside the block where `s` is valid.
*/

fn main() {
    {
        let s = String::from("hello");
        // Variable s is valid here
    }
    // Variable s is NOT valid here (it was dropped)

    // TODO: Fix this error
    println!("s is {}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
