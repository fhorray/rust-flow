// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Closures - FnOnce

Description:
If a closure moves a value out of its scope (consumes it), it implements `FnOnce`.
It can only be called once.

Your task is to understand why calling `consume` twice fails, and fix the code by removing the second call (or cloning if possible, but let's assume we can't).
*/

fn main() {
    let s = String::from("hello");

    let consume = || {
        println!("Consumed: {}", s);
        std::mem::drop(s); // Moves s out
    };

    consume();
    // consume(); // Error: use of moved value
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
