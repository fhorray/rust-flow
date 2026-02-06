// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Trait Objects - Definition

Description:
Trait objects allow you to store different types that implement the same trait in the same collection.
They use dynamic dispatch.

Your task is to create a vector of `Box<dyn Animal>`.
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
    let dog = Box::new(Dog);
    let cat = Box::new(Cat);

    // TODO: Create the vector
    // let animals: Vec<Box<dyn Animal>> = ...;

    // println!("We have {} animals", animals.len());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
