// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Lifetimes - Elision

Description:
Rust has "lifetime elision rules" that allow you to omit lifetimes in common patterns.
1. Each parameter gets its own lifetime.
2. If there is exactly one input lifetime, it is assigned to all output lifetimes.
3. If there is `&self`, its lifetime is assigned to all output lifetimes.

The function `first_word` compiles without annotations because of rule 2.
Your task is to just run it and understand why it works.
Then, try to return a reference to a NEW string inside the function (which would fail) to see the difference.
Actually, let's just make it a "fix the code" by breaking it.
*/

fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("First word: {}", word);
}

// This function works fine with elision.
// To make it an exercise, let's pretend we want to return `y` but `y` is not connected to `s`.
// No, let's just ask to explicitely annotate it even if not needed, to practice syntax.

// TODO: Explicitly annotate lifetimes `<'a>`
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
