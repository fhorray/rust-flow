// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow - While Loop

Description:
The `while` loop runs as long as a condition is true.

Your task is to write a while loop that counts down from 10 to 1.
Print the number in each iteration.
When the loop finishes, print "Liftoff!".
*/

fn main() {
    let mut n = 10;

    // TODO: Write a while loop that runs while n > 0
    // while ... {
    //     println!("{}", n);
    //     n -= 1;
    // }

    println!("Liftoff!");

    // Check if n is 0
    assert_eq!(n, 0);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
