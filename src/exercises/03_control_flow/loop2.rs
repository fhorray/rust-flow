// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Loops - Returning Values

Description:
You can return a value from a loop by placing it after the `break` keyword.
This value can be assigned to a variable.

Your task is to:
1. Increment `counter` until it reaches 10.
2. Break the loop returning `counter * 2`.
3. Assign the result to `result`.
*/

fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            // TODO: Break returning counter * 2
            break 0; // placeholder
        }
    };

    println!("The result is {}", result);
    assert_eq!(result, 20);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
