# Deploy Guide

## Objetivo

Padronizar deploy com Prisma em producao, sem usar comandos de desenvolvimento.

## Checklist

1. Confirmar variaveis de ambiente de producao:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Garantir que todas as migrations estao commitadas.

3. Rodar no pipeline/release:

```bash
npm ci
npm run db:migrate:deploy
npm run build
```

4. Publicar a nova versao.

## Comandos proibidos em producao

- `prisma migrate dev`
- `prisma db push` (sem processo controlado)

## Observacao

A migration `20260305120000_remove_skill_is_unlocked` remove a coluna `Skill.isUnlocked`.  
Ela deve ser aplicada antes do trafego da nova versao.
