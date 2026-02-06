// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Closures - Type Inference

Description:
Rust infers the types of arguments and return values for closures.
However, once inferred, the type is locked.

Your task is to uncomment the lines and fix the error.
The error is that we call the closure with an integer first, locking `x` to `i32`.
Then we try to call it with a string.
To fix it, you cannot use the same closure for different types (unless you use generics, but closures are anonymous structs).
Actually, you can't fix this without redefining the closure or using a generic function.
So the task is: Define a generic function `identity` that works for both, and replace the closure usage.
*/

// TODO: Define a generic function `identity`
// fn identity<T>(x: T) -> T { x }

fn main() {
    // let example_closure = |x| x;

    // let s = example_closure(String::from("hello"));
    // let n = example_closure(5); // This fails because x is inferred as String above

    // println!("String: {}, Number: {}", s, n);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
