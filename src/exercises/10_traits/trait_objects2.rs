// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Trait Objects - Dispatch

Description:
When you call a method on a trait object, Rust decides at runtime which implementation to call.

Your task is to iterate over the animals and call `sound`.
*/

trait Animal {
    fn sound(&self) -> String;
}

struct Dog;
impl Animal for Dog {
    fn sound(&self) -> String { "Woof".into() }
}

struct Cat;
impl Animal for Cat {
    fn sound(&self) -> String { "Meow".into() }
}

fn main() {
    let animals: Vec<Box<dyn Animal>> = vec![
        Box::new(Dog),
        Box::new(Cat),
    ];

    // TODO: Iterate and print sound
    // for animal in ... { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
