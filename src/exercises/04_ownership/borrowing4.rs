// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Borrowing - Rules

Description:
You cannot have a mutable reference while you have an immutable reference to the same value.
This prevents data races.

The code below tries to create `r1` (immutable) and `r2` (mutable) at the same time.

Your task is to fix the code. You can fix it by ensuring `r1` is no longer used before `r2` is created.
*/

fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &mut s; // Error: cannot borrow as mutable because it is also borrowed as immutable

    println!("r1: {}", r1);
    println!("r2: {}", r2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
