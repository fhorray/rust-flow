// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Error Handling - The ? Operator

Description:
The `?` operator is very useful for propagating errors.

Your task is to chain `total_cost` calculation using `?` to handle parsing errors for `qty_text` and `cost_text`.
*/

use std::num::ParseIntError;

fn main() {
    let cost = total_cost("10", "5");
    println!("Total cost: {:?}", cost);
}

fn total_cost(qty_text: &str, cost_text: &str) -> Result<i32, ParseIntError> {
    // TODO: Use `?` to propagate errors
    let qty = qty_text.parse::<i32>(); // Fix this
    let cost = cost_text.parse::<i32>(); // Fix this

    // Ok(qty * cost)
    Ok(0)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
