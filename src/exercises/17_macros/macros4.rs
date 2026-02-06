// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Macros - Hygiene

Description:
Macros are hygienic (mostly). Variables defined inside a macro don't leak out, unless you intentionally design it to.
However, `macro_rules!` hygiene is limited compared to proc-macros.

Your task is to observe hygiene.
Just verify the code compiles when you define `val` in main, even if macro uses `val`.
*/

macro_rules! double {
    ($x:expr) => {
        {
            let val = 2; // local to macro
            $x * val
        }
    };
}

fn main() {
    let val = 10; // This val is different from macro's val
    let res = double!(val);

    println!("{} * 2 = {}", val, res);
    assert_eq!(res, 20);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
