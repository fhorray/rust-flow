// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Modules - Nested Modules

Description:
Modules can be nested.
To access items in nested modules, use `::`.

Your task is to call `make_sausage` from `sausage_factory::recipes`.
*/

mod sausage_factory {
    pub mod recipes {
        pub fn make_sausage() {
            println!("sausage!");
        }
    }
}

fn main() {
    // TODO: Call make_sausage
    // sausage_factory::...
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
