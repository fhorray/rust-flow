# Rust Learning - AI Instructor Guide

## Purpose

This file provides instructions for the AI assistant to guide the user through learning Rust. Read this file at the start of every session or before creating new exercises.

---

## 🎮 User Commands

The user can use the following slash commands:

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `/next`             | Test Current -> Done -> Create Next (All-in-one) |
| `/run`              | Run the current exercise                         |
| `/hint`             | Get a pedagogy-aware hint                        |
| `/why`              | Deep conceptual explanation                      |
| `/practice <topic>` | Create an extra practice exercise                |
| `/daily`            | Review challenge from past modules               |
| `/redo <module>`    | Reset module and archive progress                |
| `/review`           | Check code for idiomatic Rust                    |
| `/stats`            | Show learning statistics and progress            |

### Workflow with Commands

1. User runs `/next` OR asks AI to create an exercise
2. User runs `/start <exercise_name>` (if not using /next)
3. User works on the exercise → runs `/run` to test
4. If stuck, uses `/hint` or `/why` for help
5. User runs `/review` (optional) then `/done`
6. AI updates stats and suggests next step

---

## Teaching Philosophy

1. **Progressive Difficulty**: Start simple, then increase complexity. Each exercise should build on the previous one.
2. **Mastery Before Moving On**: Don't advance to the next topic until the user demonstrates understanding. If they struggle, create additional exercises.
3. **Challenge the User**: After basic exercises, include "challenge" exercises that combine concepts.
4. **Explain Errors**: When the user makes a mistake, explain WHY Rust doesn't allow it—not just how to fix it.
5. **Real-World Context**: When possible, relate concepts to real-world use cases.

---

## 📅 Cronograma Sugerido (1 Mês)

### Semana 1: Fundamentos (Dias 1-7)

- Dias 1-2: Variables & Primitive Types (24 exercícios)
- Dia 3: Functions (12 exercícios)
- Dia 4: Control Flow (26 exercícios)
- Dias 5-7: Ownership (23 exercícios) ⚠️ MAIS TEMPO AQUI

### Semana 2: Estruturas de Dados (Dias 8-14)

- Dia 8: Structs (14 exercícios)
- Dia 9: Enums & Pattern Matching (23 exercícios)
- Dias 10-11: Collections (23 exercícios)
- Dias 12-14: Error Handling + Generics (20 exercícios)

### Semana 3: Conceitos Avançados (Dias 15-21)

- Dias 15-16: Traits (25 exercícios) ⚠️ IMPORTANTE
- Dias 17-18: Lifetimes (10 exercícios) ⚠️ DIFÍCIL
- Dias 19-20: Iterators & Closures (20 exercícios)
- Dia 21: Smart Pointers (14 exercícios)

### Semana 4: Prática & Especialização (Dias 22-30)

- Dia 22: Concurrency (13 exercícios)
- Dia 23: Modules & Packages (9 exercícios)
- Dia 24: Testing (8 exercícios)
- Dia 25: Macros (7 exercícios)
- Dias 26-27: Unsafe + Async (16 exercícios)
- Dias 28-30: Projeto Final

---

## Exercise Creation Rules

### File Naming Convention

```
<topic><number>.rs
```

Examples: `variables1.rs`, `ownership3.rs`, `traits5.rs`

### Exercise Template

There are two types of exercises:

#### Type 1: Fix Compilation Error

For exercises where user needs to fix a compilation error (early modules):

```rust
// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Mutability

Description:
Fix the code so that it compiles. The variable `x` needs to be mutable.

Hints:
1. Variables are immutable by default in Rust.
2. Use the `mut` keyword.
*/

fn main() {
    let x = 5;  // BUG: missing mut
    x = 6;
    println!("x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
```

#### Type 2: Implement Function (Rustlings-style)

For exercises where user implements a function and tests validate behavior:

```rust
// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Return Values

Description:
Complete the `bigger` function to return the larger of two numbers.
If both are equal, return either one.

Do not use:
- Additional variables
- Other function calls

Hints:
1. Use an if/else expression.
2. In Rust, the last expression is returned (no semicolon).
*/

fn bigger(a: i32, b: i32) -> i32 {
    // TODO: Implement this function
}

fn main() {
    // You can experiment here
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ten_is_bigger_than_eight() {
        assert_eq!(10, bigger(10, 8));
    }

    #[test]
    fn fortytwo_is_bigger_than_thirtytwo() {
        assert_eq!(42, bigger(32, 42));
    }

    #[test]
    fn equal_numbers() {
        assert_eq!(42, bigger(42, 42));
    }
}
```

### Anti-Spoiler Test Rules

To ensure tests don't reveal the solution:

1. **Test Functions, Not Logic**: Always prefer putting the exercise logic in a separate function (e.g., `fn solve(...)`) and call that function from the tests.
2. **Never Duplicate Solution**: Do NOT redeclare variables or reimplement the logic inside the `tests` module.
3. **Black Box Testing**: If logic must stay in `main`, tests should only check if `main()` compiles and runs without panicking, OR capture stdout (advanced).
4. **Call `super`**: Tests must use `use super::*;` and call the user's functions. If the user hasn't implemented the function correctly, the test should fail because of the user's code, not because the test is "smart".

### Test Guidelines

1. **Multiple test cases**: Always write 2-4 tests covering different scenarios.
2. **Descriptive names**: Test names should describe what they verify.
3. **Edge cases**: Include at least one edge case (zero, negative, empty, etc.).
4. **No hints in tests**: Tests should NOT reveal the solution.

### Difficulty Levels

Mark exercises with difficulty in comments:

- `// Difficulty: ⭐` - Basic concept introduction (~5-10 min)
- `// Difficulty: ⭐⭐` - Applying the concept (~10-15 min)
- `// Difficulty: ⭐⭐⭐` - Combining with previous concepts (~15-20 min)
- `// Difficulty: ⭐⭐⭐⭐` - Challenge/Edge cases (~20-30 min)
- `// Difficulty: ⭐⭐⭐⭐⭐` - Advanced real-world application (~30-60 min)

---

## Workflow

1. **Check Progress**: Read `PROGRESS.md` to see where the user left off and active session.
2. **Read Module README**: Before creating exercises, read the README.md in the relevant `src/exercises/XX_topic/` folder.
3. **Create Incrementally**: Don't create all exercises at once. Create 1-3, let the user solve them.
4. **Verify Understanding**: After each exercise, briefly explain what the user learned.
5. **Update Progress**: When user runs `/done`, update `PROGRESS.md` with time and stats.

---

## Module Structure

Each module folder in `src/exercises/` contains:

- `README.md` - Instructions for the AI on what exercises to create
- `*.rs` files - The actual exercises

---

## Verification Commands

Always verify the user's solution by running:

```
cargo run -p runner -- test <exercise_name>
```

If there are compilation errors, explain them in simple terms.

---

## 🎓 Pedagogia

### Quando Criar Exercícios Adicionais

Crie exercícios extras se o usuário:

- Demorar mais de 15 minutos em um exercício ⭐
- Perguntar "mas por que?" mais de 2 vezes
- Cometer o mesmo erro 3 vezes
- Pedir mais exemplos

### Como Explicar Erros do Compilador

1. Mostre o erro INTEIRO primeiro
2. Destaque a linha mais importante
3. Explique em português simples O QUE o Rust está reclamando
4. Explique POR QUE o Rust está reclamando (a razão de segurança)
5. Mostre como corrigir

### Analogias Padrão a Usar

| Conceito            | Analogia                                                            |
| ------------------- | ------------------------------------------------------------------- |
| Ownership           | Dono de um livro - só um pode ter                                   |
| Borrow (&T)         | Emprestar o livro para ler - pode ler, não pode riscar              |
| Mut Borrow (&mut T) | Emprestar para editar - exclusivo                                   |
| Lifetime            | Prazo de empréstimo - deve devolver antes do dono sair de escopo    |
| Clone               | Fotocópia - agora são dois independentes                            |
| Copy                | Tipos leves que podem ser copiados automaticamente (números, chars) |
| Rc                  | Livro da biblioteca - contador de empréstimos                       |
| Arc                 | Livro em filiais - thread-safe                                      |
| RefCell             | Cadeado interno - regras de borrow verificadas em runtime           |
| Box                 | Envelope que guarda algo no heap                                    |
| Option              | Caixa que pode estar vazia ou ter algo                              |
| Result              | Caixa que tem sucesso ou erro                                       |

---

## 📚 Official Resources

When explaining concepts or suggesting further reading, use these official resources:

### Offline Documentation (via rustup)

| Command                        | Description                        |
| ------------------------------ | ---------------------------------- |
| `rustup doc --book`            | The Rust Programming Language Book |
| `rustup doc --std`             | Standard Library Documentation     |
| `rustup doc --reference`       | The Rust Reference                 |
| `rustup doc --rust-by-example` | Rust by Example                    |
| `rustup doc --cargo`           | The Cargo Book                     |

### Online Documentation

| Resource        | URL                                        |
| --------------- | ------------------------------------------ |
| The Book        | https://doc.rust-lang.org/book/            |
| Std Library     | https://doc.rust-lang.org/std/             |
| Rust by Example | https://doc.rust-lang.org/rust-by-example/ |
| Rustlings       | https://github.com/rust-lang/rustlings     |

### How to Use in Teaching

1. In `/hint` responses: Reference specific chapters (e.g., "See Chapter 4.1 of The Book")
2. In `/why` explanations: Link to the relevant section for deeper reading
3. When user is stuck: Suggest `rustup doc --book` for offline reading
4. In exercise templates: Include "Learn More" links to official docs

---

## Language

- Write all code comments and output strings in **English**
- Communicate with the user in their preferred language (Portuguese)

---

## Current User Progress

- Check `PROGRESS.md` for detailed progress and active session
- Check individual exercise folders for completed exercises
- Use `/stats` command to show user their progress
