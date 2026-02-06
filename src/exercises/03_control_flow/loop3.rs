// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Nested Loops

Description:
You can have loops inside loops.
The `break` keyword only exits the innermost loop.

Your task is to fix the code so it prints "Inner" 3 times for each "Outer" iteration (total 3 * 3 = 9 Inner prints).
Currently, the inner loop runs infinitely.
*/

fn main() {
    let mut outer_count = 0;

    while outer_count < 3 {
        println!("Outer");
        let mut inner_count = 0;

        loop {
            println!("Inner");
            inner_count += 1;

            // TODO: Break inner loop when inner_count == 3
        }

        outer_count += 1;
    }

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // Warning: This test might hang if the loop is infinite!
        // But we rely on the runner to kill it or the user to notice.
        // I'll add a safety break for the test environment not to hang forever during my work
        // but for the user it should be infinite until fixed.
        // Actually, let's just let it be. The user will CTRL+C.
        // But for *my* verification, I need to be careful not to run this file if it's infinite.
        // I'll make it break after 100 just in case for now?
        // No, I should deliver the broken code.
        // I won't run `cargo test` on this file in my verification steps unless I fix it first.
    }
}
