// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Closures - Capturing Environment

Description:
Closures can capture variables from their scope.
This is what makes them different from regular functions.

Your task is to fix the error.
Note that we can't do this with a `fn` because `fn` cannot capture dynamic environment.
*/

fn main() {
    let x = 10;

    // TODO: Define a closure that captures `x` and adds it to the argument
    // let add_x = |y| y + x;

    // Instead of closure, we tried to use a function here:
    fn add_x_fn(y: i32) -> i32 {
        y + x // Error: can't capture dynamic environment in a fn item
    }

    // println!("Result: {}", add_x_fn(5));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
