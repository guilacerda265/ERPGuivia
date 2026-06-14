import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { precoSugeridoCentavos } from '@erp/shared';
import { api, ApiError } from '../lib/api';

const CORES = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Rosa'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function NovoProduto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [custo, setCusto] = useState('');
  const [markup, setMarkup] = useState('100');
  const [cores, setCores] = useState<string[]>(['Preto']);
  const [tamanhos, setTamanhos] = useState<string[]>(['M']);
  const [erro, setErro] = useState('');

  const custoCentavos = Math.round((parseFloat(custo.replace(',', '.')) || 0) * 100);
  const markupNum = parseInt(markup, 10) || 0;
  const precoCentavos = precoSugeridoCentavos(custoCentavos, markupNum);
  const totalVariacoes = cores.length * tamanhos.length;

  function toggle(lista: string[], set: (v: string[]) => void, valor: string) {
    set(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  }

  const salvar = useMutation({
    mutationFn: () =>
      api('/catalogo/produtos', {
        method: 'POST',
        body: {
          nome,
          custoCompraCentavos: custoCentavos,
          markupPercentual: markupNum,
          precoBaseCentavos: precoCentavos,
          cores,
          tamanhos,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      navigate('/produtos');
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao salvar.'),
  });

  function onSalvar() {
    setErro('');
    if (!nome.trim()) return setErro('Informe o nome do produto.');
    if (cores.length === 0 || tamanhos.length === 0)
      return setErro('Escolha ao menos uma cor e um tamanho.');
    salvar.mutate();
  }

  const chip = (ativo: boolean) =>
    `text-sm border rounded-full px-3 py-1.5 ${
      ativo ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'
    }`;

  return (
    <div className="p-5 lg:p-8 max-w-2xl">
      <button onClick={() => navigate('/produtos')} className="text-stone-400 text-sm mb-3">
        ← Produtos
      </button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Adicionar produto</h1>

      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <label className="text-sm font-medium text-stone-600">Nome do produto</label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: Vestido Floral Midi"
        className="mt-1 mb-5 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-5">
        <p className="text-sm font-semibold mb-3">Preço</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-500">Quanto você pagou (R$)</label>
            <input
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="60,00"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">Margem (%)</label>
            <input
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between bg-brand-light rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-stone-500">Preço de venda sugerido</p>
            <p className="text-2xl font-bold text-brand">{brl(precoCentavos)}</p>
          </div>
          <p className="text-xs text-emerald-600 font-medium pb-1">
            lucro {brl(Math.max(0, precoCentavos - custoCentavos))}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-6">
        <p className="text-sm font-semibold">Cores e tamanhos</p>
        <p className="text-xs text-stone-400 mt-0.5 mb-3">A gente monta a grade pra você.</p>

        <p className="text-xs font-medium text-stone-500 mb-1.5">Cores</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {CORES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggle(cores, setCores, c)}
              className={chip(cores.includes(c))}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-stone-500 mb-1.5">Tamanhos</p>
        <div className="flex flex-wrap gap-2">
          {TAMANHOS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggle(tamanhos, setTamanhos, t)}
              className={`w-11 h-9 rounded-lg text-sm border ${
                tamanhos.includes(t) ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-3">
          {totalVariacoes} variações serão criadas ({cores.length} cores × {tamanhos.length} tamanhos)
        </p>
      </div>

      <button
        onClick={onSalvar}
        disabled={salvar.isPending}
        className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60"
      >
        {salvar.isPending ? 'Salvando...' : 'Salvar produto'}
      </button>
    </div>
  );
}
