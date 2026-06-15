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
interface Cor {
  id: string;
  nome: string;
  hex: string | null;
}
interface Grade {
  id: string;
  nome: string;
  tamanhos: string[];
}

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const reaisParaCentavos = (s: string) => Math.round((parseFloat(s.replace(',', '.')) || 0) * 100);

export function NovoProduto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categorias = useQuery({ queryKey: ['categorias'], queryFn: () => api<Opcao[]>('/catalogo/categorias') });
  const marcas = useQuery({ queryKey: ['marcas'], queryFn: () => api<Opcao[]>('/catalogo/marcas') });
  const colecoes = useQuery({ queryKey: ['colecoes'], queryFn: () => api<Opcao[]>('/catalogo/colecoes') });
  const departamentos = useQuery({ queryKey: ['departamentos'], queryFn: () => api<Opcao[]>('/catalogo/departamentos') });
  const cores = useQuery({ queryKey: ['cores'], queryFn: () => api<Cor[]>('/catalogo/cores') });
  const grades = useQuery({ queryKey: ['grades'], queryFn: () => api<Grade[]>('/catalogo/grades') });

  const criarRecurso = (recurso: string) => async (nome: string) => {
    const o = await api<Opcao>(`/catalogo/${recurso}`, { method: 'POST', body: { nome } });
    queryClient.invalidateQueries({ queryKey: [recurso] });
    return o;
  };

  const [nome, setNome] = useState('');
  const [editouNome, setEditouNome] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [colecaoId, setColecaoId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [custo, setCusto] = useState('');
  const [markup, setMarkup] = useState('100');
  const [precoVenda, setPrecoVenda] = useState('');
  const [editouPreco, setEditouPreco] = useState(false);
  const [coresSel, setCoresSel] = useState<string[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [tamanhosSel, setTamanhosSel] = useState<string[]>([]);
  const [novaCor, setNovaCor] = useState('');
  const [barras, setBarras] = useState<Record<string, string>>({});
  const [erro, setErro] = useState('');

  const custoCentavos = reaisParaCentavos(custo);
  const markupNum = parseInt(markup, 10) || 0;
  const sugeridoCentavos = precoSugeridoCentavos(custoCentavos, markupNum);
  useEffect(() => {
    if (!editouPreco) setPrecoVenda((sugeridoCentavos / 100).toFixed(2).replace('.', ','));
  }, [sugeridoCentavos, editouPreco]);
  const precoVendaCentavos = reaisParaCentavos(precoVenda);

  // nome sugerido: marca - categoria - departamento (enquanto a loja não editar à mão)
  const nomeDe = (lista: Opcao[] | undefined, id: string) => lista?.find((o) => o.id === id)?.nome;
  const nomeSugerido = [
    nomeDe(marcas.data, marcaId),
    nomeDe(categorias.data, categoriaId),
    nomeDe(departamentos.data, departamentoId),
  ]
    .filter(Boolean)
    .join(' ');
  useEffect(() => {
    if (!editouNome && nomeSugerido) setNome(nomeSugerido);
  }, [nomeSugerido, editouNome]);

  const gradeSel = grades.data?.find((g) => g.id === gradeId);
  const totalVariacoes = coresSel.length * tamanhosSel.length;

  function toggle(lista: string[], set: (v: string[]) => void, valor: string) {
    set(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  }
  function selecionarGrade(id: string) {
    setGradeId(id);
    const g = grades.data?.find((x) => x.id === id);
    setTamanhosSel(g ? g.tamanhos : []);
  }
  async function adicionarCor() {
    if (!novaCor.trim()) return;
    const o = await api<Opcao>('/catalogo/cores', { method: 'POST', body: { nome: novaCor.trim() } });
    queryClient.invalidateQueries({ queryKey: ['cores'] });
    setCoresSel((c) => [...c, o.nome]);
    setNovaCor('');
  }

  const salvar = useMutation({
    mutationFn: () => {
      const variacoes = coresSel.flatMap((cor) =>
        tamanhosSel.map((tamanho) => ({
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
    if (coresSel.length === 0) return setErro('Escolha ao menos uma cor.');
    if (tamanhosSel.length === 0) return setErro('Escolha a grade e ao menos um tamanho.');
    salvar.mutate();
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <button onClick={() => navigate('/produtos')} className="text-stone-400 text-sm mb-3">← Produtos</button>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Adicionar produto</h1>
      {erro && <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>}

      <label className="text-sm font-medium text-stone-600">Nome do produto</label>
      <input value={nome} onChange={(e) => { setEditouNome(true); setNome(e.target.value); }} placeholder="Escolha marca e categoria para sugerir" className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
      <div className="h-4 mt-1 mb-4 text-xs">
        {editouNome && nomeSugerido && nomeSugerido !== nome.trim() && (
          <span className="text-stone-400">
            Sugestão: {nomeSugerido} ·{' '}
            <button type="button" onClick={() => { setEditouNome(false); setNome(nomeSugerido); }} className="text-brand font-medium">
              usar
            </button>
          </span>
        )}
      </div>

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
          <div><label className="text-xs text-stone-500">Quanto você pagou (R$)</label><input value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" /></div>
          <div><label className="text-xs text-stone-500">Margem (%)</label><input value={markup} onChange={(e) => setMarkup(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand" /></div>
          <div><label className="text-xs text-stone-500">Preço de venda (R$)</label><input value={precoVenda} onChange={(e) => { setEditouPreco(true); setPrecoVenda(e.target.value); }} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand font-semibold text-brand" /></div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-stone-400">Sugerido: {brl(sugeridoCentavos)}</span>
          {editouPreco && <button onClick={() => { setEditouPreco(false); setPrecoVenda((sugeridoCentavos / 100).toFixed(2).replace('.', ',')); }} className="text-brand font-medium">usar sugerido</button>}
          <span className="text-emerald-600 ml-auto">lucro {brl(Math.max(0, precoVendaCentavos - custoCentavos))}</span>
        </div>
      </div>

      {/* cores e grade */}
      <div className="rounded-2xl bg-white border border-stone-200/70 shadow-soft p-4 mb-6">
        <p className="text-sm font-semibold">Cores e tamanhos</p>
        <p className="text-xs text-stone-400 mt-0.5 mb-3">Selecione as cores e a grade de tamanhos. A gente monta a grade.</p>

        <p className="text-xs font-medium text-stone-500 mb-1.5">Cores</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {cores.data?.map((c) => (
            <button type="button" key={c.id} onClick={() => toggle(coresSel, setCoresSel, c.nome)} className={`flex items-center gap-1.5 text-sm border rounded-full px-3 py-1.5 ${coresSel.includes(c.nome) ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'}`}>
              {c.hex && <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: c.hex }} />}
              {c.nome}
            </button>
          ))}
          {cores.data && cores.data.length === 0 && <span className="text-xs text-stone-400">Nenhuma cor. Adicione abaixo ou em Cadastros.</span>}
        </div>
        <div className="flex gap-1 mb-4">
          <input value={novaCor} onChange={(e) => setNovaCor(e.target.value)} placeholder="+ nova cor" className="w-40 rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand" />
          <button type="button" onClick={adicionarCor} className="text-xs border border-stone-200 rounded-lg px-3 bg-white hover:bg-stone-50">Add</button>
        </div>

        <p className="text-xs font-medium text-stone-500 mb-1.5">Grade de tamanhos</p>
        <select value={gradeId} onChange={(e) => selecionarGrade(e.target.value)} className="w-full sm:w-64 rounded-xl border border-stone-200 px-3 py-2.5 bg-white text-sm outline-none focus:border-brand">
          <option value="">Escolha a grade...</option>
          {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
        </select>
        {grades.data && grades.data.length === 0 && <p className="text-xs text-stone-400 mt-1">Nenhuma grade. Crie em Cadastros → Grades de tamanho.</p>}
        {gradeSel && (
          <div className="flex flex-wrap gap-2 mt-2">
            {gradeSel.tamanhos.map((t) => (
              <button type="button" key={t} onClick={() => toggle(tamanhosSel, setTamanhosSel, t)} className={`text-sm border rounded-lg px-3 h-9 ${tamanhosSel.includes(t) ? 'bg-brand text-white border-brand' : 'border-stone-200 bg-white'}`}>{t}</button>
            ))}
          </div>
        )}

        {totalVariacoes > 0 && (
          <div className="border-t border-stone-100 pt-3 mt-4">
            <p className="text-xs text-stone-400 mb-2">{totalVariacoes} variações · código de barras (opcional)</p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {coresSel.flatMap((cor) =>
                tamanhosSel.map((tam) => {
                  const k = `${cor}__${tam}`;
                  return (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 text-stone-600">{cor} · {tam}</span>
                      <input value={barras[k] ?? ''} onChange={(e) => setBarras((b) => ({ ...b, [k]: e.target.value }))} placeholder="automático" className="flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand" />
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
