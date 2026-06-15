import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Grade {
  id: string;
  nome: string;
  tamanhos: string[];
}

function GradeItem({ grade }: { grade: Grade }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(grade.nome);
  const [tamanhos, setTamanhos] = useState<string[]>(grade.tamanhos);
  const [novo, setNovo] = useState('');

  const salvar = useMutation({
    mutationFn: () => api(`/catalogo/grades/${grade.id}`, { method: 'PUT', body: { nome, tamanhos } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grades'] }),
  });

  function addTam() {
    const t = novo.trim();
    if (t && !tamanhos.includes(t)) setTamanhos((ts) => [...ts, t]);
    setNovo('');
  }

  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="font-medium w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm mb-2 outline-none focus:border-brand"
      />
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tamanhos.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs bg-stone-100 rounded-lg px-2 py-1">
            {t}
            <button onClick={() => setTamanhos((ts) => ts.filter((x) => x !== t))} className="text-stone-400 hover:text-rose-500">×</button>
          </span>
        ))}
        {tamanhos.length === 0 && <span className="text-xs text-stone-400">Sem tamanhos</span>}
      </div>
      <div className="flex gap-1">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTam()}
          placeholder="+ tamanho"
          className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-xs outline-none focus:border-brand"
        />
        <button onClick={addTam} className="text-xs border border-stone-200 rounded-lg px-2 bg-white hover:bg-stone-50">Add</button>
        <button
          onClick={() => salvar.mutate()}
          disabled={salvar.isPending}
          className="ml-auto text-xs font-medium bg-brand text-white rounded-lg px-3 disabled:opacity-60"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

/** Editor das grades de tamanho: criar grades e editar os tamanhos de cada uma. */
export function GradesEditor() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['grades'], queryFn: () => api<Grade[]>('/catalogo/grades') });
  const [nome, setNome] = useState('');

  const criar = useMutation({
    mutationFn: () => api('/catalogo/grades', { method: 'POST', body: { nome, tamanhos: ['P', 'M', 'G'] } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setNome('');
    },
  });

  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
      <p className="font-semibold mb-1">Grades de tamanho</p>
      <p className="text-xs text-stone-400 mb-3">Tipos de grade (ex.: Vestuário, Calçado). Tamanhos personalizáveis.</p>
      <div className="flex gap-2 mb-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nova grade (ex.: Calça)"
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button onClick={() => nome.trim() && criar.mutate()} className="text-sm font-medium px-3 rounded-lg bg-brand text-white">
          Criar
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {data?.map((g) => <GradeItem key={g.id} grade={g} />)}
        {data && data.length === 0 && <p className="text-sm text-stone-400">Nenhuma grade ainda.</p>}
      </div>
    </div>
  );
}
