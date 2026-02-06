// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Macros - Repetition

Description:
You can handle repeated arguments using `$(...)*` or `$(...)+`.

Your task is to define `my_vec` which works like `vec![]`.
It should take comma-separated expressions and push them into a vector.
*/

macro_rules! my_vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            // TODO: Push $x
            // $(
            //     temp_vec.push($x);
            // )*
            temp_vec
        }
    };
}

fn main() {
    let v = my_vec![1, 2, 3];
    println!("{:?}", v);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
