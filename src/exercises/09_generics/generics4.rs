// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Generics - Multiple Types

Description:
You can use multiple generic parameters.

Your task is to define a struct `Point` where `x` and `y` can be different types.
*/

// TODO: Define struct Point<T, U>
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    // This requires Point to support different types for x and y
    let p = Point { x: 5, y: 10.4 };

    println!("{:?}", p);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
