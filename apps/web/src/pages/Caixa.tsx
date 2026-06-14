import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';

interface Lancamento {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: string;
  valorCentavos: number;
  descricao: string | null;
  forma: string | null;
}
interface Resumo {
  sessaoAberta: { id: string; valorAberturaCentavos: number; abertaEm: string } | null;
  entradasCentavos: number;
  saidasCentavos: number;
  saldoCentavos: number;
  porForma: { forma: string; valorCentavos: number }[];
  lancamentos: Lancamento[];
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const reaisParaCentavos = (s: string) => Math.round((parseFloat(s.replace(',', '.')) || 0) * 100);

export function Caixa() {
  const queryClient = useQueryClient();
  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['caixa'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const { data, isLoading } = useQuery({ queryKey: ['caixa'], queryFn: () => api<Resumo>('/caixa/resumo') });

  const [abertura, setAbertura] = useState('0,00');
  const [contagem, setContagem] = useState('');
  const [movValor, setMovValor] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [erro, setErro] = useState('');
  const [resultadoFechar, setResultadoFechar] = useState<string>('');

  const abrir = useMutation({
    mutationFn: () => api('/caixa/abrir', { method: 'POST', body: { valorAberturaCentavos: reaisParaCentavos(abertura) } }),
    onSuccess: invalidar,
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao abrir.'),
  });

  const fechar = useMutation({
    mutationFn: () =>
      api<{ diferencaCentavos: number; valorFechamentoCalculadoCentavos: number }>('/caixa/fechar', {
        method: 'POST',
        body: { valorFechamentoInformadoCentavos: reaisParaCentavos(contagem) },
      }),
    onSuccess: (r) => {
      setResultadoFechar(
        `Caixa fechado. Esperado ${brl(r.valorFechamentoCalculadoCentavos)} · diferença ${brl(r.diferencaCentavos)}.`,
      );
      setContagem('');
      invalidar();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao fechar.'),
  });

  const lancar = useMutation({
    mutationFn: (tipo: 'ENTRADA' | 'SAIDA') =>
      api('/caixa/lancamentos', {
        method: 'POST',
        body: {
          tipo,
          categoria: tipo === 'ENTRADA' ? 'SUPRIMENTO' : 'SANGRIA',
          valorCentavos: reaisParaCentavos(movValor),
          descricao: movDesc || undefined,
        },
      }),
    onSuccess: () => {
      setMovValor('');
      setMovDesc('');
      invalidar();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro no lançamento.'),
  });

  if (isLoading) return <div className="p-5 lg:p-8 text-stone-400">Carregando...</div>;

  // ---------- CAIXA FECHADO: abrir ----------
  if (data && !data.sessaoAberta) {
    return (
      <div className="p-5 lg:p-8 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Caixa</h1>
        <p className="text-sm text-stone-400 mb-6">O caixa está fechado.</p>
        {resultadoFechar && (
          <div className="mb-4 text-sm bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3">{resultadoFechar}</div>
        )}
        {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}
        <label className="text-sm font-medium text-stone-600">Valor de abertura (troco)</label>
        <input
          value={abertura}
          onChange={(e) => setAbertura(e.target.value)}
          className="mt-1 mb-5 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-brand"
        />
        <button
          onClick={() => { setErro(''); abrir.mutate(); }}
          disabled={abrir.isPending}
          className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60"
        >
          {abrir.isPending ? 'Abrindo...' : 'Abrir caixa'}
        </button>
      </div>
    );
  }

  // ---------- CAIXA ABERTO ----------
  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-5">Caixa</h1>
      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <div className="rounded-3xl bg-ink text-white p-6 mb-4">
        <p className="text-stone-400 text-sm">Dinheiro no caixa agora</p>
        <p className="text-4xl font-extrabold tracking-tight mt-1">{brl(data!.saldoCentavos)}</p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-emerald-400">entradas {brl(data!.entradasCentavos)}</span>
          <span className="text-rose-400">saídas {brl(data!.saidasCentavos)}</span>
        </div>
      </div>

      {data!.porForma.length > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Entradas por forma</p>
          <div className="space-y-1 text-sm">
            {data!.porForma.map((f) => (
              <div key={f.forma} className="flex justify-between">
                <span className="text-stone-500">{f.forma}</span>
                <span className="font-medium">{brl(f.valorCentavos)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* sangria / suprimento */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-4">
        <p className="text-sm font-semibold mb-2">Lançar dinheiro</p>
        <div className="flex gap-2 mb-2">
          <input
            value={movValor}
            onChange={(e) => setMovValor(e.target.value)}
            placeholder="Valor R$"
            className="w-28 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-brand"
          />
          <input
            value={movDesc}
            onChange={(e) => setMovDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setErro(''); lancar.mutate('ENTRADA'); }}
            className="flex-1 text-sm border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl py-2 font-medium"
          >
            + Suprimento
          </button>
          <button
            onClick={() => { setErro(''); lancar.mutate('SAIDA'); }}
            className="flex-1 text-sm border border-rose-200 text-rose-700 bg-rose-50 rounded-xl py-2 font-medium"
          >
            − Sangria
          </button>
        </div>
      </div>

      {/* lançamentos */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft divide-y divide-stone-100 mb-4">
        {data!.lancamentos.length === 0 && <p className="p-4 text-sm text-stone-400">Sem movimentos ainda.</p>}
        {data!.lancamentos.map((l) => (
          <div key={l.id} className="p-3 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{l.descricao || l.categoria}</p>
              <p className="text-xs text-stone-400">{l.forma ?? l.categoria}</p>
            </div>
            <p className={l.tipo === 'ENTRADA' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {l.tipo === 'ENTRADA' ? '+' : '−'} {brl(l.valorCentavos)}
            </p>
          </div>
        ))}
      </div>

      {/* fechar */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
        <p className="text-sm font-semibold mb-2">Fechar o caixa</p>
        <div className="flex gap-2">
          <input
            value={contagem}
            onChange={(e) => setContagem(e.target.value)}
            placeholder="Quanto tem na gaveta? R$"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
          />
          <button
            onClick={() => { setErro(''); fechar.mutate(); }}
            disabled={fechar.isPending}
            className="bg-ink text-white text-sm font-semibold px-4 rounded-xl disabled:opacity-60"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
