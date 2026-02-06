// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Ownership - Copy Types

Description:
Primitive types like integers are `Copy`. This means assignment creates a copy, and the original variable remains valid.
Complex types like `String` are `Move`.

The code below works for `x` (i32) but fails for `s` (String).

Your task is to fix the String usage by using `.clone()` when creating `s2`.
*/

fn main() {
    let x = 5;
    let y = x;
    println!("x is {}, y is {}", x, y); // This works because i32 is Copy

    let s1 = String::from("hello");
    let s2 = s1; // Moves ownership

    // TODO: Fix this line
    println!("s1 is {}, s2 is {}", s1, s2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
