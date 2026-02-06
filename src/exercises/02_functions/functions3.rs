// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Multiple Parameters

Description:
Functions can accept multiple parameters, separated by commas.
Each parameter must have its own name and type.

Your task is to fix the `call_me` function signature so that it accepts an integer `num` AND a boolean `check`.

Hints:
1. Ensure both parameters are present in the definition.
2. Ensure the order of arguments in the call matches the definition.
*/

fn main() {
    call_me(10, true);
}

// TODO: Fix the parameters list
fn call_me(num: i32) {
    println!("Number: {}, Check: {}", num, check);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
