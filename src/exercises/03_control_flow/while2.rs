// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - While Condition

Description:
The condition in a while loop can be any boolean expression.

Your task is to write a while loop that runs while `n` is greater than 1 AND `n` is divisible by 2.
Inside the loop, divide `n` by 2.
This is calculating how many times we can halve the number until it becomes odd or 1.
*/

fn main() {
    let mut n = 64;

    // TODO: Write the while loop


    println!("n is now {}", n);
    assert_eq!(n, 1);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
