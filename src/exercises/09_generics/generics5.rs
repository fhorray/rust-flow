// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Generics - Methods

Description:
You can implement methods on generic structs.

Your task is to implement `x` method which returns a reference to `x`.
*/

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    // TODO: Implement x method
    // fn x(&self) -> &T { ... }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    // println!("p.x = {}", p.x());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
