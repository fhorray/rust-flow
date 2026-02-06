// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Modules - Struct Visibility

Description:
For a struct to be usable outside its module, it must be `pub`.
However, its fields are still private by default!

Your task is to make the `contents` field of `Sausage` public.
*/

mod sausage_factory {
    pub struct Sausage {
        // TODO: Make this public
        contents: String,
    }

    impl Sausage {
        pub fn new() -> Sausage {
            Sausage { contents: String::from("meat") }
        }
    }
}

fn main() {
    let s = sausage_factory::Sausage::new();
    // println!("Sausage contains: {}", s.contents); // Error: contents is private
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
