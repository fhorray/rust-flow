// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Trait Objects - Returning

Description:
You can return a trait object from a function if you box it.

Your task is to implement `get_random_animal` which returns `Box<dyn Animal>`.
It should return a Dog if random number < 0.5, else Cat.
For simplicity, just return Dog for now.
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

// TODO: Implement get_random_animal
fn get_random_animal(random_number: f64) -> Box<dyn Animal> {
    if random_number < 0.5 {
        Box::new(Dog)
    } else {
        Box::new(Cat)
    }
}

fn main() {
    let animal = get_random_animal(0.2);
    println!("{}", animal.sound());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
