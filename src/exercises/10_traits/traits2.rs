// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Traits - Implementation

Description:
Once a trait is defined, you can implement it for specific types.

Your task is to implement the `Animal` trait for the `Dog` struct.
`sound` should return "Woof".
*/

trait Animal {
    fn sound(&self) -> String;
}

struct Dog;

// TODO: Implement Animal for Dog
// impl Animal for Dog { ... }

fn main() {
    let dog = Dog;
    // println!("{}", dog.sound());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
