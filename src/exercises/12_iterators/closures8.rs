// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Closures - Returning Closures

Description:
You can return a closure from a function.
However, since closures are anonymous types and usually unsized (unless boxed), you need to return `impl Fn...` or `Box<dyn Fn...>`.

Your task is to return a closure that adds `n` to its input.
*/

// TODO: Fix signature and body
fn create_adder(n: i32) {
    // Return a closure that takes `x` and returns `x + n`
}

fn main() {
    // let add_5 = create_adder(5);
    // println!("10 + 5 = {}", add_5(10));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
