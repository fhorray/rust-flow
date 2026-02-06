// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Match - Exhaustiveness

Description:
Matches in Rust must be exhaustive. This means you must handle every possible value.
If you miss a case, the compiler will error.

The code below matches on a `u8` but doesn't handle all 256 possibilities.
Your task is to add a catch-all arm (`_`) to handle the rest.
*/

fn main() {
    let number: u8 = 13;

    match number {
        1 => println!("One"),
        2 => println!("Two"),
        3 => println!("Three"),
        // TODO: Fix the error by handling all other cases
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
