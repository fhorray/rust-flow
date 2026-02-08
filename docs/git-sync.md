# Guia de Sincronização Git (Progy Sync)

O Progy agora suporta sincronização de progresso entre dispositivos utilizando repositórios GitHub privados.

## Como Funciona

1.  **Login**: `progy login` (autentica via GitHub e solicita permissões de Repo).
2.  **Início**: `progy init -c rust` (Cria/Clona um repositório `progy-rust` no seu GitHub).
3.  **Progresso**: Ao avançar no curso, use `progy save` para salvar.
4.  **Outro PC**: Rode `progy init -c rust` no novo PC para baixar tudo.

## Comandos

### `progy init -c [curso]`
- Verifica se você já tem um repositório para este curso.
- Se **sim**: Clona o repositório existente (restaurando seu progresso).
- Se **não**: Cria um novo repositório privado, inicializa com o template e faz o push inicial.

### `progy save -m "mensagem"`
- Faz o commit de todas as alterações locais.
- Faz o push para o GitHub.
- Use isso ao terminar uma sessão de estudo.
- *Nota*: O sistema também pode salvar automaticamente em marcos importantes (futuro).

### `progy sync`
- Baixa as alterações mais recentes da nuvem (git pull).
- Útil se você estudou em outro computador e voltou para este.

## Requisitos de Backend
- O backend deve ter as chaves `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` configuradas.
- O App do GitHub deve ter permissões de **Contents: Read/Write** e **Metadata: Read Only**.

## Troubleshooting
- **Erro 404/Unauthorized**: Seu token pode ter expirado ou não ter escopo de repo. Rode `progy login` novamente.
- **Conflito de Merge**: Se você editou o mesmo arquivo em dois lugares sem dar sync, o git pode reclamar. O `progy sync` tenta fazer rebase, mas conflitos manuais podem ocorrer.

## Requisitos do Repositório

Para que a sincronização e a execução funcionem corretamente em múltiplos dispositivos, seu repositório deve conter:

1.  **`course.json`**: Arquivo de configuração obrigatório na raiz. Define ID, nome e estrutura.
2.  **Estrutura de Pastas**: As pastas definidas em `course.json` (ex: `content/`, `exercises/`) devem existir.
3.  **SETUP.md**: Guia de configuração (também definido no config).

> **Nota**: O comando `progy init` com um *novo* curso gera essa estrutura automaticamente. Se você estiver clonando um repo manual, garanta que esses arquivos existam.
