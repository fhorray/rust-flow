// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Loop Labels

Description:
To break out of an outer loop from an inner loop, you can use loop labels.
Labels start with a single quote, like `'outer`.

Your task is to break the outer loop when `count` reaches 5.
*/

fn main() {
    let mut count = 0;

    'outer: loop {
        println!("Entered the outer loop");

        loop {
            println!("Entered the inner loop");

            // TODO: Break the outer loop if count == 5
            if count == 5 {

            }

            count += 1;

            // Just to prevent infinite inner loop printing
            if count > 100 { break 'outer; }
            break; // Breaks inner loop
        }
    }

    println!("Exited the outer loop");
    assert_eq!(count, 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
