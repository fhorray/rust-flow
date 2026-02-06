// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Smart Pointers Quiz

Description:
Implement a simplistic Linked List using `Box`.
It should have `push` and `pop`.
*/

#[derive(Debug)]
enum List<T> {
    Cons(T, Box<List<T>>),
    Nil,
}

struct LinkedList<T> {
    head: List<T>,
}

impl<T> LinkedList<T> {
    fn new() -> Self {
        LinkedList { head: List::Nil }
    }

    // TODO: Implement push (adds to front)
    fn push(&mut self, elem: T) {
        // self.head = List::Cons(elem, Box::new(std::mem::replace(&mut self.head, List::Nil)));
    }

    // TODO: Implement pop (removes from front)
    fn pop(&mut self) -> Option<T> {
        None
    }
}

fn main() {
    let mut list = LinkedList::new();
    list.push(1);
    list.push(2);
    // assert_eq!(list.pop(), Some(2));
    // assert_eq!(list.pop(), Some(1));
    // assert_eq!(list.pop(), None);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
