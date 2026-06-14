import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface VariacaoSaldo {
  variacaoId: string;
  cor: string;
  tamanho: string;
  quantidade: number;
}
interface ProdutoSaldo {
  produtoId: string;
  nome: string;
  total: number;
  variacoes: VariacaoSaldo[];
}

function corChip(q: number): string {
  if (q === 0) return 'bg-rose-50 text-rose-600 border-rose-200';
  if (q <= 3) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-stone-50 text-stone-600 border-stone-200';
}

export function Estoque() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['saldo'],
    queryFn: () => api<ProdutoSaldo[]>('/estoque/saldo'),
  });

  return (
    <div className="p-5 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-stone-400">Saldo da loja</p>
        </div>
        <Link
          to="/estoque/entrada"
          className="bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-soft"
        >
          + Dar entrada
        </Link>
      </div>

      {isLoading && <p className="text-stone-400">Carregando...</p>}
      {isError && <p className="text-rose-600">Não foi possível carregar o estoque.</p>}

      <div className="space-y-3 max-w-3xl">
        {data?.map((p) => (
          <div key={p.produtoId} className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{p.nome}</p>
              <p className="text-sm text-stone-400">{p.total} no total</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.variacoes.map((v) => (
                <span
                  key={v.variacaoId}
                  className={`text-xs border rounded-lg px-2.5 py-1.5 ${corChip(v.quantidade)}`}
                >
                  {v.cor}/{v.tamanho}: <b>{v.quantidade}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data && data.length === 0 && (
        <p className="text-stone-400">Cadastre produtos e dê entrada para ver o saldo aqui.</p>
      )}
    </div>
  );
}
