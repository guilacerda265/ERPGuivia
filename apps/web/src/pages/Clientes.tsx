import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  documento: string | null;
  cidade: string | null;
  saldoDevedorCentavos: number;
}
interface Config {
  exigeCpf: boolean;
  exigeTelefone: boolean;
  exigeEndereco: boolean;
  exigeNascimento: boolean;
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ConfigCrediarioCard() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['config-crediario'], queryFn: () => api<Config>('/clientes/config') });
  const salvar = useMutation({
    mutationFn: (cfg: Config) => api('/clientes/config', { method: 'PUT', body: cfg }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config-crediario'] }),
  });
  if (!data) return null;
  const item = (campo: keyof Config, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={data[campo]} onChange={() => salvar.mutate({ ...data, [campo]: !data[campo] })} className="rounded" />
      {label}
    </label>
  );
  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-5">
      <p className="font-semibold text-sm mb-1">Crediário — campos obrigatórios do cliente</p>
      <p className="text-xs text-stone-400 mb-3">Exigidos ao vender no crediário.</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {item('exigeCpf', 'CPF')}
        {item('exigeTelefone', 'Telefone')}
        {item('exigeEndereco', 'Endereço')}
        {item('exigeNascimento', 'Data de nascimento')}
      </div>
    </div>
  );
}

export function Clientes() {
  const { data, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: () => api<Cliente[]>('/clientes') });
  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-stone-400">Sua base de clientes</p>
        </div>
        <Link to="/clientes/novo" className="bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-soft">+ Novo cliente</Link>
      </div>

      <ConfigCrediarioCard />

      {isLoading && <p className="text-stone-400">Carregando...</p>}
      <div className="space-y-2">
        {data?.map((c) => (
          <Link key={c.id} to={`/clientes/${c.id}`} className="flex items-center justify-between rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 hover:border-brand">
            <div className="min-w-0">
              <p className="font-semibold truncate">{c.nome}</p>
              <p className="text-xs text-stone-400 truncate">{[c.telefone, c.documento, c.cidade].filter(Boolean).join(' · ') || '—'}</p>
            </div>
            {c.saldoDevedorCentavos > 0 ? (
              <span className="text-sm font-semibold text-rose-600 whitespace-nowrap">deve {brl(c.saldoDevedorCentavos)}</span>
            ) : (
              <span className="text-xs text-stone-300">em dia</span>
            )}
          </Link>
        ))}
        {data && data.length === 0 && <p className="text-stone-400">Nenhum cliente ainda.</p>}
      </div>
    </div>
  );
}
