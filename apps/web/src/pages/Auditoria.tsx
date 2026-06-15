import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Log {
  id: string;
  usuario?: { nome: string } | null;
  acao: string;
  entidade: string;
  metodo: string;
  caminho: string;
  entidadeId?: string | null;
  createdAt: string;
}

const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');

function corAcao(a: string): string {
  if (a.startsWith('Criou') || a.startsWith('Abriu') || a.startsWith('Registrou') || a.startsWith('Entrou'))
    return 'text-emerald-600';
  if (a.startsWith('Alterou') || a.startsWith('Lançou') || a.startsWith('Deu')) return 'text-amber-600';
  if (a.startsWith('Removeu') || a.startsWith('Fechou')) return 'text-rose-600';
  return 'text-stone-600';
}

export function Auditoria() {
  const [entidade, setEntidade] = useState('');
  const entidades = useQuery({ queryKey: ['auditoria-entidades'], queryFn: () => api<string[]>('/auditoria/entidades') });
  const { data, isLoading } = useQuery({
    queryKey: ['auditoria', entidade],
    queryFn: () => api<Log[]>(`/auditoria${entidade ? `?entidade=${encodeURIComponent(entidade)}` : ''}`),
  });

  return (
    <div className="p-5 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-sm text-stone-400">Tudo que acontece no sistema, registrado</p>
        </div>
        <select
          value={entidade}
          onChange={(e) => setEntidade(e.target.value)}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm bg-white outline-none focus:border-brand"
        >
          <option value="">Tudo</option>
          {entidades.data?.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-stone-400">Carregando...</p>}

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft divide-y divide-stone-100">
        {data?.map((l) => (
          <div key={l.id} className="p-3 flex items-center gap-3 text-sm">
            <div className="flex-1 min-w-0">
              <p className="truncate">
                <span className={`font-medium ${corAcao(l.acao)}`}>{l.acao}</span> {l.entidade}
                {l.entidadeId && <span className="text-stone-400 text-xs"> · {l.entidadeId.slice(0, 8)}</span>}
              </p>
              <p className="text-xs text-stone-400 truncate">
                {l.usuario?.nome ?? '—'} · {l.metodo} {l.caminho}
              </p>
            </div>
            <span className="text-xs text-stone-400 whitespace-nowrap">{fmt(l.createdAt)}</span>
          </div>
        ))}
        {data && data.length === 0 && <p className="p-4 text-sm text-stone-400">Sem registros ainda.</p>}
      </div>
    </div>
  );
}
