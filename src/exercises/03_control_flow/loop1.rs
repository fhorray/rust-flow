// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Loops - Loop

Description:
The `loop` keyword creates an infinite loop.
Unlike `while` or `for`, it doesn't have a condition. It runs until explicitly stopped.
You must use the `break` keyword to exit the loop.

Your task is to modify the loop so it breaks when `count` reaches 10.

Hints:
1. Use `break;` inside the `if` block.
*/

fn main() {
    let mut count = 0;

    loop {
        count += 1;
        println!("Count: {}", count);

        if count == 10 {
            // TODO: Break the loop here
        }
    }

    println!("Success!");
    assert_eq!(count, 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // This test will hang if the loop is not broken!
        super::main();
    }
}
