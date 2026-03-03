# Rettiwt

Rede social inspirada em Twitter/X, construída com Next.js App Router, focada em posts de texto e interações sociais modernas.

## URL em produção

- [https://rettiwt-space.vercel.app](https://rettiwt-space.vercel.app)

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Better Auth (email/senha, username, admin, HIBP, Email OTP)
- Prisma ORM + PostgreSQL
- Resend para envio de e-mails transacionais

## Funcionalidades

- Cadastro, login e logout
- Verificação de e-mail com OTP
- Esqueci minha senha com OTP por e-mail
- Sessão persistida
- Feed com posts de texto
- Curtidas em posts
- Comentários em thread (incluindo respostas)
- Follow/unfollow de usuários
- Busca de usuários
- Notificações
- Mensagens privadas 1:1
- Atualização automática de mensagens por polling HTTP (compatível com deploy único na Vercel)
- Edição de perfil
- Página de segurança para troca de senha
- Área administrativa para ban/remoção de usuários

## Como rodar localmente

### 1. Instalar dependências

```bash
bun install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha no `.env` as variáveis de banco, Better Auth e Resend.

### 3. Preparar banco de dados

```bash
bunx prisma migrate dev
```

### 4. Rodar projeto

```bash
bun run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Scripts

- `bun run dev` — ambiente local
- `bun run build` — build de produção (gera Prisma Client + Next build)
- `bun run lint` — lint
- `bun run prisma:migrate` — aplicar migrações
- `bun run prisma:studio` — abrir Prisma Studio

## Estrutura principal

- `app/(auth)` — rotas de autenticação
- `app/(protected)` — áreas autenticadas
- `app/api/auth/[...all]` — handler Better Auth
- `app/api/messages/*` — endpoints de polling de mensagens
- `components/*` — UI por domínio
- `lib/auth` — autenticação e sessão
- `lib/services` — regras de negócio
- `lib/repositories` — acesso a dados com Prisma
- `prisma` — schema e migrações
