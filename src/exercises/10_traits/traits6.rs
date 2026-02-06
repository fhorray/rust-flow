// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Traits - Multiple Bounds

Description:
You can require a type to implement multiple traits using `+`.

Your task is to fix the function signature to require both `Animal` and `Display`.
*/

use std::fmt::Display;

trait Animal {
    fn sound(&self) -> String;
}

struct Dog;
impl Animal for Dog {
    fn sound(&self) -> String { String::from("Woof") }
}
impl Display for Dog {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Dog")
    }
}

// TODO: Fix signature to require Animal + Display
fn print_animal_sound<T: Animal>(animal: &T) {
    println!("{} says {}", animal, animal.sound()); // Error: T doesn't implement Display
}

fn main() {
    let dog = Dog;
    print_animal_sound(&dog);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
