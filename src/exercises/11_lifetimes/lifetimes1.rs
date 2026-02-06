// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Lifetimes - References

Description:
Every reference in Rust has a lifetime, which represents the scope for which that reference is valid.
Most of the time, Rust infers lifetimes for us (Lifetime Elision).
However, when a function takes multiple references and returns a reference, Rust may need help understanding how the lifetimes relate.

The function `longest` returns the longer of two string slices.
Because the return value refers to one of the arguments, Rust needs to know that the returned reference is valid as long as *both* input references are valid.
We do this by declaring a generic lifetime parameter `'a` and annotating inputs and output with it.

Your task is to add lifetime annotations `<'a>` to the function signature so it compiles.

Hints:
1. `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`
*/

fn main() {
    let string1 = String::from("long string is long");
    let string2 = String::from("xyz");
    let result = longest(string1.as_str(), string2.as_str());
    println!("The longest string is '{}'", result);
}

// TODO: Annotate with lifetimes to fix the missing lifetime specifier error
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

// ???: Why can't Rust infer the lifetime automatically in this case?
// (Hint: The return value could come from either `x` or `y`)

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_longest() {
        let s1 = "abcd";
        let s2 = "xy";
        assert_eq!(longest(s1, s2), "abcd");
    }
}
