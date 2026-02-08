# Propostas de Solução: Sincronização de Progresso Cross-Device

Este documento descreve estratégias para resolver o problema de dessincronização de estado quando um usuário alterna entre dispositivos (ex: Dispositivo A -> Dispositivo B) no Progy. Atualmente, o progresso (banco de dados) persiste, mas os arquivos locais (sistema de arquivos) são resetados para o estado inicial ao rodar `progy init` em um novo dispositivo.

## 1. Cloud Patching (Sincronização de Diffs)
**Ideal para**: Cursos simples, baseados em modificação de arquivos únicos ou pequenos projetos.

### Conceito
Ao "salvar" o progresso de uma lição (automaticamente ou ao completar), o cliente envia não apenas o status "Concluído", mas também o **conteúdo dos arquivos modificados** (ou um diff) para o backend (R2/S3/D1).

### Fluxo no Dispositivo B (`init`)
1.  Usuário roda `bunx progy init -c curso`.
2.  CLI baixa o esqueleto base do curso.
3.  CLI autentica e consulta a API: `GET /api/progress/:courseId`.
4.  Se houver arquivos salvos na nuvem:
    *   CLI alerta: "Progresso encontrado. Restaurando seus arquivos..."
    *   CLI baixa os arquivos/diffs e sobrescreve/aplica sobre o esqueleto base.

### Prós
*   Transparente para o usuário.
*   Não requer Git ou ferramentas externas.
*   Rápido para cursos leves.

### Contras
*   Complexidade de *merge* se o curso base mudar.
*   Custo de armazenamento (armazenar código de usuário).
*   Não escala bem para projetos com milhares de arquivos ou `node_modules`.

---

## 2. Git-Backed Persistence (Sincronização via Git)
**Ideal para**: Cursos robustos, projetos completos, estruturas de pastas complexas.

### Conceito
Tratar o diretório do usuário como um repositório Git. O `progy` atua como uma camada de abstração sobre o Git.

### Fluxo
1.  **Device A**: Cada "teste" ou "step" bem-sucedido gera um commit e push para um repositório oculto do usuário (ex: `user-repo/course-slug`).
2.  **Device B**:
    *   `bunx progy init` detecta que o usuário já iniciou este curso.
    *   Em vez de baixar o template do curso, ele faz um `git clone` do repositório de progresso do usuário.

### Implementação
*   **Backend**: Provisiona repositórios on-demand (Gitea interno ou integração GitHub).
*   **CLI**: Gerencia credenciais e comandos git (`git add .`, `git commit`, `git pull --rebase`).

### Prós
*   Histórico de versões completo.
*   Resiliência robusta para qualquer estrutura de arquivos (novo, deletado, renomeado).
*   Padrão da indústria.

### Contras
*   Requer git instalado no host (ou go-git/isomorphic-git embutido).
*   Gerenciamento de conflitos pode ser complexo se o usuário mexer "por fora".

---

## 3. Remote Containers (Ambientes Efêmeros/Persistentes)
**Ideal para**: Features futuras, isolamento total, cursos de infraestrutura/devops.

### Conceito
O código não roda nem reside na máquina do usuário. O `progy CLI` ou a Web UI apenas se conectam a um container remoto (estilo GitHub Codespaces).

### Fluxo
1.  **Device A**: Usuário edita arquivos em um container na nuvem. O volume do container persiste.
2.  **Device B**: `progy init` apenas estabelece um túnel/conexão com o *mesmo* container ou monta o *mesmo* volume em um novo container.

### Prós
*   Sincronização perfeita (o estado é único).
*   Ambiente consistente (sem problemas de "na minha máquina não funciona").

### Contras
*   Custo elevado de infraestrutura.
*   Requer conexão constante com internet.
*   Latência.

---

## 4. Snapshot & Restore (Híbrido)
**Ideal para**: Meio termo entre simplicidade e robustez.

### Conceito
Periodicamente ou ao finalizar sessão, o CLI cria um *snapshot* comprimido (ex: `.tar.gz` ignorando `node_modules`) do diretório de trabalho e envia para o Cloud Storage.

### Fluxo no Dispositivo B
1.  `init` verifica se existe um snapshot recente.
2.  Se sim, pergunta: "Deseja continuar de onde parou (Snapshot: há 2 horas) ou iniciar do zero?"
3.  Se aceitar, baixa e descomprime o snapshot sobre o diretório.

### Prós
*   Simples de implementar (upload/download de blob).
*   Agnóstico à estrutura do projeto (salva tudo).

### Contras
*   Uso de banda (upload/download de projeto inteiro).
*   Risco de sobrescrever trabalho se não houver *lock* ou verificação de timestamp adequada.

---

## Recomendação de Implementação (Roadmap)

### Fase 1: Cloud Patching (Imediato)
Focar na solução **#1** para os cursos atuais (que são majoritariamente manipulação de pequenos arquivos).
*   Adicionar endpoint `POST /sync` para enviar conteúdo de arquivos críticos (definidos no `course.json` ou detectados via watch).
*   Atualizar `init` para fazer `hydrating` desses arquivos.

### Fase 2: Snapshotting (Curto Prazo)
Implementar solução **#4** para projetos maiores onde o usuário cria arquivos novos.
*   Ignorar pastas pesadas (`node_modules`, `target`, `.git`).

### Fase 3: Containers (Longo Prazo/Enterprise)
Adotar solução **#3** para cursos avançados de backend/microserviços.

---

## Deep Dive: Implementação Git-Backed 

Esta seção detalha a arquitetura técnica necessária para implementar a solução **#2 (Git-Backed Persistence)**.

### 1. Arquitetura
A solução exige que o Progy atue como um orquestrador de repositórios Git. Não é viável (ou performático) servir Git diretamente do Cloudflare Workers.

**Componentes Necessários:**
1.  **Git Host (Hub)**:
    *   Recomendação: Uma instância de **Gitea/Forgejo** hospedada em um VPS (ex: Fly.io, DigitalOcean, Hetzner) com armazenamento persistente.
    *   Motivo: API REST fácil para criar usuários/repos e suporte a tokens de acesso.
2.  **Progy API (Orquestrador)**:
    *   Middleware que cria usuários "sombra" no Git Host quando um novo usuário se registra no Progy.
    *   Gerencia permissões: Garante que o usuário X só acesse o repo `user-X/course-Y`.
3.  **Progy CLI (Agente)**:
    *   Automação local dos comandos `git`.

### 2. Fluxo de Autenticação (Token Bridging)
O usuário não deve precisar criar conta no Gitea/GitHub. O login deve ser transparente.

1.  Usuário loga no CLI (`progy login`).
2.  CLI recebe `PROGY_TOKEN`.
3.  Ao iniciar um curso, CLI pede credenciais de Git via API:
    *   `POST /api/git/credentials` (Header: `Authorization: PROGY_TOKEN`)
    *   Retorno: `{ git_user: "user_123", git_token: "sha1_access_token", repo_url: "https://git.progy.dev/user_123/rust-course.git" }`.
4.  CLI usa essas credenciais para operações git (via HTTPS Basic Auth embutido na URL ou Credential Helper).

### 3. Mudanças no Ciclo de Vida do Curso

#### A. Inicialização (`progy init`)
*   **Antes**: Baixava template zipado.
*   **Novo Fluxo**:
    1.  Verifica na API se o usuário já tem um repo para este curso.
    2.  **Cenário 1 (Primeira vez)**:
        *   API cria repo vazio no Git Host.
        *   CLI clona repo vazio.
        *   CLI copia template do curso para a pasta.
        *   CLI faz o primeiro commit (`init: Start course`) e push.
    3.  **Cenário 2 (Retomada em outro device)**:
        *   API retorna URL do repo existente.
        *   CLI faz `git clone <url>`.
        *   Estado restaurado perfeitamente!

#### B. Salvamento (`progy save` ou Auto-save)
*   Sempre que uma lição é completada ou o usuário para de trabalhar:
    1.  `git add .`
    2.  `git commit -m "Lesson 01: Completed"`
    3.  `git push origin main`

#### C. Sincronização (`progy sync`)
*   Ao abrir o VS Code ou rodar `progy dev`:
    1.  `git pull --rebase origin main` (Garante que mudanças de outros devices sejam trazidas sem destruir trabalho local não commitado).

### 4. Requisitos Técnicos
Para implementar isso, você precisará de:

1.  **Servidor Git**:
    *   Configurar Gitea em um container Docker com volume persistente.
    *   Domínio: `git.progy.dev` (exemplo).
2.  **Integration Service (Backend)**:
    *   Novos endpoints na API do Progy para falar com a API do Gitea (criar repositórios, adicionar chaves SSH/tokens).
3.  **CLI Update**:
    *   Dependência: O usuário precisa ter `git` instalado?
        *   *Opção A (Simples)*: Sim, assume que é dev e tem git. O CLI apenas roda `spawn('git', ...)`.
        *   *Opção B (Robusta)*: Embutir `isomorphic-git` no CLI (Node/Bun compatible) para não depender do git do sistema. (Recomendado para evitar problemas de versão).

### 5. Resumo de Esforço
*   **Complexidade Backend**: Média (Setup de infra + integração de API).
*   **Complexidade CLI**: Alta (Lidar com edge cases de merge conflicts, rebase, autenticação sem prompt).
*   **Custo**: Baixo/Médio (Custo do VPS para o Gitea).

---

## 6. Implementação com GitHub (via Better Auth)

Esta seção detalha como integrar a solução Git-Backed utilizando o **GitHub** como provedor de repositórios e o **Better Auth** para autenticação.

### A. Configuração de Escopos (Scopes)
O `better-auth` gerencia o login, mas para *criar* e *escrever* em repositórios, precisamos solicitar permissões explícitas.

No arquivo de configuração do `better-auth` (backend), adicione o escopo `repo` (para repos privados) ou `public_repo`.

```typescript
// backend/auth.ts
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: ["user:email", "repo"], // 'repo' permite ler/escrever em todos os repos
    },
  },
  // Plugins para capturar o Access Token
  plugins: [
    // Se o better-auth não expuser o token nativamente na sessão,
    // precisaremos de um callback ou plugin para salvar o 'accessToken'
    // na tabela 'account' ou 'session'.
  ]
})
```

> **Nota**: O escopo `repo` é amplo. Se possível, use GitHub Apps com permissões granulares, mas para OAuth Apps padrão, `repo` é necessário.

### B. Fluxo de Obtenção de Credenciais

1.  **Login**: O usuário loga via `progy login` -> Web Browser -> GitHub OAuth.
2.  **Armazenamento**: O `better-auth` recebe o `access_token` do GitHub.
    *   *Desafio*: Por padrão, alguns auths não persistem o token de acesso na sessão do cliente por segurança.
    *   *Solução*: O token fica salvo no banco de dados (tabela `account` ou similar) vinculado ao `userId`.
3.  **Endpoint de Credenciais (`GET /api/git/credentials`)**:
    *   CLI envia request autenticado com session token do Progy.
    *   Backend busca o `userId` da sessão.
    *   Backend consulta a tabela `account` para pegar o `access_token` do GitHub (provider="github").
    *   Backend checa se o token ainda é válido.
    *   Backend retorna: `{ "user": "github_username", "token": "ghp_..." }`.

### C. Estratégia de Repositórios

Ao rodar `progy init -c rust`:

1.  **Check/Create Repo**:
    *   CLI chama API: `POST /api/git/ensure-repo { course: "rust" }`.
    *   Backend usa o `access_token` do usuário para chamar a API do GitHub: `POST /user/repos { "name": "progy-rust-course", "private": true }`.
    *   Se já existir, apenas retorna a URL.
2.  **Clone/Pull**:
    *   Backend retorna URL: `https://github.com/usuario/progy-rust-course.git`.
    *   CLI usa o token recebido para montar a URL autenticada:
        `https://x-access-token:ghp_TOKEN@github.com/usuario/progy-rust-course.git`
    *   CLI roda `git clone ...`.

### Resumo das Mudanças Necessárias

1.  **Backend (Better Auth)**:
    *   Adicionar `scope: ["repo"]`.
    *   Garantir que o `access_token` do GitHub seja persistido no banco e acessível pelo Backend.
2.  **Backend (API)**:
    *   Criar endpoints para criar repositórios no GitHub em nome do usuário.
3.  **CLI**:
    *   Lógica para solicitar credenciais e usar no comando `git`.
