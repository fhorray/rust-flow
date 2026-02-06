// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Vectors - Dropping

Description:
When a vector is dropped, its contents are also dropped.

Your task is to observe that `v` is invalid after it goes out of scope.
Fix the code by moving the println inside the scope.
*/

fn main() {
    {
        let v = vec![1, 2, 3];
    } // v dropped here

    // TODO: Fix this error
    println!("v: {:?}", v);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
