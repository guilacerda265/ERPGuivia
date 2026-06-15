import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';

interface Cliente {
  nome: string;
  telefone: string | null;
  documento: string | null;
  email: string | null;
  dataNascimento: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  limiteCreditoCentavos: number;
  observacao: string | null;
}

const centavos = (s: string) => Math.round((parseFloat(s.replace(',', '.')) || 0) * 100);
const reais = (c: number) => (c / 100).toFixed(2).replace('.', ',');
const INP = 'mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand';

const VAZIO = {
  nome: '', telefone: '', documento: '', email: '', dataNascimento: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  limite: '', observacao: '',
};

// componente de nível de módulo (não recriar dentro do render → não perde foco)
function Campo({
  label,
  value,
  onChange,
  span,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  span?: string;
  type?: string;
}) {
  return (
    <div className={span}>
      <label className="text-xs text-stone-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={INP} />
    </div>
  );
}

export function ClienteForm() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => api<Cliente>(`/clientes/${id}`),
    enabled: editando,
  });

  const [f, setF] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const set = (k: keyof typeof VAZIO) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!data) return;
    setF({
      nome: data.nome, telefone: data.telefone ?? '', documento: data.documento ?? '', email: data.email ?? '',
      dataNascimento: data.dataNascimento ?? '', cep: data.cep ?? '', logradouro: data.logradouro ?? '',
      numero: data.numero ?? '', complemento: data.complemento ?? '', bairro: data.bairro ?? '',
      cidade: data.cidade ?? '', uf: data.uf ?? '', limite: data.limiteCreditoCentavos ? reais(data.limiteCreditoCentavos) : '',
      observacao: data.observacao ?? '',
    });
  }, [data]);

  const salvar = useMutation({
    mutationFn: () =>
      api(editando ? `/clientes/${id}` : '/clientes', {
        method: editando ? 'PUT' : 'POST',
        body: {
          nome: f.nome,
          telefone: f.telefone || undefined,
          documento: f.documento || undefined,
          email: f.email || undefined,
          dataNascimento: f.dataNascimento || undefined,
          cep: f.cep || undefined,
          logradouro: f.logradouro || undefined,
          numero: f.numero || undefined,
          complemento: f.complemento || undefined,
          bairro: f.bairro || undefined,
          cidade: f.cidade || undefined,
          uf: f.uf || undefined,
          limiteCreditoCentavos: centavos(f.limite),
          observacao: f.observacao || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      navigate('/clientes');
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao salvar.'),
  });

  function onSalvar() {
    setErro('');
    if (!f.nome.trim()) return setErro('Informe o nome do cliente.');
    salvar.mutate();
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl">
      <button onClick={() => navigate('/clientes')} className="text-stone-400 text-sm mb-3">← Clientes</button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">{editando ? 'Editar cliente' : 'Novo cliente'}</h1>
      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-4">
        <p className="text-sm font-semibold mb-3">Dados</p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nome *" value={f.nome} onChange={set('nome')} span="col-span-2" />
          <Campo label="Telefone" value={f.telefone} onChange={set('telefone')} />
          <Campo label="CPF / CNPJ" value={f.documento} onChange={set('documento')} />
          <Campo label="E-mail" value={f.email} onChange={set('email')} />
          <Campo label="Data de nascimento" type="date" value={f.dataNascimento} onChange={set('dataNascimento')} />
          <Campo label="Limite de crédito (R$)" value={f.limite} onChange={set('limite')} />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-4">
        <p className="text-sm font-semibold mb-3">Endereço</p>
        <div className="grid grid-cols-6 gap-3">
          <Campo label="CEP" value={f.cep} onChange={set('cep')} span="col-span-2" />
          <Campo label="Logradouro" value={f.logradouro} onChange={set('logradouro')} span="col-span-4" />
          <Campo label="Número" value={f.numero} onChange={set('numero')} span="col-span-2" />
          <Campo label="Complemento" value={f.complemento} onChange={set('complemento')} span="col-span-4" />
          <Campo label="Bairro" value={f.bairro} onChange={set('bairro')} span="col-span-3" />
          <Campo label="Cidade" value={f.cidade} onChange={set('cidade')} span="col-span-2" />
          <Campo label="UF" value={f.uf} onChange={set('uf')} span="col-span-1" />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-6">
        <label className="text-xs text-stone-500">Observação</label>
        <textarea value={f.observacao} onChange={(e) => set('observacao')(e.target.value)} rows={2} className={INP} />
      </div>

      <button onClick={onSalvar} disabled={salvar.isPending} className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60">
        {salvar.isPending ? 'Salvando...' : 'Salvar cliente'}
      </button>
    </div>
  );
}
