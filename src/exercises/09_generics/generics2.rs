// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Generics - Functions

Description:
You can define generic functions using `<T>`.

Your task is to implement the `wrapper` function that takes any type `T` and returns it wrapped in a `Vec<T>`.
*/

fn main() {
    let v = wrapper(10);
    assert_eq!(v, vec![10]);

    let v2 = wrapper("hello");
    assert_eq!(v2, vec!["hello"]);
}

// TODO: Implement wrapper
fn wrapper<T>(item: T) -> Vec<T> {
    Vec::new() // Fix this
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
