// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow - Else If

Description:
You can chain multiple conditions using `else if`.

Your task is to implement the function `fizz_if_foo` which:
1. Returns "fizz" if the input is "foo".
2. Returns "buzz" if the input is "bar".
3. Returns "other" for anything else.
*/

fn main() {
    assert_eq!(fizz_if_foo("foo"), "fizz");
    assert_eq!(fizz_if_foo("bar"), "buzz");
    assert_eq!(fizz_if_foo("baz"), "other");
    println!("Success!");
}

fn fizz_if_foo(fizzish: &str) -> &str {
    // TODO: Implement using if, else if, else
    if fizzish == "foo" {
        "fizz"
    } else {
        "other"
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
