// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Drop

Description:
`Drop` is run when a value goes out of scope.

Your task is to implement `Drop` for `Firework`.
It should print "Boom!" when dropped.
*/

struct Firework {
    strength: i32,
}

// TODO: Implement Drop
// impl Drop for Firework { ... }

fn main() {
    {
        let _f = Firework { strength: 10 };
        println!("Lighting firework...");
    }
    // Should print Boom! here
    println!("Done.");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
