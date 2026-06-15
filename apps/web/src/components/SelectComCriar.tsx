import { useState } from 'react';

interface Opcao {
  id: string;
  nome: string;
}

interface Props {
  label: string;
  obrigatorio?: boolean;
  opcoes: Opcao[] | undefined;
  value: string;
  onChange: (id: string) => void;
  onCriar: (nome: string) => Promise<Opcao>;
}

/** Dropdown com criação inline ("+ novo") — usado para categoria, marca, coleção, departamento. */
export function SelectComCriar({ label, obrigatorio, opcoes, value, onChange, onCriar }: Props) {
  const [novo, setNovo] = useState('');
  const [criando, setCriando] = useState(false);

  async function criar() {
    if (!novo.trim()) return;
    setCriando(true);
    try {
      const o = await onCriar(novo.trim());
      onChange(o.id);
      setNovo('');
    } finally {
      setCriando(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-stone-600">
        {label}
        {obrigatorio && <span className="text-rose-500"> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-3 bg-white outline-none focus:border-brand"
      >
        <option value="">Selecione...</option>
        {opcoes?.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
      <div className="flex gap-1 mt-1">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="+ adicionar novo"
          className="flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={criar}
          disabled={criando}
          className="text-xs border border-stone-200 rounded-lg px-3 bg-white hover:bg-stone-50 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
