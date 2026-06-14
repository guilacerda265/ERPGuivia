# Direção de UI — "Claro, confiante e rápido"

> **Resumo:** Tema **claro** por padrão, base neutra quente + **um** acento violeta, números
> grandes, muito respiro, profundidade suave e microinterações crisp. App-shell responsivo:
> **sidebar no desktop, tabs no mobile**. Inspiração de fintech disruptiva filtrada pela lei
> dos 5 segundos da Cláudia — copiamos o *craft*, nunca a densidade.

Base: `posicionamento-e-proposta-de-valor.md` (as 10 leis). Esta direção é como elas viram pixel.

## 1. O princípio que decide tudo

Metade das referências "fintech/SaaS" foi desenhada para **power-users** (Linear, Stripe,
n8n, Airtable) — densas, escuras, jargão. A Cláudia é o oposto. **Fintech disruptiva para
ela = confiança do Nubank, não terminal da Bloomberg.** Copiamos o capricho dessas
ferramentas (microinteração, hierarquia, restrição), **nunca** a densidade.

| Referência | O que copiamos | O que NÃO copiamos |
|------------|----------------|--------------------|
| Apple / Notion | Clareza, respiro, conteúdo-primeiro | — |
| Nubank / C6 | Confiança, número grande, língua humana, 1 acento forte | Telas de investimento densas |
| Stripe | Dashboards calmos, cor semântica, bons gráficos | Densidade de dev |
| Linear | Polimento, velocidade, microinteração | Modo escuro/denso de power-user |
| Shopify / Lightspeed | Padrões de varejo (PDV, grade, pedidos) | Excesso de configuração |
| n8n · Miro · Airtable · Monday | *(guardado para o Promo-Engine / admin)* | Tudo, nas telas da Cláudia |

## 2. Tokens visuais

- **Tema:** claro por padrão. (Escuro = futuro, opcional; e para o admin/Promo-Engine.)
- **Cores:**
  - Canvas (fundo): `#FAFAF9` (stone-50, branco quente)
  - Ink (texto/estrutura): `#0B0B0F`
  - **Acento (marca):** violeta `#7C3AED` · escuro `#6D28D9` · claro `#F5F3FF`
  - Gradiente de marca (só em momentos-herói): violeta → fúcsia
  - Semânticas: **dinheiro/positivo** emerald `#059669` · **alerta/acabando** amber `#D97706` · **negativo** rose `#E11D48`
  - Neutros: escala `stone` (linhas `stone-200/60`, textos `stone-400/500`)
- **Tipografia:** Inter. Hierarquia por peso + tracking apertado nos títulos. Números em peso 800.
- **Forma:** raio grande (`rounded-2xl`/`3xl`), sombras suaves em camadas, bordas de 1px hairline.
- **Movimento:** `scale(.97)` no toque, fade/slide de 200–250ms, easing suave. Nada que atrase a tarefa.

## 3. Layout responsivo (a novidade)

- **Desktop (≥1024px):** app-shell com **sidebar** à esquerda (marca, seletor de loja, navegação, usuário) + topbar (título da tela, busca, ação primária) + conteúdo com largura máxima e **dashboard multi-coluna** (estilo Stripe).
- **Mobile (<1024px):** sidebar some, navegação vira **tab bar inferior**; conteúdo em coluna única, mobile-first (o balcão).
- **Mesmos componentes**, só reorganizados por breakpoint. Onboarding, pagamento e sucesso são **tela cheia** (sem shell) — momentos de foco.

## 4. Padrões de tela (as leis em pixel)

- **Um número dominante por tela** (lei "mostre, não relate"): "Você vendeu hoje · R$ 1.240".
- **Cor com significado, não decoração:** verde = dinheiro, âmbar = atenção. Nunca colorir por enfeite.
- **Estado vazio que ensina** em todo lugar sem dado.
- **Avançado escondido** (revelação progressiva): fiscal, parametrização — atrás de "opcional".
- **Língua de loja** nos rótulos: "Dinheiro no caixa", "Está acabando", "Quanto você pagou".

---

*Documento vivo — v1. Direção de marca visual. O protótipo `prototipo/index.html` é a
referência viva desta direção.*
