// 🤖 Desafio Gerado por IA
// Título: Exercício sobre Tuplas
// Descrição: Corrija os erros no código para que ele possa criar e manipular uma tupla corretamente.
// Dica: Lembre-se de que tuplas não têm um método `len()`. Pense em como você pode acessar a quantidade de elementos de outra forma.
//
// Corrija os erros marcados com TODO!

// Código Rust COM ERROS para corrigir
fn main() {
    let my_tuple = (5, "Hello", 3.14);
    println!("The first element is: {}", my_tuple.0);
    println!("The second element is: {}", my_tuple.1);
    let (a, b, c) = my_tuple;
    println!("The third element is: {}", c);
    println!("Tuple length: {}", my_tuple.len()); // TODO: fix this
}
