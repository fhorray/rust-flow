// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Generics - Concrete Implementation

Description:
You can implement methods for a specific concrete type of a generic struct.

Your task is to implement `distance_from_origin` only for `Point<f32>`.
*/

struct Point<T> {
    x: T,
    y: T,
}

// TODO: Implement for f32 only
// impl Point<f32> { ... }

fn main() {
    let p = Point { x: 3.0, y: 4.0 };
    // println!("Distance: {}", p.distance_from_origin());

    let p_int = Point { x: 3, y: 4 };
    // p_int.distance_from_origin(); // Should error
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
