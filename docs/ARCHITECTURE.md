# Skilltree Architecture

## Current direction

This project is a Next.js monolith (`app/` router) with frontend and backend code in the same repo.  
For this codebase, this is a good fit and does not need a `backend/` + `frontend/` split right now.

## Folder strategy

- Keep route entrypoints in `app/` thin.
- Keep domain logic grouped by feature.
- Keep reusable cross-domain code in `shared/`.

## Adopted aliases in this phase

- `@/shared/contexts/*`
- `@/shared/supabase/*`
- `@/shared/hooks/*`
- `@/features/tree/lib/*`

Compatibility is preserved with existing paths (`contexts/*`, `utils/*`, `hooks/*`), so migration can be gradual.

## Suggested target structure

```txt
app/
  actions/
  (routes...)
features/
  tree/
    lib/
  library/
  journal/
  overview/
shared/
  contexts/
  hooks/
  lib/
  supabase/
lib/
prisma/
public/
docs/
```

## Next migration steps

1. Keep migrating imports to `@/shared/*` and `@/features/*` (old paths remain wrappers for now).
2. After migration is stable, remove legacy folders (`contexts/`, `hooks/`, `utils/`) or keep only explicit compatibility shims.
3. Remove legacy folder wrappers only when no external reference depends on old paths.
