# Skilltree Architecture

## Overview

Skilltree continua como um monolito Next.js (App Router), com frontend e backend no mesmo repo.
Nao houve separacao em `backend/` e `frontend/`.

## Before (legacy layout)

Antes da reorganizacao, a base era mais centralizada em pastas globais:

```txt
app/
components/
contexts/
hooks/
utils/
lib/
prisma/
public/
```

Padrao principal:
- `app/` para rotas e actions
- `components/` por dominio visual
- `contexts/`, `hooks/`, `utils/`, `lib/` como pastas globais compartilhadas

## Now (current layout)

A arquitetura atual introduz camadas mais explicitas:

```txt
app/
  actions/
  (routes...)
components/
features/
  tree/
    lib/
shared/
  contexts/
  hooks/
  lib/
  supabase/
contexts/   # wrappers de compatibilidade
hooks/      # wrappers de compatibilidade
utils/      # wrappers de compatibilidade
lib/        # wrappers de compatibilidade
prisma/
public/
docs/
```

## What changed

- Novas fontes principais em `shared/*` e `features/*`.
- Pastas antigas (`contexts`, `hooks`, `utils`, `lib`) permanecem como wrappers para manter compatibilidade.
- Imports podem ser migrados gradualmente sem quebrar o app.

## Import strategy

Aliases adotados:
- `@/shared/contexts/*`
- `@/shared/hooks/*`
- `@/shared/lib/*`
- `@/shared/supabase/*`
- `@/features/tree/lib/*`

Compatibilidade legada:
- `@/contexts/*`
- `@/hooks/*`
- `@/utils/*`
- `@/lib/*`

## Why this direction

- Mantem o projeto simples (um monolito Next.js).
- Melhora separacao de responsabilidades.
- Permite evolucao por dominio sem migracao "big bang".
- Reduz risco porque wrappers preservam caminhos antigos.

## How to explain this change

Use este resumo:

"Antes, o projeto funcionava com pastas globais (`contexts`, `hooks`, `utils`, `lib`).  
Agora, a fonte principal foi organizada em `shared` (cross-domain) e `features` (dominio).  
Mantivemos wrappers legados para nao quebrar imports antigos e permitir migracao gradual."

## Next steps

1. Continuar migrando imports para `@/shared/*` e `@/features/*`.
2. Quando nao houver mais dependencia legada, remover wrappers antigos.
3. Manter novas features (ex.: achievements/settings) no padrao `features/*` + `shared/*`.
