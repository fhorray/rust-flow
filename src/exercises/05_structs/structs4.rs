// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Structs - Field Init Shorthand

Description:
If you have variables with the same names as the struct fields, you can use the field init shorthand.
Instead of `red: red`, you can just write `red`.

Your task is to simplify the struct instantiation using this shorthand.
*/

struct Color {
    red: i32,
    green: i32,
    blue: i32,
}

fn main() {
    let red = 255;
    let green = 0;
    let blue = 0;

    // TODO: Create `color` using field init shorthand
    // let color = ...

    // println!("Color: {}, {}, {}", color.red, color.green, color.blue);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
