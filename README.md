# ERP Moda — Gestão para lojas de moda

App web (PWA) para micro e pequenos varejistas de moda organizarem produtos, estoque, vendas
e caixa. Posicionamento: **não é um ERP** — é o jeito mais simples de cuidar da loja.
Construído com simplicidade radical (ver `ui-design-direction.md`).

## Documentos de produto (na raiz)

- `requisitos-mvp-gestao-loja-moda.md` — requisitos, personas, ondas, priorização
- `posicionamento-e-proposta-de-valor.md` — marca, diferencial, 10 leis de design
- `arquitetura-de-dominio.md` — modelo de domínio e invariantes
- `stack-tecnologica.md` — decisões de stack
- `ui-design-direction.md` — direção visual
- `prototipo/index.html` — protótipo navegável dos 5 fluxos

## Stack

Monorepo TypeScript (pnpm + Turborepo):

| Pacote | O que é |
|--------|---------|
| `apps/api` | API **NestJS** + **Prisma** (PostgreSQL) |
| `apps/web` | Front **React + Vite** (PWA) — *próxima fase* |
| `packages/shared` | Tipos e schemas **Zod** compartilhados (fonte única) |

## Pré-requisitos

- Node ≥ 20, pnpm ≥ 9
- Um PostgreSQL de desenvolvimento. Sem Docker aqui → use **Supabase** ou **Neon**
  (planos grátis). Crie o banco e pegue a *connection string*.

## Setup

```bash
pnpm install

# configurar o banco
cp apps/api/.env.example apps/api/.env
#  → cole a DATABASE_URL do Supabase/Neon no .env

# gerar client + criar as tabelas
pnpm db:generate
pnpm db:migrate          # cria a primeira migração (Onda 1)

# rodar
pnpm dev                 # sobe api (e web, quando existir)
# health check: http://localhost:3333/api/health
```

## Princípios de arquitetura (resumo)

- **Multi-tenant por linha** (`tenantId` em tudo) + **RLS** no Postgres — isolamento à prova
  de esquecimento. *(As policies RLS entram numa migração SQL dedicada na Fase 1.)*
- **Estoque e Caixa são ledgers** (append-only); saldo é cache reconciliável.
- **Venda imutável**: cancelar = estornar. Transação atômica num único `prisma.$transaction`.
- **Dinheiro em centavos** (inteiro), **UUID v7**, sem hard-delete.
- **Fiscal opt-in** atrás de um adaptador `ProvedorFiscal` (Focus NFe na Onda 3).

## Roadmap de construção

- **Fase 0 — Fundação** ✅ monorepo, schema, shared, bootstrap
- **Fase 1 — Identidade** conta/loja, login JWT, contexto de tenant + RLS, seed
- **Fase 2 — Catálogo** · **Fase 3 — Estoque** · **Fase 4 — Venda** · **Fase 5 — Caixa + Dashboard**
