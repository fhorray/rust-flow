// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Const Generics

Description:
Const generics allow you to be generic over values (like array length).

Your task is to define a function that takes an array of any size `N` and returns it.
*/

fn main() {
    let arr1 = [1, 2, 3];
    let arr2 = [1, 2, 3, 4, 5];

    print_array(arr1);
    print_array(arr2);
}

// TODO: Fix signature to use const generics
fn print_array(arr: [i32; 3]) { // This only works for size 3
    println!("{:?}", arr);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
