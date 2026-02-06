// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Smart Pointers - Drop Trait

Description:
You can implement `Drop` to run code when a smart pointer goes out of scope.
This is used by Box, Rc, Arc, MutexGuard, etc.

Your task is to implement `CustomSmartPointer` that prints "Dropping!" when dropped.
*/

struct CustomSmartPointer {
    data: String,
}

// TODO: Implement Drop
// impl Drop for CustomSmartPointer { ... }

fn main() {
    let c = CustomSmartPointer { data: String::from("stuff") };
    println!("Created");
    // c drops here
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
