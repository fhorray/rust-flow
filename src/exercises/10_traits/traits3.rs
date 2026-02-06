// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Default Implementations

Description:
Traits can provide default implementations for methods.
Types implementing the trait can override them or use the default.

Your task is to:
1. Add a default implementation for `sleep` in `Animal` that returns "Zzz...".
2. Implement `Animal` for `Cat`. Since `Cat` uses the default sleep, you don't need to implement it.
*/

trait Animal {
    fn sound(&self) -> String;

    // TODO: Add default implementation for sleep
    fn sleep(&self) -> String {
        String::new() // Fix this
    }
}

struct Cat;

// TODO: Implement Animal for Cat
impl Animal for Cat {
    fn sound(&self) -> String {
        String::from("Meow")
    }
}

fn main() {
    let cat = Cat;
    println!("Cat says: {}", cat.sound());
    println!("Cat sleeps: {}", cat.sleep());

    assert_eq!(cat.sleep(), "Zzz...");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
