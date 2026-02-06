// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Lifetimes - Generic Type Parameters, Trait Bounds, and Lifetimes

Description:
Functions can have generics, trait bounds, and lifetimes all at once!

Your task is to implement `longest_with_an_announcement`.
It takes two string slices and a generic type `T` that implements `Display`.
It prints the announcement and returns the longest string.
*/

use std::fmt::Display;

// TODO: fix the signature
// fn longest_with_an_announcement(...) -> ...

fn longest_with_an_announcement(
    x: &str,
    y: &str,
    ann: impl Display,
) -> &str
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest_with_an_announcement(
        string1.as_str(),
        string2,
        "Today is a good day",
    );

    println!("The longest string is {}", result);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
