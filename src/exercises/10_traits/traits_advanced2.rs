// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Advanced Traits - Fully Qualified Syntax

Description:
If a type implements two traits with the same method name, you need to disambiguate.

Your task is to call the `fly` method from `Wizard` and `Pilot` traits on the `Human` struct.
*/

trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {
    let person = Human;

    // Call Human::fly
    person.fly();

    // TODO: Call Pilot::fly(&person)


    // TODO: Call Wizard::fly(&person)

}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
