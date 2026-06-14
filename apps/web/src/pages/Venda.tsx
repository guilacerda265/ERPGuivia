import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';

interface Variacao {
  id: string;
  cor: string;
  tamanho: string;
  precoCentavos: number | null;
}
interface Produto {
  id: string;
  nome: string;
  precoBaseCentavos: number;
  variacoes: Variacao[];
}
interface Forma {
  id: string;
  nome: string;
}
interface ItemCarrinho {
  variacaoId: string;
  nome: string;
  cor: string;
  tamanho: string;
  precoCentavos: number;
  quantidade: number;
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Venda() {
  const queryClient = useQueryClient();
  const { data: produtos } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api<Produto[]>('/catalogo/produtos'),
  });
  const { data: formas } = useQuery({
    queryKey: ['formas'],
    queryFn: () => api<Forma[]>('/vendas/formas-pagamento'),
  });

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [aberto, setAberto] = useState<Produto | null>(null);
  const [etapa, setEtapa] = useState<'catalogo' | 'pagamento' | 'ok'>('catalogo');
  const [formaId, setFormaId] = useState('');
  const [erro, setErro] = useState('');

  const total = carrinho.reduce((s, i) => s + i.precoCentavos * i.quantidade, 0);

  function adicionar(p: Produto, v: Variacao) {
    const preco = v.precoCentavos ?? p.precoBaseCentavos;
    setCarrinho((c) => {
      const i = c.findIndex((x) => x.variacaoId === v.id);
      if (i >= 0) {
        const cp = [...c];
        cp[i] = { ...cp[i], quantidade: cp[i].quantidade + 1 };
        return cp;
      }
      return [...c, { variacaoId: v.id, nome: p.nome, cor: v.cor, tamanho: v.tamanho, precoCentavos: preco, quantidade: 1 }];
    });
    setAberto(null);
  }
  const mudarQtd = (id: string, d: number) =>
    setCarrinho((c) =>
      c.map((x) => (x.variacaoId === id ? { ...x, quantidade: Math.max(1, x.quantidade + d) } : x)),
    );
  const remover = (id: string) => setCarrinho((c) => c.filter((x) => x.variacaoId !== id));

  const finalizar = useMutation({
    mutationFn: () =>
      api('/vendas', {
        method: 'POST',
        body: {
          itens: carrinho.map((i) => ({ variacaoId: i.variacaoId, quantidade: i.quantidade })),
          pagamentos: [{ formaPagamentoId: formaId, valorCentavos: total }],
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saldo'] });
      setEtapa('ok');
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao finalizar a venda.'),
  });

  function novaVenda() {
    setCarrinho([]);
    setFormaId('');
    setErro('');
    setEtapa('catalogo');
  }

  // ---------- SUCESSO ----------
  if (etapa === 'ok') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5">✓</div>
        <h2 className="text-2xl font-bold tracking-tight">Venda registrada!</h2>
        <p className="text-stone-500 mt-1">{brl(total)}</p>
        <div className="mt-5 w-full max-w-xs rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 text-sm text-left space-y-2">
          <div className="flex items-center gap-2 text-stone-600">📦 <span>Estoque baixado automaticamente</span></div>
          <div className="flex items-center gap-2 text-stone-600">💰 <span>Entrou no caixa de hoje</span></div>
        </div>
        <button onClick={novaVenda} className="mt-6 w-full max-w-xs bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft">
          Nova venda
        </button>
      </div>
    );
  }

  // ---------- PAGAMENTO ----------
  if (etapa === 'pagamento') {
    return (
      <div className="p-5 lg:p-8 max-w-md mx-auto">
        <button onClick={() => setEtapa('catalogo')} className="text-stone-400 text-sm mb-4">← voltar</button>
        <div className="rounded-3xl bg-ink text-white p-6 text-center mb-5">
          <p className="text-stone-400 text-sm">Total a cobrar</p>
          <p className="text-4xl font-extrabold tracking-tight mt-1">{brl(total)}</p>
        </div>
        {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}
        <p className="text-sm font-medium text-stone-600 mb-2">Como o cliente vai pagar?</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {formas?.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormaId(f.id)}
              className={`rounded-2xl p-4 text-left border ${formaId === f.id ? 'border-2 border-brand bg-brand-light' : 'border-stone-200 bg-white'}`}
            >
              <p className="font-medium text-sm">{f.nome}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setErro('');
            if (!formaId) return setErro('Escolha a forma de pagamento.');
            finalizar.mutate();
          }}
          disabled={finalizar.isPending}
          className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60"
        >
          {finalizar.isPending ? 'Registrando...' : 'Confirmar venda'}
        </button>
      </div>
    );
  }

  // ---------- CATÁLOGO + CARRINHO ----------
  return (
    <div className="p-5 lg:p-8 lg:flex lg:gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Nova venda</h1>
        <p className="text-sm text-stone-400 mb-5">Toque num produto para adicionar.</p>
        <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
          {produtos?.map((p) => (
            <button
              key={p.id}
              onClick={() => setAberto(p)}
              className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-200/70 shadow-soft text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center">🏷️</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.nome}</p>
                <p className="text-xs text-stone-400">{p.variacoes.length} variações</p>
              </div>
              <p className="font-semibold text-sm">{brl(p.precoBaseCentavos)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* carrinho */}
      <aside className="mt-6 lg:mt-0 lg:w-80 lg:shrink-0">
        <div className="bg-white border border-stone-200/70 rounded-2xl shadow-soft p-5 lg:sticky lg:top-6">
          <p className="font-bold mb-3">Venda atual</p>
          {carrinho.length === 0 && <p className="text-stone-400 text-sm">Nenhum item ainda.</p>}
          <div className="space-y-2 mb-3">
            {carrinho.map((i) => (
              <div key={i.variacaoId} className="flex items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="truncate">{i.nome}</p>
                  <p className="text-xs text-stone-400">{i.cor}/{i.tamanho} · {brl(i.precoCentavos)}</p>
                </div>
                <button onClick={() => mudarQtd(i.variacaoId, -1)} className="w-7 h-7 rounded-lg bg-stone-100">−</button>
                <span className="w-5 text-center font-semibold">{i.quantidade}</span>
                <button onClick={() => mudarQtd(i.variacaoId, 1)} className="w-7 h-7 rounded-lg bg-brand-light text-brand">+</button>
                <button onClick={() => remover(i.variacaoId)} className="text-stone-300 ml-1">✕</button>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-3 flex items-center justify-between mb-3">
            <span className="text-stone-500 text-sm">Total</span>
            <span className="text-2xl font-extrabold tracking-tight">{brl(total)}</span>
          </div>
          <button
            disabled={carrinho.length === 0}
            onClick={() => setEtapa('pagamento')}
            className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-40"
          >
            Cobrar
          </button>
        </div>
      </aside>

      {/* modal: escolher variação */}
      {aberto && (
        <div className="fixed inset-0 z-40 flex items-end lg:items-center justify-center" onClick={() => setAberto(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl p-5 w-full lg:max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-lg">{aberto.nome}</p>
            <p className="text-xs text-stone-400 mb-3">Escolha cor e tamanho</p>
            <div className="flex flex-wrap gap-2">
              {aberto.variacoes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => adicionar(aberto, v)}
                  className="px-3 py-2 rounded-xl text-sm border border-stone-200 hover:border-brand hover:bg-brand-light"
                >
                  {v.cor} · {v.tamanho}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
