import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/vender', label: 'Vender', icon: '🛒' },
  { to: '/produtos', label: 'Produtos', icon: '🏷️' },
  { to: '/estoque', label: 'Estoque', icon: '📦' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/caixa', label: 'Caixa', icon: '💰' },
  { to: '/cadastros', label: 'Cadastros', icon: '🗂️' },
  { to: '/auditoria', label: 'Auditoria', icon: '📜' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth();
  const loc = useLocation();

  return (
    <div className="lg:flex min-h-screen">
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-stone-200/70 px-3 py-4">
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 flex items-center justify-center text-white font-extrabold">
            M
          </div>
          <div>
            <p className="font-bold leading-none tracking-tight">minha loja</p>
            <p className="text-[11px] text-stone-400 mt-0.5">gestão de moda</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((n) => {
            const ativo = n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to);
            const classes = ativo
              ? 'bg-brand-light text-brand-dark'
              : 'text-stone-600 hover:bg-stone-50';
            return (
              <Link
                key={n.label}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${classes}`}
              >
                <span className="text-base">{n.icon}</span> {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-200/70 pt-3 flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-rose-300 flex items-center justify-center text-sm font-bold text-white">
            {usuario?.nome?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none truncate">{usuario?.nome ?? 'Usuária'}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{usuario?.papel ?? ''}</p>
          </div>
          <button onClick={sair} className="text-stone-300 hover:text-stone-500 text-sm" title="Sair">
            ⎋
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
