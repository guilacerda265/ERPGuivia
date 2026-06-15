import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { precoSugeridoCentavos } from '@erp/shared';
import { api, ApiError } from '../lib/api';
import { SelectComCriar } from '../components/SelectComCriar';

interface Opcao {
  id: string;
  nome: string;
}
interface VarEdit {
  id?: string;
  cor: string;
  tamanho: string;
  codigoBarras: string;
  ativo: boolean;
}
interface Produto {
  id: string;
  nome: string;
  categoriaId: string | null;
  marcaId: string | null;
  colecaoId: string | null;
  departamentoId: string | null;
  custoCompraCentavos: number;
  markupPercentual: number;
  precoBaseCentavos: number;
  variacoes: { id: string; cor: string; tamanho: string; codigoBarras: string | null; ativo: boolean }[];
}

const CORES = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Rosa', 'Bege'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', '38', '40', '42'];
const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const centavos = (s: string) => Math.round((parseFloat(s.replace(',', '.')) || 0) * 100);
const reais = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: produto } = useQuery({
    queryKey: ['produto', id],
    queryFn: () => api<Produto>(`/catalogo/produtos/${id}`),
  });
  const categorias = useQuery({ queryKey: ['categorias'], queryFn: () => api<Opcao[]>('/catalogo/categorias') });
  const marcas = useQuery({ queryKey: ['marcas'], queryFn: () => api<Opcao[]>('/catalogo/marcas') });
  const colecoes = useQuery({ queryKey: ['colecoes'], queryFn: () => api<Opcao[]>('/catalogo/colecoes') });
  const departamentos = useQuery({ queryKey: ['departamentos'], queryFn: () => api<Opcao[]>('/catalogo/departamentos') });

  const criarRecurso = (recurso: string) => async (nome: string) => {
    const o = await api<Opcao>(`/catalogo/${recurso}`, { method: 'POST', body: { nome } });
    queryClient.invalidateQueries({ queryKey: [recurso] });
    return o;
  };

  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [colecaoId, setColecaoId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [custo, setCusto] = useState('');
  const [markup, setMarkup] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [variacoes, setVariacoes] = useState<VarEdit[]>([]);
  const [novaCor, setNovaCor] = useState('Preto');
  const [novoTam, setNovoTam] = useState('M');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!produto) return;
    setNome(produto.nome);
    setCategoriaId(produto.categoriaId ?? '');
    setMarcaId(produto.marcaId ?? '');
    setColecaoId(produto.colecaoId ?? '');
    setDepartamentoId(produto.departamentoId ?? '');
    setCusto(reais(produto.custoCompraCentavos));
    setMarkup(String(produto.markupPercentual));
    setPrecoVenda(reais(produto.precoBaseCentavos));
    setVariacoes(
      produto.variacoes.map((v) => ({ id: v.id, cor: v.cor, tamanho: v.tamanho, codigoBarras: v.codigoBarras ?? '', ativo: v.ativo })),
    );
  }, [produto]);

  const sugerido = precoSugeridoCentavos(centavos(custo), parseInt(markup, 10) || 0);

  function adicionarVariacao() {
    if (variacoes.some((v) => v.cor === novaCor && v.tamanho === novoTam)) return;
    setVariacoes((vs) => [...vs, { cor: novaCor, tamanho: novoTam, codigoBarras: '', ativo: true }]);
  }
  function mudarVar(i: number, patch: Partial<VarEdit>) {
    setVariacoes((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  const salvar = useMutation({
    mutationFn: () =>
      api(`/catalogo/produtos/${id}`, {
        method: 'PUT',
        body: {
          nome,
          categoriaId,
          marcaId,
          colecaoId: colecaoId || undefined,
          departamentoId: departamentoId || undefined,
          custoCompraCentavos: centavos(custo),
          markupPercentual: parseInt(markup, 10) || 0,
          precoBaseCentavos: centavos(precoVenda),
          variacoes: variacoes.map((v) => ({
            id: v.id,
            cor: v.cor,
            tamanho: v.tamanho,
            codigoBarras: v.codigoBarras.trim() || undefined,
            ativo: v.ativo,
          })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', id] });
      navigate(`/produtos/${id}`);
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao salvar.'),
  });

  function onSalvar() {
    setErro('');
    if (!nome.trim()) return setErro('Informe o nome do produto.');
    if (!categoriaId) return setErro('Escolha a categoria (obrigatório).');
    if (!marcaId) return setErro('Escolha a marca (obrigatório).');
    salvar.mutate();
  }

  if (!produto) return <div className="p-5 lg:p-8 text-stone-400">Carregando...</div>;

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <button onClick={() => navigate(`/produtos/${id}`)} className="text-stone-400 text-sm mb-3">← Voltar</button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Editar produto</h1>
      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <label className="text-sm font-medium text-stone-600">Nome do produto</label>
      <input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 mb-5 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-brand" />

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <SelectComCriar label="Categoria" obrigatorio opcoes={categorias.data} value={categoriaId} onChange={setCategoriaId} onCriar={criarRecurso('categorias')} />
        <SelectComCriar label="Marca" obrigatorio opcoes={marcas.data} value={marcaId} onChange={setMarcaId} onCriar={criarRecurso('marcas')} />
        <SelectComCriar label="Departamento" opcoes={departamentos.data} value={departamentoId} onChange={setDepartamentoId} onCriar={criarRecurso('departamentos')} />
        <SelectComCriar label="Coleção" opcoes={colecoes.data} value={colecaoId} onChange={setColecaoId} onCriar={criarRecurso('colecoes')} />
      </div>

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-5">
        <p className="text-sm font-semibold mb-3">Preço</p>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-stone-500">Custo (R$)</label><input value={custo} onChange={(e) => setCusto(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" /></div>
          <div><label className="text-xs text-stone-500">Margem (%)</label><input value={markup} onChange={(e) => setMarkup(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" /></div>
          <div><label className="text-xs text-stone-500">Preço de venda (R$)</label><input value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand font-semibold text-brand" /></div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-stone-400">Sugerido: {brl(sugerido)}</span>
          <button onClick={() => setPrecoVenda(reais(sugerido))} className="text-brand font-medium">usar sugerido</button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-6">
        <p className="text-sm font-semibold mb-3">Grade</p>
        <div className="space-y-1.5 mb-4">
          {variacoes.map((v, i) => (
            <div key={v.id ?? `novo-${i}`} className={`flex items-center gap-2 text-sm ${v.ativo ? '' : 'opacity-40'}`}>
              <span className="w-24 shrink-0 text-stone-600">{v.cor} · {v.tamanho}</span>
              <input
                value={v.codigoBarras}
                onChange={(e) => mudarVar(i, { codigoBarras: e.target.value })}
                placeholder="cód. barras (auto)"
                className="flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
              />
              {!v.id && <span className="text-[10px] text-emerald-600 font-medium">nova</span>}
              <button
                onClick={() => mudarVar(i, { ativo: !v.ativo })}
                className={`text-xs px-2 py-1.5 rounded-lg border ${v.ativo ? 'border-stone-200 text-stone-500' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}`}
              >
                {v.ativo ? 'Remover' : 'Incluir'}
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-end border-t border-stone-100 pt-3">
          <div><label className="text-xs text-stone-500">Cor</label><select value={novaCor} onChange={(e) => setNovaCor(e.target.value)} className="mt-1 rounded-lg border border-stone-200 px-2 py-2 text-sm bg-white">{CORES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs text-stone-500">Tamanho</label><select value={novoTam} onChange={(e) => setNovoTam(e.target.value)} className="mt-1 rounded-lg border border-stone-200 px-2 py-2 text-sm bg-white">{TAMANHOS.map((t) => <option key={t}>{t}</option>)}</select></div>
          <button onClick={adicionarVariacao} className="text-sm border border-brand text-brand rounded-lg px-3 py-2 font-medium hover:bg-brand-light">+ variação</button>
        </div>
      </div>

      <button onClick={onSalvar} disabled={salvar.isPending} className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60">
        {salvar.isPending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  );
}
