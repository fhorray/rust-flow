// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Result - Matching

Description:
Like Option, you can match on Result to handle success and failure.

Your task is to implement `handle_result` which prints "Success: X" or "Failure: E".
*/

fn main() {
    let success = Ok(10);
    let failure = Err("Something went wrong");

    handle_result(success);
    handle_result(failure);
}

fn handle_result(res: Result<i32, &str>) {
    // TODO: Match on res
    match res {
        // Ok(n) => ...
        // Err(e) => ...
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
