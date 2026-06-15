import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { precoSugeridoCentavos } from '@erp/shared';
import { api, ApiError } from '../lib/api';
import { SelectComCriar } from '../components/SelectComCriar';

interface Opcao {
  id: string;
  nome: string;
}

const CORES = ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Rosa', 'Bege'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', '38', '40', '42'];

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const reaisParaCentavos = (s: string) => Math.round((parseFloat(s.replace(',', '.')) || 0) * 100);

export function NovoProduto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
  const [markup, setMarkup] = useState('100');
  const [precoVenda, setPrecoVenda] = useState('');
  const [editouPreco, setEditouPreco] = useState(false);
  const [cores, setCores] = useState<string[]>(['Preto']);
  const [tamanhos, setTamanhos] = useState<string[]>(['M']);
  const [barras, setBarras] = useState<Record<string, string>>({});
  const [erro, setErro] = useState('');

  const custoCentavos = reaisParaCentavos(custo);
  const markupNum = parseInt(markup, 10) || 0;
  const sugeridoCentavos = precoSugeridoCentavos(custoCentavos, markupNum);

  // mantém o preço de venda sincronizado com o sugerido até o usuário editar manualmente
  useEffect(() => {
    if (!editouPreco) setPrecoVenda((sugeridoCentavos / 100).toFixed(2).replace('.', ','));
  }, [sugeridoCentavos, editouPreco]);

  const precoVendaCentavos = reaisParaCentavos(precoVenda);
  const totalVariacoes = cores.length * tamanhos.length;

  function toggle(lista: string[], set: (v: string[]) => void, valor: string) {
    set(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  }

  const salvar = useMutation({
    mutationFn: () => {
      const variacoes = cores.flatMap((cor) =>
        tamanhos.map((tamanho) => ({
          cor,
          tamanho,
          codigoBarras: barras[`${cor}__${tamanho}`]?.trim() || undefined,
        })),
      );
      return api('/catalogo/produtos', {
        method: 'POST',
        body: {
          nome,
          categoriaId,
          marcaId,
          colecaoId: colecaoId || undefined,
          departamentoId: departamentoId || undefined,
          custoCompraCentavos: custoCentavos,
          markupPercentual: markupNum,
          precoBaseCentavos: precoVendaCentavos,
          variacoes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      navigate('/produtos');
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Erro ao salvar.'),
  });

  function onSalvar() {
    setErro('');
    if (!nome.trim()) return setErro('Informe o nome do produto.');
    if (!categoriaId) return setErro('Escolha a categoria (obrigatório).');
    if (!marcaId) return setErro('Escolha a marca (obrigatório).');
    if (cores.length === 0 || tamanhos.length === 0)
      return setErro('Escolha ao menos uma cor e um tamanho.');
    salvar.mutate();
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <button onClick={() => navigate('/produtos')} className="text-stone-400 text-sm mb-3">
        ← Produtos
      </button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Adicionar produto</h1>

      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <label className="text-sm font-medium text-stone-600">Nome do produto</label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: Camiseta Básica"
        className="mt-1 mb-5 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />

      {/* categorização */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <SelectComCriar label="Categoria" obrigatorio opcoes={categorias.data} value={categoriaId} onChange={setCategoriaId} onCriar={criarRecurso('categorias')} />
        <SelectComCriar label="Marca" obrigatorio opcoes={marcas.data} value={marcaId} onChange={setMarcaId} onCriar={criarRecurso('marcas')} />
        <SelectComCriar label="Departamento" opcoes={departamentos.data} value={departamentoId} onChange={setDepartamentoId} onCriar={criarRecurso('departamentos')} />
        <SelectComCriar label="Coleção" opcoes={colecoes.data} value={colecaoId} onChange={setColecaoId} onCriar={criarRecurso('colecoes')} />
      </div>

      {/* preço */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-5">
        <p className="text-sm font-semibold mb-3">Preço</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-stone-500">Quanto você pagou (R$)</label>
            <input value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs text-stone-500">Margem (%)</label>
            <input value={markup} onChange={(e) => setMarkup(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs text-stone-500">Preço de venda (R$)</label>
            <input
              value={precoVenda}
              onChange={(e) => { setEditouPreco(true); setPrecoVenda(e.target.value); }}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand font-semibold text-brand"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-stone-400">Sugerido: {brl(sugeridoCentavos)}</span>
          {editouPreco && (
            <button onClick={() => { setEditouPreco(false); setPrecoVenda((sugeridoCentavos / 100).toFixed(2).replace('.', ',')); }} className="text-brand font-medium">
              usar sugerido
            </button>
          )}
          <span className="text-emerald-600 ml-auto">lucro {brl(Math.max(0, precoVendaCentavos - custoCentavos))}</span>
        </div>
      </div>

      {/* grade */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-6">
        <p className="text-sm font-semibold">Cores e tamanhos</p>
        <p className="text-xs text-stone-400 mt-0.5 mb-3">A gente monta a grade. Códigos e barras são gerados — digite o de barras só se usar o do fornecedor.</p>

        <p className="text-xs font-medium text-stone-500 mb-1.5">Cores</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {CORES.map((c) => (
            <button type="button" key={c} onClick={() => toggle(cores, setCores, c)} className={`text-sm border rounded-full px-3 py-1.5 ${cores.includes(c) ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'}`}>{c}</button>
          ))}
        </div>
        <p className="text-xs font-medium text-stone-500 mb-1.5">Tamanhos</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TAMANHOS.map((t) => (
            <button type="button" key={t} onClick={() => toggle(tamanhos, setTamanhos, t)} className={`text-sm border rounded-lg px-3 h-9 ${tamanhos.includes(t) ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'}`}>{t}</button>
          ))}
        </div>

        {totalVariacoes > 0 && (
          <div className="border-t border-stone-100 pt-3">
            <p className="text-xs text-stone-400 mb-2">{totalVariacoes} variações · código de barras (opcional)</p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {cores.flatMap((cor) =>
                tamanhos.map((tam) => {
                  const k = `${cor}__${tam}`;
                  return (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 text-stone-600">{cor} · {tam}</span>
                      <input
                        value={barras[k] ?? ''}
                        onChange={(e) => setBarras((b) => ({ ...b, [k]: e.target.value }))}
                        placeholder="automático"
                        className="flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        )}
      </div>

      <button onClick={onSalvar} disabled={salvar.isPending} className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60">
        {salvar.isPending ? 'Salvando...' : 'Salvar produto'}
      </button>
    </div>
  );
}
