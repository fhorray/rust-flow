// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Trait Objects - Object Safety

Description:
Not all traits can be made into trait objects. They must be "object safe".
A trait is not object safe if it has methods that return `Self` or use generic type parameters.

The `Clone` trait returns `Self`, so it is not object safe.
The code below tries to use `dyn Clone`. This fails.

Your task is to fix the code. Since we can't make Clone object safe, let's change the trait to something else or remove the trait object usage.
Actually, let's create a custom trait `MyTrait` with a method returning `Self` and try to make a trait object.
Then fix it by removing the `return Self` method or moving it to another trait.
*/

trait MyTrait {
    fn do_something(&self);
    fn clone_me(&self) -> Self; // This makes it not object safe
}

struct MyStruct;
impl MyTrait for MyStruct {
    fn do_something(&self) {}
    fn clone_me(&self) -> Self { MyStruct }
}

fn main() {
    // This line fails compilation
    // let x: Box<dyn MyTrait> = Box::new(MyStruct);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
