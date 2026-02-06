// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Functions - Parameters

Description:
Rust functions are strict about types.
Unlike some languages where types can be inferred in function signatures, Rust requires you to explicitly state the type of every parameter.
This is a design choice to make function signatures self-documenting and stable.

The code below defines a function `call_me` that takes one argument `num`, but the type annotation is missing.

Your task is to add the type annotation for `num` so that it accepts an 32-bit integer (`i32`).

Hints:
1. Syntax: `parameter_name: Type`
*/

fn main() {
    call_me(10);
}

// TODO: Add the type for `num`
fn call_me(num) {
    println!("Number is {}", num);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
