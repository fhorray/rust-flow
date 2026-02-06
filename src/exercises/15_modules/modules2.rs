// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Modules - Visibility

Description:
By default, everything in a module is private.
To access it from outside, you must mark it as `pub`.

Your task is to fix the visibility error so `make_sausage` can be called.
*/

mod sausage_factory {
    // TODO: Add `pub`
    fn make_sausage() {
        println!("sausage!");
    }
}

fn main() {
    // sausage_factory::make_sausage();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
