# SkillTree

Aplicacao Next.js com Prisma e Supabase.

## Requisitos

- Node.js 20+
- PostgreSQL

## Setup local

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis de ambiente:

```bash
cp .env.example .env
```

3. Aplique migracoes no banco local:

```bash
npm run db:migrate:dev
```

4. Rode o projeto:

```bash
npm run dev
```

## Scripts uteis

- `npm run dev`: servidor local
- `npm run build`: build de producao
- `npm run start`: start da build
- `npm run lint`: lint
- `npm run db:generate`: `prisma generate`
- `npm run db:status`: status das migracoes
- `npm run db:migrate:dev`: cria/aplica migracoes em dev
- `npm run db:migrate:deploy`: aplica migracoes em producao
- `npm run db:studio`: abre Prisma Studio

## Deploy (producao)

Fluxo recomendado:

1. Build e testes no CI
2. Aplicar migracoes uma unica vez no banco de producao
3. Fazer deploy da aplicacao

Comandos:

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm run start
```

Importante:

- Nunca use `prisma migrate dev` em producao.
- Garanta que `DATABASE_URL` e `DIRECT_URL` apontam para o banco correto.
- A migration `20260305120000_remove_skill_is_unlocked` precisa estar versionada junto do deploy.
