# PawSpace | Hub Visual de Estudos

<div align="center">
  <img src="./src/app/favicon.ico" width="120" alt="PawSpace Logo" style="border-radius: 50%">
  <p>Espaço digital para mapear trilhas de estudo, organizar materiais, registrar sessões e acompanhar progresso com clareza.</p>
  <a href="https://pawspace-alpha.vercel.app/"><strong>Acessar Plataforma</strong></a>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
</div>

---

## Visão Geral

O PawSpace foi pensado como um ecossistema de estudos conectado, e não como um conjunto de ferramentas soltas. A plataforma une uma árvore visual de aprendizado, uma estante contextual de materiais, um diário de estudo e um painel de progresso em um fluxo único, para que planejar, estudar, revisar e medir evolução aconteçam no mesmo ambiente.

Em vez de depender de abas perdidas, notas espalhadas e memória, o projeto mantém cada recurso ligado ao seu contexto real de aprendizado. A filosofia central do produto prioriza **clareza**, **continuidade** e **organização com pouco atrito**, ajudando o usuário a entender o que estudar, por que aquilo importa e como seu processo está evoluindo ao longo do tempo.

## Destaques Técnicos

* **Mapeamento visual de aprendizado:** o usuário pode montar árvores de estudo com dependências entre nós, metadados personalizados e posicionamento livre para visualizar progressão e prioridades.
* **Estante contextual de materiais:** cada trilha pode guardar links, vídeos, notas e PDFs privados, mantendo o conteúdo vinculado ao caminho de estudo que ele realmente apoia.
* **Diário integrado ao fluxo:** sessões, reflexões e revisões podem ser registradas e associadas a trilhas específicas, criando uma memória duradoura do processo.
* **Métricas acionáveis de progresso:** o painel consolida cobertura da árvore, atividade recente, densidade de materiais e sinais estruturais para revelar lacunas e pontos críticos.
* **Conquistas e marcos visíveis:** o sistema de achievements transforma progresso na árvore, no diário e na estante em sinais concretos de evolução.
* **Autenticação e armazenamento seguros:** login, arquivos protegidos, avatar e fluxos de conta usam Supabase, com Cloudflare Turnstile reforçando interações sensíveis.

## Áreas do Produto

* **Árvore:** mapa visual para estruturar dependências, priorizar módulos e enxergar o território antes de mergulhar no estudo.
* **Estante:** repositório contextual para links, PDFs, notas e referências conectadas diretamente a cada trilha.
* **Diário:** espaço leve para registrar sessões, insights e revisões com continuidade histórica.
* **Painel:** visão consolidada de progresso, atividade e cobertura em uma única camada operacional.
* **Conquistas:** sistema de motivação que destaca marcos reais dentro do workspace.

## Stack Tecnológica

* **Framework principal:** Next.js 16 com App Router e React 19.
* **Linguagem:** TypeScript.
* **Estilização:** Tailwind CSS 4.
* **Acesso ao banco:** Prisma ORM.
* **Infraestrutura backend:** Supabase Authentication, PostgreSQL e Storage.
* **Arquivos:** entrega privada de PDFs via signed URLs e processamento de avatar no servidor com Sharp.
* **Proteção contra abuso:** Cloudflare Turnstile integrado aos fluxos sensíveis de autenticação.
* **Deploy:** Vercel.

## Desenvolvimento Local

### Requisitos

* Node.js 20+
* PostgreSQL
* Um projeto Supabase

### Variáveis de Ambiente

Crie um arquivo `.env` com base no `.env.example` e configure:

```bash
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
CRON_SECRET=""
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
```

### Setup

```bash
npm install
npm run db:migrate:dev
npm run dev
```

## Scripts Disponíveis

* `npm run dev` inicia o servidor local.
* `npm run build` gera a build de produção.
* `npm run start` sobe a aplicação em modo produção.
* `npm run lint` executa o ESLint.
* `npm run db:generate` executa `prisma generate`.
* `npm run db:status` verifica o status das migrations.
* `npm run db:migrate:dev` cria e aplica migrations em desenvolvimento.
* `npm run db:migrate:deploy` aplica migrations em produção.
* `npm run db:studio` abre o Prisma Studio.

## Notas de Deploy

Em produção, configure as variáveis de ambiente na Vercel e alinhe o Supabase Auth com o domínio publicado:

* Defina a `Site URL` de produção no Supabase Auth.
* Libere os redirects necessários, como `/auth/callback` e `/reset-password`.
* Configure SMTP no Supabase para confirmação de e-mail, recuperação de senha e troca de e-mail.
* Adicione `SUPABASE_SERVICE_ROLE_KEY` para que upload de avatar, operações protegidas de storage e exclusão de conta funcionem corretamente.
* Defina `CRON_SECRET` na Vercel para proteger o endpoint `/api/keep-alive` usado pelo cron de keep-alive.
* Nunca rode `prisma migrate dev` em produção; use `npm run db:migrate:deploy`.

---

<div align="center">
  <p>Construído para dar clareza, continuidade e intenção ao processo de aprender.</p>
</div>
