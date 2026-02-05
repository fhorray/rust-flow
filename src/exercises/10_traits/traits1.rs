// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Traits - Definition

Description:
Traits define shared behavior across different types. They are similar to interfaces in other languages.
A trait defines a set of methods that a type must implement to satisfy the trait.

Your task is to define a trait named `Animal` with one method:
- `sound`: takes a reference to self (`&self`) and returns a `String`.

Hints:
1. Syntax:
   trait Name {
       fn method(&self) -> ReturnType;
   }
*/

// TODO: Define the trait Animal
trait Animal {
    // Define the sound method
}

struct Dog;

impl Animal for Dog {
    fn sound(&self) -> String {
        String::from("Woof!")
    }
}

fn main() {
    let d = Dog;
    println!("Dog says: {}", d.sound());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dog_implements_animal() {
        let d = Dog;
        assert_eq!(d.sound(), "Woof!");
    }
}
