// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Modules - Re-exporting

Description:
You can use `pub use` to re-export items from one module to another.
This allows you to flatten the public API.

Your task is to re-export `Cook` from `kitchen` so it can be accessed as `restaurant::Cook`.
*/

mod restaurant {
    mod kitchen {
        pub struct Cook;
    }

    // TODO: Re-export Cook
    // pub use ...
}

fn main() {
    // let cook = restaurant::Cook;
    // println!("We have a cook!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
