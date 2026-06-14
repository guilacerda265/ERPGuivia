# Requisitos do MVP — Sistema de Gestão para Lojas de Moda

> **Resumo (leia isto se só vai bater o olho):** App **web responsivo (PWA)** para micro e
> pequenos varejistas de moda organizarem produtos, estoque, vendas, caixa e clientes sem
> precisar de ERP. Cobre **multi-loja (até 5)** desde o início. **Sem prazo de entrega:** o
> alvo é um produto **completo e bem validado**, construído em **3 ondas validadas** (Ciclo
> central → Confiança → Completude), onde cada onda só avança após validação com lojistas
> reais. **Emissão fiscal (NFC-e via parceiro) é comprometida** (Onda 3), não opcional. A
> hipótese: o lojista que hoje usa caderno/Excel/WhatsApp **registra vendas e enxerga a saúde
> da loja** se a ferramenta for simples o bastante para ele se virar sozinho. A fronteira que
> protege isso: **completo ≠ virar ERP** — CRM, fidelidade, WMS e contabilidade ficam fora.

---

## 1. Decisões e premissas (a base do recorte)

Estas decisões foram tomadas com o stakeholder e recortam todo o documento. Onde não houve
decisão, assumi com bom senso e marquei como **premissa**.

| # | Decisão | Implicação |
|---|---------|-----------|
| D1 | **Plataforma: Web responsivo (PWA)** | Um único código roda no balcão (celular) e no escritório (desktop). Instalável, funciona offline-leve (cache). Acelera o lançamento. |
| D2 | **Emissão fiscal fora do MVP (fast-follow)** | A venda fecha e baixa estoque/caixa **sem** nota fiscal no MVP. NFC-e via parceiro (ex.: Focus/PlugNotas) vem na release seguinte. Reduz risco regulatório e esforço. |
| D3 | **Multi-loja desde o MVP (até 5 lojas)** | Estoque segregado por loja, seletor de loja, consolidação simples no dashboard. **Trade-off aceito:** adiciona escopo; por isso transferência entre lojas e permissões granulares ficam para depois. |

**Premissas assumidas (declaradas para não travar):**
- **P1 — Pagamento na venda:** registramos a *forma* de pagamento (dinheiro, Pix, débito, crédito) para o caixa, mas **não** integramos maquininha/gateway no MVP (entrada manual). 
- **P2 — Sem código de barras obrigatório:** busca de produto por nome/categoria; leitor de barras é fast-follow (a câmera do PWA permite, mas não bloqueia o MVP).
- **P3 — Conta = um negócio (tenant)** com 1 a 5 lojas e poucos usuários. Cobrança/planos não fazem parte deste documento (decisão de GTM separada).
- **P4 — Português-BR, Real (R$), fuso do Brasil.**

### Filosofia de construção (diretriz do stakeholder)

> **Não há prazo de entrega.** O objetivo é um produto **completo e bem validado**, mesmo
> que voltado a operações pequenas. Isso reconfigura a priorização:

- A faca de corte **deixa de ser "o que cabe no tempo"** e passa a ser **"o que mantém o
  produto simples e fiel ao posicionamento"**.
- Itens antes adiados por *esforço* (inventário, clientes, histórico/estorno, contas a
  vencer, guia, importação, **NFC-e**) **voltam ao escopo comprometido** — apenas
  **sequenciados em ondas validadas**, não cortados.
- Itens fora por *posicionamento* (CRM, cashback, fidelidade, WMS, contabilidade)
  **continuam fora**. *Completo ≠ virar ERP.* Essa fronteira protege a proposta de valor.
- **Nenhuma onda avança sem validação** com lojistas reais (ver seção 8.1). Qualidade e
  evidência > velocidade.

---

## 2. Personas

| Persona | Quem é | Dor principal | O que espera do produto |
|---------|--------|---------------|-------------------------|
| **Dona Cláudia — a lojista/dona** | Administra 1–3 lojas de roupa/calçado, faz um pouco de tudo. Vive no celular. Sem TI. | "Não sei quanto vendi, o que está acabando, nem quanto tenho em caixa. Anoto no caderno e me perco." | Entrar e em 1 minuto saber **como está a loja hoje**. Cadastrar e vender sem manual. |
| **Júnior — o vendedor de balcão** | Atende o cliente, fecha a venda. Pode não ser dono. | "Preciso fechar a venda rápido sem segurar o cliente. Não posso errar preço nem grade." | **Venda rápida**: achar o produto, escolher cor/tamanho, fechar e pronto. |
| **Seu Antônio — o dono multi-loja** | Tem 4 lojas, passa o dia entre elas. | "Cada loja tem um controle; não consigo comparar nem ver o todo." | Trocar de loja com 1 toque e ver o **consolidado** das lojas. |

**Persona primária do MVP: Dona Cláudia.** Júnior e Seu Antônio são atendidos, mas todo
trade-off de simplicidade resolve a favor da Cláudia.

---

## 3. Hipótese central do MVP

> **Acreditamos que** micro e pequenos varejistas de moda (que hoje usam caderno/Excel/
> WhatsApp) **vão registrar suas vendas e consultar a saúde da loja diariamente**
> **porque** a ferramenta é simples o bastante para usarem sozinhos, sem treinamento.
> **Saberemos que é verdade quando** ≥ 40% das lojas que se cadastram chegam à *ativação*
> (cadastram estoque inicial **e** registram ≥ 5 vendas em 14 dias) e ≥ 30% seguem
> **ativas na semana 4** (≥ 1 venda registrada).

Esta hipótese é a âncora: tudo que não serve a ela é candidato a sair do MVP.

---

## 4. Mapa de épicos

| Épico | Objetivo | Status no MVP |
|-------|----------|---------------|
| **E0 — Onboarding & Conta** | Lojista cria conta e a 1ª loja sozinho, em minutos | ✅ MVP |
| **E1 — Produtos** | Cadastro simples com grade de cor/tamanho e categoria | ✅ MVP |
| **E2 — Estoque** | Entradas, saídas, inventário e saldo atual **por loja** | ✅ MVP |
| **E3 — Vendas** | Venda rápida + histórico; baixa estoque e alimenta o caixa | ✅ MVP |
| **E4 — Caixa** | Entradas/saídas e fluxo diário | ✅ MVP |
| **E5 — Clientes** | Cadastro, contato e histórico de compras | ✅ MVP (enxuto) |
| **E6 — Dashboard** | "Como está minha loja hoje?" em uma tela | ✅ MVP |
| **E7 — Multi-loja** | Seletor de loja + consolidação simples | ✅ MVP (mínimo) |
| **E8 — Fiscal (NFC-e)** | Emissão de documento fiscal via parceiro | ⏭️ Fast-follow |
| **E9 — Contas a vencer** | Contas a pagar simples (alimenta o dashboard) | 🔶 Should — entra se couber |

---

## 5. User Stories com critérios de aceite

> Formato: *Como [persona], quero [ação], para [benefício].* Critérios em Dado/Quando/Então
> cobrem caminho feliz + uma borda + um erro. Cada história é uma **fatia vertical** (vai do
> clique ao valor), não uma camada técnica.

### E0 — Onboarding & Conta

**US-0.1 — Criar conta e primeira loja (self-service)**
> Como **lojista**, quero **criar minha conta e cadastrar minha loja sozinha**, para
> **começar a usar sem depender de ninguém**.

- **Dado** que abro o app pela primeira vez, **Quando** informo nome, e-mail/telefone, senha e o nome da loja, **Então** entro direto no dashboard com a loja já criada e selecionada.
- **Dado** que o e-mail já está cadastrado, **Quando** tento criar conta, **Então** recebo aviso claro e a opção de "entrar" em vez de duplicar.
- **Dado** que pulei algum campo obrigatório, **Quando** tento avançar, **Então** o campo é destacado com mensagem em linguagem simples (sem termo técnico).

**US-0.2 — Primeiros passos guiados**
> Como **lojista nova**, quero **um guia curto de 3 passos (cadastrar produto → registrar
> estoque → fazer 1ª venda)**, para **chegar ao valor sem me perder**.

- **Dado** que entrei pela 1ª vez, **Quando** vejo o dashboard, **Então** há um checklist de 3 passos com progresso.
- **Dado** que concluo um passo, **Quando** volto ao dashboard, **Então** o passo aparece marcado e o próximo é sugerido.
- **Dado** que já completei os 3 passos, **Quando** entro de novo, **Então** o guia some e dá lugar ao dashboard normal.

### E1 — Produtos

**US-1.1 — Cadastrar produto com grade de cor e tamanho**
> Como **lojista**, quero **cadastrar um produto com suas cores e tamanhos**, para
> **controlar o estoque por variação (ex.: Tênis X, Preto, 38)**.

- **Dado** que crio um produto, **Quando** informo nome, categoria, preço de venda e seleciono cores e tamanhos, **Então** o sistema gera automaticamente as variações (SKUs) da grade (ex.: 3 cores × 4 tamanhos = 12 variações).
- **Dado** que uma combinação não existe (ex.: cor só vai até o 40), **Quando** monto a grade, **Então** posso desmarcar variações específicas para não criá-las.
- **Dado** que tento salvar sem preço ou sem nenhuma variação, **Quando** confirmo, **Então** o sistema bloqueia e explica o que falta.

**US-1.2 — Gerenciar categorias**
> Como **lojista**, quero **organizar produtos por categoria (calçados, roupas, acessórios e
> subcategorias minhas)**, para **achar e analisar mais rápido**.

- **Dado** que cadastro um produto, **Quando** não acho a categoria, **Então** posso criar uma nova na hora sem sair da tela.
- **Dado** que tenho categorias, **Quando** filtro produtos, **Então** vejo só os daquela categoria.

**US-1.3 — Buscar e editar produto**
> Como **vendedor**, quero **buscar um produto por nome**, para **achar rápido durante o
> atendimento**.

- **Dado** que digito parte do nome, **Quando** busco, **Então** vejo resultados em tempo real com foto/cor/preço.
- **Dado** que abro um produto, **Quando** edito preço ou grade, **Então** a mudança vale para vendas futuras (não altera vendas já feitas).

### E2 — Estoque (por loja)

**US-2.1 — Registrar entrada de estoque**
> Como **lojista**, quero **dar entrada nas peças que chegaram**, para **meu saldo refletir
> o que tenho de verdade**.

- **Dado** que recebi mercadoria, **Quando** seleciono produto/variações e informo quantidades (e opcionalmente custo), **Então** o saldo **da loja selecionada** aumenta e fica registrado com data.
- **Dado** que dei entrada errada, **Quando** abro o histórico de movimentações, **Então** consigo estornar/ajustar com registro de quem e quando.

**US-2.2 — Ver saldo atual por variação**
> Como **lojista**, quero **ver quanto tenho de cada cor/tamanho**, para **saber o que repor**.

- **Dado** que abro um produto, **Quando** vejo a grade, **Então** cada célula mostra o saldo atual **da loja atual**.
- **Dado** que uma variação está com saldo ≤ limite mínimo, **Quando** olho a grade/lista, **Então** ela é sinalizada visualmente ("acabando").

**US-2.3 — Inventário (acerto de contagem)**
> Como **lojista**, quero **conferir e ajustar o estoque por contagem física**, para
> **corrigir divergências sem cálculo manual**.

- **Dado** que faço uma contagem, **Quando** informo a quantidade real de cada variação, **Então** o sistema calcula a diferença e ajusta o saldo, registrando um movimento de "acerto de inventário".
- **Dado** que não contei um item, **Quando** finalizo o inventário, **Então** os itens não contados ficam inalterados (não zeram).

### E3 — Vendas

**US-3.1 — Venda rápida**
> Como **vendedor**, quero **fechar uma venda em poucos toques**, para **não segurar o
> cliente no balcão**.

- **Dado** que inicio uma venda, **Quando** busco e adiciono produtos escolhendo cor/tamanho e quantidade, **Então** o total atualiza em tempo real.
- **Dado** que confirmo a venda informando a forma de pagamento, **Quando** finalizo, **Então** (a) o estoque **da loja atual** baixa nas variações vendidas, (b) o valor entra no caixa do dia, (c) recebo confirmação visual.
- **Dado** que tento vender uma variação sem saldo, **Quando** adiciono, **Então** o sistema avisa e (premissa) permite continuar com confirmação explícita ("venda sem estoque") — registrando o saldo negativo para acerto posterior.
- **Dado** que aplico um desconto, **Quando** finalizo, **Então** o desconto fica registrado na venda e refletido no caixa.

**US-3.2 — Vincular cliente à venda (opcional)**
> Como **vendedor**, quero **associar a venda a um cliente**, para **montar o histórico de
> compras dele**.

- **Dado** que estou fechando a venda, **Quando** busco um cliente existente ou cadastro um novo na hora (só nome + telefone), **Então** a venda fica vinculada a ele.
- **Dado** que não quero identificar, **Quando** finalizo, **Então** a venda é registrada como "consumidor não identificado" sem travar.

**US-3.3 — Histórico de vendas**
> Como **lojista**, quero **ver minhas vendas passadas**, para **conferir e entender o
> movimento**.

- **Dado** que abro o histórico, **Quando** filtro por período/loja, **Então** vejo lista com data, itens, valor, forma de pagamento e vendedor.
- **Dado** que uma venda foi registrada errada, **Quando** a abro, **Então** posso **cancelar/estornar** a venda, devolvendo o estoque e ajustando o caixa (com registro do motivo).

### E4 — Caixa

**US-4.1 — Fluxo de caixa diário**
> Como **lojista**, quero **ver o que entrou e saiu de dinheiro no dia**, para **saber
> quanto tenho disponível**.

- **Dado** que houve vendas, **Quando** abro o caixa do dia, **Então** vejo as entradas automáticas das vendas somadas por forma de pagamento.
- **Dado** que tive uma despesa (ex.: paguei um fornecedor, sangria), **Quando** registro uma saída manual com descrição e valor, **Então** o saldo do dia é atualizado.
- **Dado** que viro o dia, **Quando** abro o caixa, **Então** vejo o dia atual zerado de movimentos novos, com o histórico dos dias anteriores acessível.

**US-4.2 — Resumo por forma de pagamento**
> Como **lojista**, quero **ver quanto entrou em dinheiro, Pix, débito e crédito**, para
> **conferir com a maquininha e o caixa físico**.

- **Dado** que filtro um período, **Quando** abro o resumo, **Então** vejo o total por forma de pagamento.

### E5 — Clientes (enxuto)

**US-5.1 — Cadastro simples de cliente**
> Como **lojista**, quero **cadastrar clientes com contato**, para **me relacionar e ver o
> que já compraram**.

- **Dado** que cadastro um cliente, **Quando** informo no mínimo nome e telefone, **Então** ele fica disponível para vincular em vendas.
- **Dado** que abro um cliente, **Quando** vejo o perfil, **Então** vejo o **histórico de compras** dele (datas, itens, valores) e um botão de contato (abre WhatsApp/telefone).

> **Nota de escopo:** CRM, cashback, fidelidade e campanhas **não** entram (decisão de
> posicionamento — fora do produto). Cliente aqui é cadastro + histórico, só.

### E6 — Dashboard

**US-6.1 — "Como está minha loja hoje?"**
> Como **lojista**, quero **uma tela inicial com a saúde da loja**, para **decidir o dia em
> segundos**.

- **Dado** que entro no app, **Quando** o dashboard carrega, **Então** vejo, da loja selecionada (ou consolidado): **vendas do dia**, **faturamento do mês**, **caixa disponível**, **produtos acabando**, **produtos sem venda** (período configurável, padrão 30 dias) e **contas a vencer** (se E9 entrar).
- **Dado** que clico em "produtos acabando", **Quando** abro, **Então** vou para a lista filtrada pronta para repor.
- **Dado** que não há dados ainda (loja nova), **Quando** vejo o dashboard, **Então** cada card mostra um estado vazio com a próxima ação ("cadastre seu primeiro produto").

### E7 — Multi-loja (mínimo viável)

**US-7.1 — Trocar de loja**
> Como **dono multi-loja**, quero **alternar entre minhas lojas com 1 toque**, para
> **trabalhar na loja certa**.

- **Dado** que tenho mais de uma loja, **Quando** uso o seletor no topo, **Então** dashboard, estoque, vendas e caixa passam a refletir a loja escolhida.
- **Dado** que cadastro um produto, **Quando** salvo, **Então** ele pertence ao **catálogo da conta** (compartilhado), mas o **estoque é por loja**.

**US-7.2 — Visão consolidada**
> Como **dono multi-loja**, quero **uma visão "todas as lojas"**, para **comparar e ver o
> todo**.

- **Dado** que seleciono "todas as lojas", **Quando** abro o dashboard, **Então** vejo faturamento e vendas somados e uma comparação simples por loja.

**US-7.3 — Acesso por papel (básico)**
> Como **dono**, quero **dar acesso ao meu vendedor sem que ele veja tudo**, para
> **controlar o que cada um faz**.

- **Dado** que convido um usuário como **Vendedor**, **Quando** ele entra, **Então** ele acessa venda/estoque da(s) loja(s) atribuída(s), mas **não** vê faturamento consolidado nem configurações.
- **Dado** que sou **Dono**, **Quando** entro, **Então** vejo tudo de todas as lojas.

> **Fora deste épico no MVP:** transferência de estoque entre lojas e permissões granulares
> (ficam no backlog pós-MVP).

---

## 6. Onda 1 (Ciclo central) — In / Out

> A primeira fatia a construir e validar. "Out" aqui significa **outra onda** (comprometido,
> mais tarde) ou **fora do produto** (nunca) — está sinalizado em cada linha.

| Entra na Onda 1 (In) | Fica de fora (Out) | Natureza |
|----------------------|--------------------|----------|
| Onboarding self-service | Guia 3 passos / importação por planilha | Onda 2 / Onda 3 |
| Produtos com grade cor/tamanho + categorias | Variações além de cor/tamanho (ex.: material) | Fora do produto (evita complexidade) |
| Estoque: entrada, saída, saldo **por loja** | Inventário (acerto) · múltiplos depósitos/WMS | Onda 2 · Fora do produto |
| Venda rápida (baixa estoque + caixa) | Histórico/estorno · integração maquininha/gateway | Onda 2 · Backlog (P1: entrada manual) |
| Caixa diário + resumo por forma de pgto | DRE, conciliação, contabilidade | Fora do produto (não é ERP) |
| Cliente vinculável na venda (cadastro mínimo) | Perfil/histórico de cliente · CRM/cashback/fidelidade | Onda 2 · **Fora do produto (posicionamento)** |
| Dashboard de saúde da loja | Relatórios/BI customizável | Fora do produto |
| Multi-loja: seletor + consolidação + papéis básicos | Transferência entre lojas, permissões granulares | Backlog (futuro) |
| — | **Emissão fiscal (NFC-e via parceiro)** | **Onda 3 (comprometido)** |
| — | Código de barras / leitor | Onda 3 |

**Teste do fluxo ponta-a-ponta (sem becos):**
Criar conta → cadastrar produto com grade → dar entrada no estoque → fazer venda rápida →
ver baixa no estoque e entrada no caixa → abrir o dashboard e enxergar o dia. ✅ A Onda 1
fecha o ciclo de valor sozinha — é o que validamos antes de seguir.

---

## 7. Priorização

### 7.1 Escopo do produto por onda validada

> Sem prazo, a priorização não é "o que cortar para lançar", e sim **em que ordem construir
> e validar**. Todos os itens abaixo (exceto os "Fora do produto") estão **comprometidos** —
> o que muda é a **onda**. Uma onda só começa quando a anterior passou nos critérios de
> validação (seção 8.1).

| Item | Onda | Por quê nessa onda |
|------|------|--------------------|
| Onboarding + criar 1ª loja | **1 — Ciclo central** | Porta de entrada |
| Produto com grade + categoria | **1 — Ciclo central** | Base de tudo; sem grade não há estoque de moda |
| Estoque: entrada/saída/saldo por loja | **1 — Ciclo central** | Coração do controle |
| Venda rápida (baixa estoque + caixa) | **1 — Ciclo central** | Evento que gera valor e a métrica-chave |
| Caixa diário | **1 — Ciclo central** | "Quanto tenho?" é a pergunta nº 1 |
| Dashboard de saúde | **1 — Ciclo central** | A promessa central do produto |
| Multi-loja (seletor + consolidação + papéis) | **1 — Ciclo central** | Decisão D3; afeta a modelagem desde já |
| Histórico + estorno de venda | **2 — Confiança** | Erro de venda é comum; dá segurança para o lojista confiar nos números |
| Inventário (acerto de contagem) | **2 — Confiança** | Mantém o saldo fiel à realidade — o que separa de uma planilha |
| Clientes (cadastro + histórico + contato) | **2 — Confiança** | Valor real; a venda já vincula cliente desde a Onda 1 |
| Guia de primeiros passos | **2 — Confiança** | Eleva ativação após o fluxo central estar estável |
| Contas a vencer (E9) | **3 — Completude** | Completa o dashboard ("o que vou pagar") |
| **Emissão fiscal NFC-e (via parceiro)** | **3 — Completude** | **Comprometido** (não mais "fast-follow opcional"); core de varejo BR |
| Importação de produtos por planilha | **3 — Completude** | Tira a fricção de quem já tem catálogo |
| Leitor de código de barras (câmera) | **3 — Completude** | Acelera venda e entrada |
| CRM, cashback, fidelidade, campanhas | **Fora do produto** | Posicionamento — não entra |
| WMS, múltiplos depósitos, contabilidade, DRE, BI customizável | **Fora do produto** | Vira ERP — fere a proposta de valor |
| Integração SEFAZ própria | **Fora do produto** | Risco regulatório; usamos parceiro |
| Transferência de estoque entre lojas, permissões granulares | **Backlog (futuro)** | Avaliar conforme demanda real de multi-loja |

#### Atualização de escopo (14/06/2026) — novos itens por onda

> Revisão de escopo com o stakeholder. **Aviso:** quase dobra o domínio; por isso a maioria
> desce para Ondas 2–3 e a Onda 1 fica na espinha transacional. Detalhe das entidades em
> `arquitetura-de-dominio.md` §6.

| Novo item | Onda | Nota |
|-----------|------|------|
| Marca + Coleção/estação no produto | **1** | Como o lojista de moda pensa o catálogo |
| Precificação básica (custo + markup → preço/margem) | **1** | Composição de preço; rateio de frete/impostos fica p/ Onda 3 |
| Fornecedor + entrada com custo | **1** | Pré-requisito de custo rastreável e reposição |
| Caixa com abertura/fechamento (sessão + contagem) | **1** | Antes estava fora; entra leve, sem virar ritual |
| Formas de pagamento configuráveis + pagamento misto | **1** | Base; condições/bandeiras vêm na Onda 2 |
| Comprovante de venda **não-fiscal** (recibo) | **1** | Balcão precisa de comprovante antes da NFC-e |
| Níveis de acesso (Dono/Vendedor) | **1** | Já no domínio; confirmado em escopo |
| **Crediário / contas a receber (fiado)** | **2** | *Killer feature* — o caderno de fiado virando produto |
| Troca & devolução + vale-troca | **2** | Evento nº 1 do varejo de moda |
| Condições de parcelamento + bandeiras/taxas de cartão + conciliação | **2** | "Planos de pagamento" = ambos (decisão do stakeholder) |
| Comissão de vendedor | **2** | Par do cadastro de vendedores |
| Metas de venda (vendedor/loja) + relatórios | **3** | Acompanhamento realizado × meta |
| Precificação avançada (rateio frete/impostos, margem detalhada) | **3** | Refina a composição de preço da Onda 1 |

### 7.2 RICE — ordenação **dentro** das Ondas 2 e 3

> Os itens já estão comprometidos (seção 7.1); o RICE só ajuda a ordená-los entre si e a
> decidir o que vem primeiro dentro de cada onda — não a decidir se entram.

`Score = (Reach × Impact × Confidence) / Effort`. Reach = % de lojas impactadas/mês;
Impact: 3 massivo · 2 alto · 1 médio · 0.5 baixo; Confidence em %; Effort em pessoa-mês.

| Item | Reach | Impact | Conf. | Effort | **Score** | Por que nessa posição |
|------|-------|--------|-------|--------|-----------|------------------------|
| **Emissão fiscal NFC-e (parceiro)** | 0.7 | 3 | 80% | 2.5 | **0.67** | Desbloqueia lojas que *precisam* de nota; maior alavanca de receita/retenção |
| **Importação de produtos por planilha** | 0.8 | 2 | 80% | 1.0 | **1.28** | Tira a maior fricção do onboarding de quem já tem catálogo |
| **Leitor de código de barras (câmera)** | 0.6 | 2 | 70% | 1.0 | **0.84** | Acelera venda e entrada; usa hardware que já existe |
| **Integração maquininha/gateway** | 0.5 | 2 | 50% | 3.0 | **0.17** | Alto valor, mas esforço e dependências altas |
| **Transferência de estoque entre lojas** | 0.3 | 2 | 70% | 1.5 | **0.28** | Só impacta multi-loja; nicho dentro do nicho |
| **Relatórios/exportação (PDF/Excel)** | 0.6 | 1 | 80% | 1.0 | **0.48** | Bom ter; não muda o uso diário |

> Ordem sugerida: **Importação de planilha → NFC-e → Leitor de barras → Relatórios →
> Transferência entre lojas → Gateway.** (Importação tem score alto e esforço baixo —
> destrava o cadastro já; NFC-e vem logo por ser a maior alavanca estratégica.)

---

## 8. Validação e métricas

### 8.1 Estratégia de validação por onda (o "bem validado")

> A diretriz é **produto completo e bem validado**. Logo, cada onda passa por um ciclo de
> validação antes da próxima começar. Validar não é "testar se funciona" — é **confirmar com
> lojistas reais que resolve a dor e que eles usam sozinhos**.

**Mecanismo contínuo (todas as ondas):**
- **3–5 lojistas-parceiros do ICP** acompanhando desde o protótipo (continuous discovery): entrevistas quinzenais + acesso antecipado.
- **Teste de usabilidade sem assistência:** a pessoa realiza a tarefa-chave da onda sozinha, sem treinamento. Medimos conclusão e pontos de travamento.
- **Instrumentação de produto:** eventos de ativação, conclusão de fluxo e abandono (alimentam a seção 8.2).
- **Diário de fricção:** toda dúvida/suporte vira item de backlog de simplicidade.
- **Definição de Simples (gate de "pronto"):** além dos critérios de aceite, toda história passa no **teste dos 5 segundos** — a Cláudia entende a tela e sabe o próximo passo em 5s, sem ajuda. Falhou, não está pronta. Lei de design completa em `posicionamento-e-proposta-de-valor.md`.

**Critérios de avanço (gate) entre ondas — só passa quem cumprir:**

| Onda | Pergunta de validação | Critério para avançar |
|------|----------------------|------------------------|
| **1 — Ciclo central** | O lojista consegue, sozinho, cadastrar, vender e ler o dashboard? | ≥ 85% completam o fluxo ponta-a-ponta sem ajuda; ≥ 40% de ativação; NPS de tarefa positivo |
| **2 — Confiança** | Ele passa a confiar nos números a ponto de largar o caderno/planilha? | ≥ 30% ativos na semana 4; ≥ 50% usam inventário/estorno ao menos 1×/mês; relato de "abandonei a planilha" |
| **3 — Completude** | A emissão fiscal e os complementos cobrem a operação real sem fricção? | ≥ X% das vendas com NFC-e emitida sem erro; importação reduz tempo de cadastro inicial em ≥ 50% |

### 8.2 Métricas de sucesso

| Camada | Métrica | Alvo inicial |
|--------|---------|--------------|
| **North Star** | Vendas registradas por loja ativa / semana | Crescente; ≥ 15/semana por loja ativa |
| **Ativação** | % de lojas que cadastram estoque **e** registram ≥ 5 vendas em 14 dias | ≥ 40% |
| **Retenção** | % de lojas ainda ativas (≥1 venda) na semana 4 | ≥ 30% |
| **Time-to-value** | Tempo de cadastro até a 1ª venda registrada | < 30 min na 1ª sessão |
| **Engajamento** | % de lojas que abrem o dashboard ≥ 4 dias/semana | ≥ 35% |
| **Esforço/simplicidade** | Lojas que completam onboarding **sem suporte** | ≥ 85% |

---

## 9. Riscos e mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Sem prazo → escopo se alonga indefinidamente ("eterna construção") | Nunca chega a lojistas reais | Ondas com **gate de validação** (8.1); cada onda vai a parceiros antes da próxima — valida cedo e sempre |
| Falta de nota fiscal nas Ondas 1–2 afasta lojas que precisam emitir | Parceiros que dependem de nota não conseguem validar | NFC-e comprometida (Onda 3); recrutar para Ondas 1–2 lojistas cuja operação tolera registrar venda sem nota |
| Multi-loja desde a Onda 1 amplia a modelagem | Complexidade precoce | Manter no **mínimo viável** (sem transferência/permissões granulares); acertar segregação de estoque no modelo de dados desde já |
| Cadastro inicial de produtos é trabalhoso → desistência | Queda de ativação | Guia de primeiros passos (Onda 2) + importação por planilha (Onda 3) |
| Venda sem estoque gera saldo negativo bagunçado | Dados pouco confiáveis | Permitir só com confirmação explícita + destacar pendências de acerto no inventário |
| "Vira ERP" por pressão de features | Perde simplicidade (a proposta de valor) | A lista "Fora do produto" é **contrato**; toda nova feature passa pela hipótese e pela persona Cláudia |

---

## 10. Roadmap em ondas validadas

Sem prazo, o roadmap é sequência + gate, não calendário. Cada onda só começa quando a
anterior passa nos critérios da seção 8.1.

- **Onda 1 — Ciclo central:** E0–E4, E6 e E7 (onboarding, produtos, estoque, venda, caixa,
  dashboard, multi-loja). Fecha o fluxo de valor ponta-a-ponta. **Gate:** lojista opera sozinho + ativação.
- **Onda 2 — Confiança:** histórico/estorno, inventário, clientes (perfil + histórico), guia
  de primeiros passos. **Gate:** lojista larga o caderno/planilha + retenção semana 4.
- **Onda 3 — Completude:** **NFC-e via Focus NFe** (parceiro definido), importação por planilha,
  leitor de barras, contas a vencer, relatórios/exportação. **Gate:** cobre a operação real
  sem fricção fiscal. *ACBr (emissão própria) não previsto por ora — opção de margem da Onda 4,
  preservada pelo adaptador fiscal; ver `posicionamento-e-proposta-de-valor.md` §2.1.*
- **Onda 4 — Competir de frente (Bling/Phibo):** *table-stakes* entregues de forma simples —
  NF-e completa, integrações (e-commerce/marketplace), pagamentos, relatórios mais ricos.
  **Regra-trava:** nada entra por paridade ("o Bling tem"); só entra se a Cláudia precisa **e**
  não complica a tela. Ver `posicionamento-e-proposta-de-valor.md` §2.1.
- **Backlog (futuro, sob demanda):** transferência entre lojas, permissões granulares.
- **Fora para sempre:** parametrização infinita, customização por cliente, WMS, contabilidade,
  workflows corporativos — matam a simplicidade que é o nosso diferencial.
- **Visão de longo prazo:** "Shopify da gestão de lojas físicas de moda".

---

## 11. Próximos passos sugeridos

1. **Recrutar 3–5 lojistas-parceiros** do ICP para o ciclo de validação contínua (seção 8.1) e validar este recorte com eles (entrevista de 20 min sobre o fluxo da seção 6).
2. **Wireframes de baixa fidelidade** dos 4 fluxos críticos da Onda 1: onboarding, cadastro de produto com grade, venda rápida, dashboard. *(posso acionar o fluxo de UX/telas a partir destas histórias).*
3. **Modelagem de dados** — conta → lojas → catálogo → variações → estoque por loja → vendas → caixa → clientes. *(definir antes de codar; multi-loja exige acertar a segregação de estoque desde o início).*
4. **Quebrar a Onda 1 em tarefas técnicas** e escolher a stack.

---

*Documento vivo — versão 2 (sem prazo; ondas validadas). Atualize a fronteira "Fora do
produto" e os gates de validação conforme o aprendizado com os primeiros lojistas.*
