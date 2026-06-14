import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Variacao {
  id: string;
  cor: string;
  tamanho: string;
}
interface Produto {
  id: string;
  nome: string;
  precoBaseCentavos: number;
  marca?: { nome: string } | null;
  colecao?: { nome: string } | null;
  variacoes: Variacao[];
}

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Produtos() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api<Produto[]>('/catalogo/produtos'),
  });

  return (
    <div className="p-5 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-stone-400">Seu catálogo</p>
        </div>
        <Link
          to="/produtos/novo"
          className="bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-soft"
        >
          + Novo produto
        </Link>
      </div>

      {isLoading && <p className="text-stone-400">Carregando...</p>}
      {isError && <p className="text-rose-600">Não foi possível carregar os produtos.</p>}

      {data && data.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium text-stone-600">Nenhum produto ainda</p>
          <p className="text-sm">Cadastre seu primeiro produto para começar.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
        {data?.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{p.nome}</p>
                <p className="text-xs text-stone-400 truncate">
                  {[p.marca?.nome, p.colecao?.nome].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <p className="font-bold text-brand whitespace-nowrap">{brl(p.precoBaseCentavos)}</p>
            </div>
            <p className="text-xs text-stone-400 mt-3">
              {p.variacoes.length} variações (cor × tamanho)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
