// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Traits - Return Types

Description:
You can return a type that implements a trait using `-> impl Trait`.
Note: You can only return a single concrete type.

Your task is to implement `get_pet` which returns an `impl Animal`.
It should return a `Dog`.
*/

trait Animal {
    fn sound(&self) -> String;
}

struct Dog;
impl Animal for Dog {
    fn sound(&self) -> String { String::from("Woof") }
}

// TODO: Implement get_pet
fn get_pet() -> Dog { // Change return type to impl Animal
    Dog
}

fn main() {
    let pet = get_pet();
    println!("Pet says: {}", pet.sound());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
