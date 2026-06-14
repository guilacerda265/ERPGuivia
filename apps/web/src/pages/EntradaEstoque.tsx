import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';

interface Variacao {
  id: string;
  cor: string;
  tamanho: string;
}
interface Produto {
  id: string;
  nome: string;
  custoCompraCentavos: number;
  variacoes: Variacao[];
}
interface Fornecedor {
  id: string;
  nome: string;
}

export function EntradaEstoque() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: produtos } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api<Produto[]>('/catalogo/produtos'),
  });
  const { data: fornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => api<Fornecedor[]>('/estoque/fornecedores'),
  });

  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [numeroNota, setNumeroNota] = useState('');
  const [custo, setCusto] = useState('');
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});
  const [novoFornecedor, setNovoFornecedor] = useState('');
  const [erro, setErro] = useState('');

  const produto = useMemo(
    () => produtos?.find((p) => p.id === produtoId),
    [produtos, produtoId],
  );
  const custoCentavos = Math.round((parseFloat(custo.replace(',', '.')) || 0) * 100);

  function selecionarProduto(id: string) {
    setProdutoId(id);
    setQuantidades({});
    const p = produtos?.find((x) => x.id === id);
    if (p) setCusto((p.custoCompraCentavos / 100).toFixed(2).replace('.', ','));
  }

  const criarFornecedor = useMutation({
    mutationFn: () => api<Fornecedor>('/estoque/fornecedores', { method: 'POST', body: { nome: novoFornecedor } }),
    onSuccess: (f) => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      setFornecedorId(f.id);
      setNovoFornecedor('');
    },
  });

  const salvar = useMutation({
    mutationFn: () => {
      const itens = (produto?.variacoes ?? [])
        .map((v) => ({
          variacaoId: v.id,
          quantidade: parseInt(quantidades[v.id] || '0', 10) || 0,
          custoUnitarioCentavos: custoCentavos,
        }))
        .filter((i) => i.quantidade > 0);
      return api('/estoque/entradas', {
        method: 'POST',
        body: {
          fornecedorId: fornecedorId || undefined,
          numeroNota: numeroNota || undefined,
          itens,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saldo'] });
      navigate('/estoque');
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao salvar.'),
  });

  const totalPecas = (produto?.variacoes ?? []).reduce(
    (s, v) => s + (parseInt(quantidades[v.id] || '0', 10) || 0),
    0,
  );

  function onSalvar() {
    setErro('');
    if (!produto) return setErro('Escolha um produto.');
    if (totalPecas === 0) return setErro('Informe a quantidade de pelo menos uma variação.');
    salvar.mutate();
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl">
      <button onClick={() => navigate('/estoque')} className="text-stone-400 text-sm mb-3">
        ← Estoque
      </button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Entrada de mercadoria</h1>

      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-medium text-stone-600">Fornecedor</label>
          <select
            value={fornecedorId}
            onChange={(e) => setFornecedorId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-3 bg-white outline-none focus:border-brand"
          >
            <option value="">Sem fornecedor</option>
            {fornecedores?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-600">
            Nº da nota <span className="text-stone-300">(opcional)</span>
          </label>
          <input
            value={numeroNota}
            onChange={(e) => setNumeroNota(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={novoFornecedor}
          onChange={(e) => setNovoFornecedor(e.target.value)}
          placeholder="+ novo fornecedor"
          className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => novoFornecedor.trim() && criarFornecedor.mutate()}
          className="text-sm border border-stone-200 rounded-xl px-3 bg-white hover:bg-stone-50"
        >
          Adicionar
        </button>
      </div>

      <label className="text-sm font-medium text-stone-600">Produto</label>
      <select
        value={produtoId}
        onChange={(e) => selecionarProduto(e.target.value)}
        className="mt-1 mb-4 w-full rounded-xl border border-stone-200 px-3 py-3 bg-white outline-none focus:border-brand"
      >
        <option value="">Escolha um produto...</option>
        {produtos?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      {produto && (
        <>
          <div className="mb-4">
            <label className="text-sm font-medium text-stone-600">Custo unitário (R$)</label>
            <input
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="0,00"
              className="mt-1 w-40 rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>

          <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft divide-y divide-stone-100 mb-6">
            {produto.variacoes.map((v) => (
              <div key={v.id} className="p-3 flex items-center gap-3">
                <span className="text-sm flex-1">
                  {v.cor} · {v.tamanho}
                </span>
                <input
                  inputMode="numeric"
                  value={quantidades[v.id] ?? ''}
                  onChange={(e) =>
                    setQuantidades((q) => ({ ...q, [v.id]: e.target.value.replace(/\D/g, '') }))
                  }
                  placeholder="0"
                  className="w-20 text-center rounded-lg border border-stone-200 px-2 py-2 outline-none focus:border-brand"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-ink text-white p-4 flex items-center justify-between mb-4">
            <p className="text-sm text-stone-300">{totalPecas} peças entrando</p>
            <p className="font-bold">
              Custo total{' '}
              {((totalPecas * custoCentavos) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
        </>
      )}

      <button
        onClick={onSalvar}
        disabled={salvar.isPending}
        className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60"
      >
        {salvar.isPending ? 'Salvando...' : 'Confirmar entrada'}
      </button>
    </div>
  );
}
