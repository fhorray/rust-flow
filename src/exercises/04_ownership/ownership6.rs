// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Ownership - Multiple Moves

Description:
Ownership can be transferred multiple times.
Follow the ownership of the string "Hello".

Your task is to print the string at the end using the variable that CURRENTLY owns it.
*/

fn main() {
    let s1 = String::from("Hello");
    let s2 = s1;
    let s3 = s2;

    // TODO: Which variable owns the string now? Print it.
    // println!("The owner is {}", ...);

    // Just to make sure you pick the right one, try to print s1 (it will fail)
    println!("s1: {}", s1);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
