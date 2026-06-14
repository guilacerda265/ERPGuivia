import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ApiError } from '../lib/api';

export function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState('claudia@mariabonita.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await entrar(identificador, senha);
      navigate('/produtos');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 flex items-center justify-center text-2xl shadow-soft mb-4">
            🛍️
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Entrar na sua loja</h1>
          <p className="text-stone-500 text-sm mt-1">Bom te ver de novo 👋</p>
        </div>

        {erro && (
          <div className="mb-4 text-sm bg-rose-50 text-rose-600 rounded-xl px-4 py-3">{erro}</div>
        )}

        <label className="text-sm font-medium text-stone-600">E-mail ou celular</label>
        <input
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          className="mt-1 mb-4 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />

        <label className="text-sm font-medium text-stone-600">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-1 mb-6 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />

        <button
          disabled={carregando}
          className="w-full bg-brand text-white font-semibold py-3.5 rounded-2xl shadow-soft disabled:opacity-60"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
