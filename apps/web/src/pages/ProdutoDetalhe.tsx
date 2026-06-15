import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface Variacao {
  id: string;
  cor: string;
  tamanho: string;
  skuInterno: string;
  codigoBarras: string | null;
}
interface Produto {
  id: string;
  nome: string;
  codigo: string | null;
  precoBaseCentavos: number;
  custoCompraCentavos: number;
  markupPercentual: number;
  categoria?: { nome: string } | null;
  marca?: { nome: string } | null;
  colecao?: { nome: string } | null;
  departamento?: { nome: string } | null;
  variacoes: Variacao[];
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProdutoDetalhe() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['produto', id],
    queryFn: () => api<Produto>(`/catalogo/produtos/${id}`),
  });

  if (isLoading) return <div className="p-5 lg:p-8 text-stone-400">Carregando...</div>;
  if (isError || !data) return <div className="p-5 lg:p-8 text-rose-600">Produto não encontrado.</div>;

  const chips = [data.categoria?.nome, data.marca?.nome, data.departamento?.nome, data.colecao?.nome].filter(Boolean);

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <Link to="/produtos" className="text-stone-400 text-sm">← Produtos</Link>
      <div className="flex items-start justify-between mt-2 mb-1 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{data.nome}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono bg-stone-100 rounded-lg px-2 py-1">{data.codigo ?? '—'}</span>
          <Link to={`/produtos/${data.id}/editar`} className="text-xs font-semibold bg-brand text-white rounded-lg px-3 py-1.5">
            Editar
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {chips.map((c) => (
          <span key={c} className="text-xs bg-stone-100 text-stone-600 rounded-full px-2.5 py-1">{c}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
          <p className="text-xs text-stone-400">Preço de venda</p>
          <p className="text-xl font-bold text-brand mt-1">{brl(data.precoBaseCentavos)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
          <p className="text-xs text-stone-400">Custo</p>
          <p className="text-xl font-bold mt-1">{brl(data.custoCompraCentavos)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
          <p className="text-xs text-stone-400">Margem</p>
          <p className="text-xl font-bold mt-1">{data.markupPercentual}%</p>
        </div>
      </div>

      <p className="text-sm font-semibold mb-2">Grade ({data.variacoes.length} variações)</p>
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-stone-400 bg-stone-50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Cor / Tamanho</th>
              <th className="text-left py-2 font-medium">Código da grade</th>
              <th className="text-left py-2 font-medium pr-4">Código de barras</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.variacoes.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2.5">{v.cor} · {v.tamanho}</td>
                <td className="py-2.5 font-mono text-xs">{v.skuInterno}</td>
                <td className="py-2.5 pr-4 font-mono text-xs">{v.codigoBarras ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
