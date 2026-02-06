// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Traits - Supertraits

Description:
You can require that a type implementing trait B must also implement trait A.
This is called a supertrait.

Your task is to make `Person` a supertrait of `Student`.
This means any type implementing `Student` MUST also implement `Person`.
*/

trait Person {
    fn name(&self) -> String;
}

// TODO: Make Person a supertrait of Student (trait Student: Person)
trait Student {
    fn university(&self) -> String;
}

struct Programmer {
    name: String,
    uni: String,
}

impl Person for Programmer {
    fn name(&self) -> String { self.name.clone() }
}

impl Student for Programmer {
    fn university(&self) -> String { self.uni.clone() }
}

fn print_student_info<T: Student>(s: &T) {
    // This function can access Person methods because Student implies Person
    println!("Name: {}", s.name()); // This will fail if supertrait is not defined
    println!("Uni: {}", s.university());
}

fn main() {
    let p = Programmer { name: "Alice".into(), uni: "MIT".into() };
    print_student_info(&p);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
