// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - If as Expression

Description:
In Rust, `if` is an expression, which means it returns a value.
You can assign the result of an `if` block to a variable.

Your task is to replace the `return` statements with a single `if` expression assigned to `identifier`.
*/

fn main() {
    let identifier = animal_habitat("crab");
    assert_eq!(identifier, "Beach");

    let identifier = animal_habitat("gopher");
    assert_eq!(identifier, "Burrow");

    let identifier = animal_habitat("snake");
    assert_eq!(identifier, "Unknown");

    println!("Success!");
}

fn animal_habitat(animal: &str) -> &str {
    // TODO: Use `if` as an expression assigned to `identifier`
    let identifier = if animal == "crab" {
        // TODO: Complete this
        ""
    } else {
        "Unknown"
    };

    identifier
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
