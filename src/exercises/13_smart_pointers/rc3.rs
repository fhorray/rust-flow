// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Smart Pointers - Rc for Data Sharing

Description:
We want to share a `Sun` object between multiple `Planet` objects.
Since `Sun` is large (hypothetically), we don't want to copy it.
And since planets can be destroyed (dropped) in any order, no single planet should own the Sun.
`Rc` is perfect for this.

Your task is to fix the structs to use `Rc<Sun>`.
*/

use std::rc::Rc;

struct Sun;

struct Planet {
    sun: Sun, // Change this to Rc<Sun>
}

fn main() {
    let sun = Rc::new(Sun);

    let _earth = Planet { sun: Rc::clone(&sun) }; // This fails because Planet expects Sun, not Rc<Sun>
    let _mars = Planet { sun: Rc::clone(&sun) };

    println!("Sun is shared!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
