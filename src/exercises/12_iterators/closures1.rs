// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Closures - Definition

Description:
Closures are anonymous functions you can save in a variable or pass as arguments.
They are defined using `|args| body`.

Your task is to define a simple closure that takes no arguments and returns "hello".
*/

fn main() {
    // TODO: Define a closure that returns "hello"
    let my_closure = || "fix me"; // This should return "hello"

    println!("Closure says: {}", my_closure());
    assert_eq!(my_closure(), "hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
