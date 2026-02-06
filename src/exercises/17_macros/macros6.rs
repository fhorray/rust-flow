// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Macros - DSL

Description:
Macros allow creating Domain Specific Languages (DSLs).

Your task is to create a macro `calculate` that supports syntax like:
`eval 1 + 2`
*/

macro_rules! calculate {
    (eval $e:expr) => {
        println!("Result: {}", $e);
    };
}

fn main() {
    calculate!(eval 1 + 2);
    calculate!(eval 5 * 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
