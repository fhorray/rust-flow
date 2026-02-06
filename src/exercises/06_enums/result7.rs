// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Result - Type Alias

Description:
If you use the same Result type (same Error) repeatedly, you can define a type alias.

Your task is to define `type MyResult<T> = Result<T, String>` and use it in the function signature.
*/

// TODO: Define MyResult
// type MyResult<T> = ...

fn main() {
    // let res: MyResult<i32> = Ok(10);
    // println!("{:?}", res);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
