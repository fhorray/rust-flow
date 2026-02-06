// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Modules Quiz

Description:
Organize the code into modules.
1. Create a module `store` with a public struct `Item`.
2. `Item` should have public fields `name` and `price`.
3. Create a module `inventory` inside `store`.
4. In `inventory`, create a public function `list_items` that returns a Vec of Items.

*/

// TODO: Define modules

fn main() {
    // let items = store::inventory::list_items();
    // println!("Inventory: {:?}", items);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
