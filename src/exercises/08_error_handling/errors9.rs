// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Error Handling - Result to Option

Description:
Sometimes you don't care about the error and just want an Option (discarding the error info).
You can use `.ok()`.

Your task is to convert the Result from `parse` into an Option.
*/

fn main() {
    let s = "42";
    let res = s.parse::<i32>(); // Result<i32, ...>

    // TODO: Convert to Option<i32>
    let opt: Option<i32> = None; // res.ok();

    println!("Option: {:?}", opt);
    assert_eq!(opt, Some(42));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
