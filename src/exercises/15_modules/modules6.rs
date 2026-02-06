// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Modules - Enum Visibility

Description:
Unlike structs, if an enum is `pub`, all its variants are also `pub`.

Your task is to verify this by using `Mushroom` variant from `PizzaTopping`.
*/

mod pizza_factory {
    #[derive(Debug)]
    pub enum PizzaTopping {
        Cheese,
        Mushroom,
        Pepperoni,
    }
}

fn main() {
    // TODO: Use the Mushroom variant
    // let topping = ...;

    // println!("Topping: {:?}", topping);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
