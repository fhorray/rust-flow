// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Match - Destructuring

Description:
You can destructure tuples, structs, and enums inside a match pattern.

Your task is to match on a tuple `point` (x, y):
- (0, 0) => print "Origin"
- (0, y) => print "Y-axis at {}"
- (x, 0) => print "X-axis at {}"
- (x, y) => print "Coordinates: {}, {}"
*/

fn main() {
    assert_eq!(describe_point((0, 0)), "Origin");
    assert_eq!(describe_point((0, 5)), "Y-axis at 5");
    assert_eq!(describe_point((3, 0)), "X-axis at 3");
    assert_eq!(describe_point((3, 5)), "Point at (3, 5)");
    println!("Success!");
}

// TODO: Implement using tuple destructuring in match
fn describe_point(point: (i32, i32)) -> String {
    match point {
        // TODO: Handle (0, 0) => "Origin"
        // TODO: Handle (0, y) => format "Y-axis at {y}"
        // TODO: Handle (x, 0) => format "X-axis at {x}"
        // TODO: Handle (x, y) => format "Point at ({x}, {y})"
        _ => String::from("Unknown"),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
