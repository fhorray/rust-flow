// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Option - Matching

Description:
You can use `match` to handle the `Some` and `None` cases.

Your task is to implement `print_option` which prints "The value is: X" or "There is no value".
*/

fn main() {
    let five = Some(5);
    let none: Option<i32> = None;

    print_option(five);
    print_option(none);
}

fn print_option(x: Option<i32>) {
    // TODO: Match on x
    match x {
        // Some(n) => println!("The value is: {}", n),
        // None => println!("There is no value"),
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
