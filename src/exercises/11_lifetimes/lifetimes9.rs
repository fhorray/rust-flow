// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Lifetimes - Different Lifetimes in Function

Description:
Sometimes you want to return a reference that is tied to only ONE of the inputs, not both.

Your task is to implement `first_arg` which returns the first argument.
The return value should live as long as the first argument. The second argument's lifetime doesn't matter.
*/

// TODO: Fix lifetimes so only x needs to live as long as the return value
fn first_arg(x: &str, y: &str) -> &str {
    x
}

fn main() {
    let s1 = String::from("I am s1");
    let result;
    {
        let s2 = String::from("I am s2");
        result = first_arg(&s1, &s2);
    }
    println!("Result is {}", result);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
