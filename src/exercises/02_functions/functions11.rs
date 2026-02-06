// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Functions - Composition

Description:
You can pass the result of one function directly as an argument to another function.

Your task is to:
1. Define a function `double` that multiplies a number by 2.
2. Define a function `add_one` that adds 1.
3. Call them in `main` to compute `add_one(double(5))`.
*/

fn main() {
    // TODO: Call add_one(double(5))
    let result = 0;

    println!("Result is {}", result);
    assert_eq!(result, 11);
}

// TODO: Define `double`
fn double(n: i32) -> i32 {
    0
}

// TODO: Define `add_one`
fn add_one(n: i32) -> i32 {
    0
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
