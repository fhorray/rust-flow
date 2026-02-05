// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Generics - Definition

Description:
Generics allow you to write code that works with different types.
A generic type is often denoted by `<T>`, where `T` is a placeholder for the actual type.
For example, `Vec<T>` is a generic struct. It can be a `Vec<i32>`, `Vec<String>`, etc.

Your task is to fix the type annotation of the vector `v` so that it can store strings.
Currently, it is set to `Vec<u8>`, but we try to push a `String` into it.

Hints:
1. Change `Vec<u8>` to `Vec<String>`.
*/

fn main() {
    // TODO: Fix the generic type parameter
    let mut v: Vec<u8> = Vec::new();

    v.push(String::from("hello"));

    println!("v: {:?}", v);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
