// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Option - Definition

Description:
`Option` is a standard library enum used to represent the presence or absence of a value.
It is defined as:
    enum Option<T> {
        Some(T),
        None,
    }
This forces you to handle the case where a value might be missing, preventing null pointer errors.

Your task is to:
1. Define a variable `some_number` as an `Option` containing the value 5 (u16).
2. Define a variable `absent_number` as an `Option` containing nothing (u16).

Hints:
1. Use `Some(5)` for presence.
2. Use `None` for absence.
*/

fn main() {
    // TODO: Define `some_number`
    // let some_number: Option<u16> = ...;

    // TODO: Define `absent_number`
    // let absent_number: Option<u16> = ...;

    // Uncomment these to verify
    // println!("Number: {:?}, Absent: {:?}", some_number, absent_number);
    // assert_eq!(some_number.is_some(), true);
    // assert_eq!(absent_number.is_none(), true);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
