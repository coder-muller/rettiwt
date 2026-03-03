# Rettiwt

MVP de rede social de texto inspirado em Twitter/X, construído com Next.js App Router.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Better Auth (email/senha)
- Better Auth (email/senha + Email OTP)
- Prisma ORM
- PostgreSQL
- Resend (envio de e-mails transacionais)

## Funcionalidades do MVP

- Cadastro, login e logout
- Sessão persistida
- Verificacao de e-mail por OTP
- Esqueci minha senha com OTP por e-mail
- Troca de senha em `/settings/security`
- Feed cronológico de posts de texto
- Criação e exclusão do próprio post
- Curtir/descurtir posts
- Perfil público por `@username`
- Edição de perfil (nome, username, bio, avatar URL)
- Layout responsivo em preto/branco/cinza

## Requisitos

- Bun 1.3+
- PostgreSQL local (testado com `postgresql@14`)

## Configuração

1. Instale as dependências:

```bash
bun install
```

2. Configure variáveis de ambiente:

```bash
cp .env.example .env
```

Preencha tambem as variaveis do Resend (`RESEND_API_KEY`, `RESEND_FROM` e opcionalmente `RESEND_REPLY_TO`).

3. Garanta que o banco exista localmente:

```bash
createdb -h localhost -U guilherme rettiwt
```

4. Gere cliente Prisma e aplique migrações:

```bash
bunx prisma generate
bunx prisma migrate dev
```

5. Rode a aplicação:

```bash
bun run dev
```

Aplicação: [http://localhost:3000](http://localhost:3000)

## Scripts

- `bun run dev` - ambiente local
- `bun run build` - build de produção
- `bun run lint` - lint

## Estrutura principal

- `app/(auth)` - login e cadastro
- `app/(protected)` - feed, perfil e settings protegidos
- `app/api/auth/[...all]` - handler do Better Auth
- `lib/auth` - config e guardas de sessão
- `lib/services` - regras de negócio
- `lib/repositories` - acesso a dados via Prisma
- `lib/actions` - server actions
- `prisma` - schema e migrations
