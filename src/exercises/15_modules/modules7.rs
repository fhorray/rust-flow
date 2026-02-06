// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Modules - Super

Description:
The `super` keyword refers to the parent module.
It is like `..` in a file system.

Your task is to call `make_sauce` (defined in the parent) from `cook_pizza` (defined in a child module).
*/

fn make_sauce() {
    println!("Sauce is ready!");
}

mod kitchen {
    pub fn cook_pizza() {
        println!("Cooking pizza...");
        // TODO: Call make_sauce using super
        // super::...
    }
}

fn main() {
    kitchen::cook_pizza();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
