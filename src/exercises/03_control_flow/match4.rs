// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Expression

Description:
Like `if`, `match` is an expression and returns a value.
All arms must return the same type.

The code below tries to assign the result of a match to `message`.
However, it's missing the assignment part.

Your task is to assign the result of the match to `message`.
*/

fn main() {
    let boolean = true;

    // TODO: Assign the result of this match to `message`
    // Currently the result is thrown away because there's no assignment
    let message = ""; // TODO: Replace this with a match expression

    println!("{}", message);
    assert_eq!(message, "It's true!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
