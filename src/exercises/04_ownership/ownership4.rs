// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Ownership - Functions

Description:
Passing a variable to a function moves ownership (unless it's Copy).

The function `print_string` takes ownership of the string.
The code tries to use the string after calling the function.

Your task is to fix the code by cloning the string when calling `print_string`.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Clone `s` here
    print_string(s);

    println!("s is still {}", s);
}

fn print_string(s: String) {
    println!("{}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
