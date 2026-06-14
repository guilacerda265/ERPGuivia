# Stack Tecnológica & Arquitetura Técnica

> **Resumo:** TypeScript de ponta a ponta num **monorepo** (`api` NestJS · `web` React+Vite PWA
> · `shared` tipos/Zod). **PostgreSQL** com **Row-Level Security** como mecanismo de isolamento
> multi-tenant. **Prisma** como ORM, com a transação atômica de venda dentro de um
> `$transaction`. Stack escolhida para um cenário **solo + construção com IA**: tudo
> mainstream, fortemente tipado e bem documentado — o compilador e os tipos compartilhados
> substituem parte da revisão humana que você não tem.

Decisões anteriores: backend **TypeScript + NestJS**, banco **PostgreSQL** (já fixado pelos
requisitos transacionais). Este doc fecha o resto. Base: `arquitetura-de-dominio.md`.

---

## 1. A stack, camada por camada

| Camada | Escolha | Por que esta (no seu contexto solo + IA) |
|--------|---------|-------------------------------------------|
| **Linguagem** | TypeScript (front + back + shared) | Uma linguagem só; tipos atravessam a rede; IA tem máximo treino nela. |
| **Backend** | **NestJS** | Estrutura opinativa (DI + módulos) que mapeia 1:1 nos *bounded contexts* do domínio — mantém um código construído com IA organizado e previsível. |
| **ORM** | **Prisma** | Melhor DX e a melhor documentação (a IA erra menos). Schema declarativo = fonte única do modelo. *Alternativa: Drizzle, se quiser SQL-first.* |
| **Banco** | **PostgreSQL** | Transação atômica de venda + ledger + **RLS** para multi-tenant. Inegociável. |
| **Validação** | **Zod** (via `nestjs-zod`) | Um schema valida no back **e** no front. Sem duplicar regra. |
| **Auth** | JWT (access+refresh) + Argon2; Passport no Nest | `tenant_id` e `papel` (DONO/VENDEDOR) nas claims. Controle total do multi-tenant. |
| **Frontend** | **React + Vite** + `vite-plugin-pwa` (Workbox) | SPA instalável (PWA), mobile-first p/ o balcão. Vite = build rápido. |
| **UI** | **Tailwind CSS + shadcn/ui** (Radix) | Componentes que você copia e molda — UX custom e simples sem brigar com um design system pronto. Muito amigável a IA. |
| **Dados no front** | **TanStack Query** + React Hook Form + Zod | Cache/refetch do dashboard e listas; formulários tipados. |
| **Monorepo** | **pnpm workspaces + Turborepo** | `shared` exporta tipos, enums (FormaPagamento, TipoMovimento) e schemas Zod p/ os dois lados. |
| **Storage** | **Supabase** (Postgres gerenciado + Storage) | Menos peças de infra p/ solo: banco + arquivos (fotos de produto, XML/DANFE) num lugar. *Alt.: Neon + Cloudflare R2.* |
| **Filas (Onda 3)** | BullMQ (Redis) | Emissão fiscal assíncrona ao Focus NFe. Só quando o fiscal entrar. |
| **Testes** | Vitest (unit) · Supertest (e2e Nest) · **Playwright** (fluxos críticos) | Playwright cobre "venda rápida" — liga direto na estratégia de validação. |
| **Deploy** | API: **Railway/Render** · Web: **Vercel/Cloudflare Pages** | Deploy de container e estático, baratos e simples. |
| **Qualidade** | ESLint + Prettier + tsconfig `strict` + Husky | Guard-rails automáticos — críticos quando não há revisor humano. |

**Detalhes de domínio:** UUID **v7** (ordenado por tempo — melhor índice no ledger);
dinheiro como **inteiro de centavos** (`number`/`bigint`, nunca float); datas em UTC.

---

## 2. Como a stack honra as decisões de domínio

### Módulos NestJS = bounded contexts
Um módulo por contexto, espelhando o domínio:
```
api/src/modules/
  identity/    → Tenant, Usuario, Auth, papéis
  catalog/     → Produto, Variacao, Categoria
  inventory/   → SaldoEstoque, MovimentoEstoque  (ledger)
  sales/       → Venda, ItemVenda, Pagamento
  cashier/     → LancamentoCaixa                  (ledger)
  customers/   → Cliente
  fiscal/      → ConfigFiscal, DocumentoFiscal, ProvedorFiscal (adapter)
```

### Multi-tenant por RLS (isolamento à prova de esquecimento)
A cada request autenticado, abre-se uma transação que faz
`SET LOCAL app.tenant_id = '<id>'`; as **políticas RLS** no Postgres filtram por
`current_setting('app.tenant_id')`. Mesmo se um código esquecer o `where tenant_id`, o banco
**não devolve** dados de outro tenant. (No Prisma, via *client extension* que injeta o `SET
LOCAL` na transação.)

### A transação atômica de venda
Um método de serviço em `sales` envolve **um único** `prisma.$transaction` que, tudo-ou-nada:
1. cria `Venda` + `ItemVenda[]` (com snapshot de preço/cor/tamanho) + `Pagamento[]`;
2. grava um `MovimentoEstoque(VENDA)` por item **e** atualiza o `SaldoEstoque` (com
   `SELECT … FOR UPDATE` ou incremento atômico p/ concorrência);
3. grava o(s) `LancamentoCaixa(ENTRADA)`.

Se qualquer passo falha, **nada** é gravado — a invariante de atomicidade (§4 do domínio) vira
garantia do banco, não promessa do código. Cancelamento espelha isso com movimentos de
reversão.

### O adaptador fiscal (porta para trocar Focus ↔ ACBr)
`ProvedorFiscal` é uma **interface** (Nest `@Injectable` com token de DI):
```ts
interface ProvedorFiscal {
  emitir(venda: Venda): Promise<DocumentoFiscal>;
  cancelar(doc: DocumentoFiscal): Promise<void>;
  consultar(doc: DocumentoFiscal): Promise<StatusFiscal>;
}
```
`FocusNfeProvider implements ProvedorFiscal` (Onda 3). Trocar por `AcbrProvider` na Onda 4 é
mudar **uma linha** de binding no módulo — o domínio nunca sabe quem emite. (É a trava da
§2.1 do posicionamento, lição da Nuvem Fiscal, agora concreta no código.)

---

## 3. Estrutura do monorepo

```
erp/
  apps/
    api/           NestJS  (Prisma schema, módulos por contexto)
    web/           React + Vite + PWA
  packages/
    shared/        tipos, enums de domínio, schemas Zod (fonte única)
    config/        eslint, tsconfig, tailwind presets
  turbo.json  ·  pnpm-workspace.yaml
```
O `packages/shared` é o que dá **type-safety de ponta a ponta**: o mesmo schema Zod valida o
corpo da request no Nest e o formulário no React; o mesmo enum `FormaPagamento` vale nos dois
lados. Para quem constrói com IA, isso é o maior multiplicador de velocidade e segurança.

---

## 4. Guard-rails para construir com IA (sem time revisando)

Como não há revisor humano, o ambiente precisa pegar o erro:
- **`tsconfig` em `strict` + `noUncheckedIndexedAccess`** — o compilador é o primeiro revisor.
- **Zod nas fronteiras** — todo dado externo (request, env, resposta do Focus) é validado; nada de `any` cruzando a borda.
- **RLS ligado desde o primeiro dia** — isolamento não depende de lembrar de filtrar.
- **Testes dos fluxos críticos em Playwright** — "venda rápida" e "fechar caixa" rodando em CI viram a rede de segurança da estratégia de validação.
- **Migrations versionadas (Prisma Migrate)** — schema evolui com histórico, nunca na mão.
- **Convenção módulo-por-contexto** — peça à IA para criar features *dentro* do contexto certo; evita o espaguete que IA gera quando o projeto não tem estrutura.

---

## 5. O que NÃO entra agora (evitar over-engineering)

| Tentação | Veredito | Quando |
|----------|----------|--------|
| Microserviços | ❌ Monólito modular (NestJS já é modular) | Talvez nunca; o monólito escala muito |
| GraphQL / tRPC | ❌ REST + Zod basta | Reavaliar se o front ficar complexo |
| Kubernetes | ❌ Container simples (Railway/Render) | Só com escala real |
| Redis/filas | ⏳ Só na Onda 3 (emissão fiscal async) | Onda 3 |
| Event sourcing "puro" | ❌ O ledger já dá auditoria sem a complexidade | — |

> Princípio: a mesma **simplicidade radical** que rege a UX rege a arquitetura. Cada peça de
> infra adicionada é "imposto" que um fundador solo paga em manutenção.

---

## 6. Próximo passo

Com a stack fechada, dá pra:
1. **Inicializar o monorepo** (scaffold `apps/api` NestJS + `apps/web` Vite + `packages/shared`) — posso gerar essa fundação.
2. **Traduzir o `arquitetura-de-dominio.md` no `schema.prisma`** (entidades, relações, índices, enums) — é o artefato que destrava o backend.
3. **Etapa 2 — UX** dos 5 fluxos, agora sabendo que são telas React+Tailwind sobre a API Nest.

---

*Documento vivo — v1. Stack é compromisso, não dogma: mudou uma restrição, revise aqui antes
de trocar peça.*
