// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Strings - Indexing

Description:
Rust strings do not support indexing like `s[0]` because UTF-8 characters can be multiple bytes.
To get a character, you need to iterate over chars.

The code below tries to index a string.
Your task is to fix it by using `.chars().nth(0)` to get the first character.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Fix this error
    let h = s[0];

    println!("The first letter is {}", h);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
