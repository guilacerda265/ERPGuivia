import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

interface Resumo {
  vendasHojeCentavos: number;
  vendasHojeQtd: number;
  faturamentoMesCentavos: number;
  dinheiroCaixaCentavos: number;
  produtosAcabando: number;
  caixaAberto: boolean;
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Dashboard() {
  const { usuario } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Resumo>('/dashboard'),
  });

  return (
    <div className="p-5 lg:p-8">
      <div className="mb-5">
        <p className="text-sm text-stone-400">Bom dia,</p>
        <h1 className="text-2xl font-bold tracking-tight">{usuario?.nome ?? 'Olá'} 👋</h1>
      </div>

      {isLoading && <p className="text-stone-400">Carregando...</p>}

      {data && (
        <div className="grid lg:grid-cols-3 gap-4 max-w-5xl">
          {/* hero */}
          <div className="lg:col-span-2 rounded-3xl bg-ink text-white p-6">
            <p className="text-stone-400 text-sm">Você vendeu hoje</p>
            <p className="text-4xl lg:text-5xl font-extrabold tracking-tight mt-1">
              {brl(data.vendasHojeCentavos)}
            </p>
            <p className="text-sm text-stone-500 mt-2">{data.vendasHojeQtd} vendas</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
              <p className="text-xs text-stone-400">Faturamento do mês</p>
              <p className="text-2xl font-bold mt-1 tracking-tight">{brl(data.faturamentoMesCentavos)}</p>
            </div>
            <Link to="/caixa" className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4">
              <p className="text-xs text-stone-400">Dinheiro no caixa</p>
              <p className="text-2xl font-bold mt-1 tracking-tight text-emerald-600">
                {brl(data.dinheiroCaixaCentavos)}
              </p>
            </Link>
          </div>

          <Link
            to="/estoque"
            className="rounded-2xl bg-white border border-amber-200 shadow-soft p-4"
          >
            <p className="text-xs text-amber-600 font-medium">⚠ Está acabando</p>
            <p className="text-2xl font-bold mt-1">
              {data.produtosAcabando} <span className="text-sm font-normal text-stone-400">itens</span>
            </p>
          </Link>

          {!data.caixaAberto && (
            <Link
              to="/caixa"
              className="lg:col-span-2 rounded-2xl bg-brand-light border border-violet-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-brand-dark">Caixa fechado</p>
                <p className="text-xs text-stone-500">Abra o caixa para começar o dia.</p>
              </div>
              <span className="text-brand">›</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
