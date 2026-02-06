// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - As Parameters

Description:
You can use traits as function parameters to accept any type that implements the trait.
Syntax: `fn foo(item: &impl Trait)`.

Your task is to implement `make_noise` which accepts any `Animal` and returns its sound.
*/

trait Animal {
    fn sound(&self) -> String;
}

struct Dog;
impl Animal for Dog {
    fn sound(&self) -> String { String::from("Woof") }
}

struct Cat;
impl Animal for Cat {
    fn sound(&self) -> String { String::from("Meow") }
}

// TODO: Implement make_noise
fn make_noise(animal: &Dog) -> String { // Fix signature to accept any Animal
    animal.sound()
}

fn main() {
    let dog = Dog;
    let cat = Cat;

    assert_eq!(make_noise(&dog), "Woof");
    // assert_eq!(make_noise(&cat), "Meow"); // This fails with current signature
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
