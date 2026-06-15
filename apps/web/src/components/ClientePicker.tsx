import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  documento: string | null;
  saldoDevedorCentavos?: number;
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Seletor de cliente na venda: busca um existente ou faz um cadastro rápido. */
export function ClientePicker({
  onSelecionar,
  onFechar,
}: {
  onSelecionar: (c: Cliente) => void;
  onFechar: () => void;
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['clientes'], queryFn: () => api<Cliente[]>('/clientes') });
  const [busca, setBusca] = useState('');
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [erro, setErro] = useState('');

  const criar = useMutation({
    mutationFn: () => api<Cliente>('/clientes', { method: 'POST', body: { nome, telefone, documento } }),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onSelecionar(c);
    },
    onError: () => setErro('Não foi possível salvar.'),
  });

  const filtrados = data?.filter(
    (c) => c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.telefone ?? '').includes(busca),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-t-3xl lg:rounded-3xl p-5 w-full lg:max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-lg">{novo ? 'Novo cliente' : 'Identificar cliente'}</p>
          <button onClick={onFechar} className="text-stone-400">✕</button>
        </div>

        {!novo ? (
          <>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm mb-3 outline-none focus:border-brand"
            />
            <div className="space-y-1.5 mb-3">
              {filtrados?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelecionar(c)}
                  className="w-full flex items-center justify-between text-left rounded-xl border border-stone-200 px-3 py-2.5 hover:border-brand"
                >
                  <div>
                    <p className="font-medium text-sm">{c.nome}</p>
                    <p className="text-xs text-stone-400">{[c.telefone, c.documento].filter(Boolean).join(' · ') || 'sem contato'}</p>
                  </div>
                  {!!c.saldoDevedorCentavos && (
                    <span className="text-xs text-rose-600 font-medium">deve {brl(c.saldoDevedorCentavos)}</span>
                  )}
                </button>
              ))}
              {filtrados && filtrados.length === 0 && (
                <p className="text-sm text-stone-400 text-center py-2">Nenhum cliente. Cadastre um novo.</p>
              )}
            </div>
            <button onClick={() => setNovo(true)} className="w-full text-sm font-medium border border-brand text-brand rounded-xl py-2.5">
              + Novo cliente
            </button>
          </>
        ) : (
          <>
            {erro && <div className="mb-3 text-sm bg-rose-50 text-rose-600 rounded-xl px-3 py-2">{erro}</div>}
            <p className="text-xs text-stone-400 mb-2">Cadastro rápido. Para crediário, informe também o CPF.</p>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome *" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm mb-2 outline-none focus:border-brand" />
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm mb-2 outline-none focus:border-brand" />
            <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="CPF" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm mb-3 outline-none focus:border-brand" />
            <div className="flex gap-2">
              <button onClick={() => setNovo(false)} className="flex-1 text-sm border border-stone-200 rounded-xl py-2.5">Voltar</button>
              <button onClick={() => nome.trim() && criar.mutate()} disabled={criar.isPending} className="flex-1 text-sm font-semibold bg-brand text-white rounded-xl py-2.5 disabled:opacity-60">
                Salvar e usar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
