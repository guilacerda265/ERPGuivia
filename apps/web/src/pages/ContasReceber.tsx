import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Parcela {
  id: string;
  numero: number;
  valorCentavos: number;
  vencimento: string;
  clienteId: string;
  clienteNome: string;
}
interface Forma {
  id: string;
  nome: string;
  tipo: string;
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hoje = new Date().toISOString().slice(0, 10);
const dataBr = (s: string) => s.split('-').reverse().join('/');

export function ContasReceber() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['contas-receber'], queryFn: () => api<Parcela[]>('/contas-receber') });
  const formas = useQuery({ queryKey: ['formas'], queryFn: () => api<Forma[]>('/vendas/formas-pagamento') });

  const [recebendo, setRecebendo] = useState<Parcela | null>(null);
  const [formaId, setFormaId] = useState('');

  const receber = useMutation({
    mutationFn: () =>
      api(`/contas-receber/parcelas/${recebendo!.id}/receber`, {
        method: 'POST',
        body: { formaPagamentoId: formaId || undefined },
      }),
    onSuccess: () => {
      ['contas-receber', 'clientes', 'caixa', 'dashboard'].forEach((k) =>
        queryClient.invalidateQueries({ queryKey: [k] }),
      );
      setRecebendo(null);
      setFormaId('');
    },
  });

  const total = data?.reduce((s, p) => s + p.valorCentavos, 0) ?? 0;
  const formasReceber = formas.data?.filter((f) => f.tipo !== 'CREDIARIO');

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Contas a receber</h1>
      <p className="text-sm text-stone-400 mb-5">Crediário — parcelas em aberto</p>

      <div className="rounded-3xl bg-ink text-white p-5 mb-5">
        <p className="text-stone-400 text-sm">Total a receber</p>
        <p className="text-3xl font-extrabold tracking-tight mt-1">{brl(total)}</p>
        <p className="text-sm text-stone-500 mt-1">{data?.length ?? 0} parcelas</p>
      </div>

      {isLoading && <p className="text-stone-400">Carregando...</p>}

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft divide-y divide-stone-100">
        {data?.map((p) => {
          const atrasada = p.vencimento < hoje;
          return (
            <div key={p.id} className="p-3 flex items-center gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.clienteNome}</p>
                <p className="text-xs text-stone-400">
                  Parcela {p.numero} · vence {dataBr(p.vencimento)}
                  {atrasada && <span className="text-rose-600 font-medium"> · atrasada</span>}
                </p>
              </div>
              <span className="font-semibold whitespace-nowrap">{brl(p.valorCentavos)}</span>
              <button
                onClick={() => { setRecebendo(p); setFormaId(formasReceber?.[0]?.id ?? ''); }}
                className="text-xs font-semibold bg-brand text-white rounded-lg px-3 py-1.5"
              >
                Receber
              </button>
            </div>
          );
        })}
        {data && data.length === 0 && <p className="p-4 text-sm text-stone-400">Nada a receber. 🎉</p>}
      </div>

      {recebendo && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={() => setRecebendo(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl p-5 w-full lg:max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-lg">Receber parcela</p>
            <p className="text-sm text-stone-500 mb-4">
              {recebendo.clienteNome} · parcela {recebendo.numero} · {brl(recebendo.valorCentavos)}
            </p>
            <label className="text-sm font-medium text-stone-600">Como recebeu?</label>
            <select
              value={formaId}
              onChange={(e) => setFormaId(e.target.value)}
              className="mt-1 mb-4 w-full rounded-xl border border-stone-200 px-3 py-2.5 bg-white text-sm outline-none focus:border-brand"
            >
              {formasReceber?.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
            <button
              onClick={() => receber.mutate()}
              disabled={receber.isPending}
              className="w-full bg-brand text-white font-semibold py-3 rounded-2xl disabled:opacity-60"
            >
              {receber.isPending ? 'Recebendo...' : 'Confirmar recebimento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
