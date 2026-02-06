// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Structs Quiz

Description:
This quiz tests your knowledge of struct definition, instantiation, and method implementation (including mutable methods).

Your task is to implement the `Person` struct and the following methods:
1. `new(name: String, age: u8) -> Person`: A constructor function (associated function) that creates a new Person.
2. `birthday(&mut self)`: A method that increments the person's age by 1.
3. `intro(&self) -> String`: A method that returns the greeting string "Hi, I'm {name} and I am {age} years old."

Hints:
1. `birthday` modifies the struct, so it needs `&mut self`.
2. `intro` only reads, so `&self` is sufficient.
*/

struct Person {
    name: String,
    age: u8,
}

impl Person {
    // TODO: Implement `new`, `birthday`, and `intro`
}

fn main() {
    // Basic test
    // let mut p = Person::new(String::from("Alice"), 30);
    // println!("{}", p.intro());
    // p.birthday();
    // println!("{}", p.intro());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new() {
        let p = Person::new(String::from("Bob"), 20);
        assert_eq!(p.name, "Bob");
        assert_eq!(p.age, 20);
    }

    #[test]
    fn test_birthday() {
        let mut p = Person::new(String::from("Alice"), 30);
        p.birthday();
        assert_eq!(p.age, 31);
        p.birthday();
        assert_eq!(p.age, 32);
    }

    #[test]
    fn test_intro() {
        let p = Person::new(String::from("Dave"), 40);
        assert_eq!(p.intro(), "Hi, I'm Dave and I am 40 years old.");
    }
}
