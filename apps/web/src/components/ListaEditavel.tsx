import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Item {
  id: string;
  nome: string;
}

function ItemEditavel({ recurso, item }: { recurso: string; item: Item }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(item.nome);
  const salvar = useMutation({
    mutationFn: () => api(`/catalogo/${recurso}/${item.id}`, { method: 'PUT', body: { nome } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [recurso] }),
  });
  const mudou = nome.trim() !== item.nome && nome.trim().length > 0;

  return (
    <div className="flex gap-2 items-center">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <button
        onClick={() => salvar.mutate()}
        disabled={!mudou || salvar.isPending}
        className="text-xs font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white disabled:opacity-40 enabled:hover:bg-stone-50"
      >
        Salvar
      </button>
    </div>
  );
}

/** Lista de um cadastro de apoio (categorias, marcas, ...) com adicionar e renomear. */
export function ListaEditavel({ titulo, recurso }: { titulo: string; recurso: string }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: [recurso], queryFn: () => api<Item[]>(`/catalogo/${recurso}`) });
  const [novo, setNovo] = useState('');

  const adicionar = useMutation({
    mutationFn: () => api(`/catalogo/${recurso}`, { method: 'POST', body: { nome: novo.trim() } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [recurso] });
      setNovo('');
    },
  });

  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
      <p className="font-semibold mb-3">{titulo}</p>
      <div className="flex gap-2 mb-3">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Adicionar novo..."
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={() => novo.trim() && adicionar.mutate()}
          disabled={adicionar.isPending}
          className="text-sm font-medium px-3 rounded-lg bg-brand text-white disabled:opacity-60"
        >
          Adicionar
        </button>
      </div>
      <div className="space-y-2">
        {data?.map((i) => <ItemEditavel key={i.id} recurso={recurso} item={i} />)}
        {data && data.length === 0 && <p className="text-sm text-stone-400">Nenhum ainda.</p>}
      </div>
    </div>
  );
}
