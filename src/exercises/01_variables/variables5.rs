// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Shadowing

Description:
Rust allows you to "shadow" a variable by redeclaring it with the same name using the `let` keyword.
This is useful when you want to transform a variable (e.g., change its type) without coming up with a new unique name.
Shadowing is different from marking a variable as `mut` because:
1. We are effectively creating a *new* variable with the same name.
2. We can change the type of the value (e.g., from String to Integer).

The code below creates a string variable `x`. We want to convert it into a number and store it in `x` again.
However, simply assigning it won't work because the types are different (`&str` vs `i32`).

Your task is to use shadowing to redeclare `x` as a number.

Hints:
1. Use the `let` keyword again to declare a new variable named `x`.
*/

fn main() {
    let x = "5";
    println!("x is a string: {}", x);

    // TODO: Use shadowing to convert the string `x` into an integer `x`
    x = x.parse::<i32>().unwrap();

    println!("x is now a number: {}", x + 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
