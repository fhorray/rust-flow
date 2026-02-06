// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Generics - Structs

Description:
Structs can be generic over one or more types.

Your task is to define a struct `Point` that can hold coordinates of any type (integer, float, etc.).
*/

// TODO: Define struct Point<T>
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    // let integer = Point { x: 5, y: 10 };
    // let float = Point { x: 1.0, y: 4.0 };

    // println!("{:?}", integer);
    // println!("{:?}", float);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
