// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Modules - Definition

Description:
Modules allow you to organize your code into separate namespaces.
This helps manage complexity and privacy.
You can define a module using the `mod` keyword followed by the name and a block `{ ... }`.

Your task is to:
1. Define a module named `sausage_factory`.
2. Inside it, define a **public** function named `make_sausage` that prints "Sausage!".

Hints:
1. `mod name { ... }`
2. Functions are private by default. Use `pub fn` to make them accessible outside the module.
*/

// TODO: Define module `sausage_factory` with a public function `make_sausage`
// that prints "Sausage!"
// mod sausage_factory {
//     pub fn make_sausage() { ... }
// }

fn main() {
    // This line requires the module to be defined
    sausage_factory::make_sausage();
    sausage_factory::make_sausage();
}

// ???: Why are functions private by default in Rust?
// (Think about "encapsulation" and hiding implementation details)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
