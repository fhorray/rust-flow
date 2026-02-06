// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Macros - Arguments

Description:
Macros match patterns.
You can capture arguments using `$name:type`.

Your task is to define a macro `my_print` that takes an expression `$e` and prints it.
*/

// TODO: Define my_print
// macro_rules! my_print {
//     ($e:expr) => {
//         println!("You passed: {}", $e);
//     };
// }

fn main() {
    // my_print!(10);
    // my_print!("hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
