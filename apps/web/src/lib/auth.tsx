import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from './api';

export interface Usuario {
  id: string;
  nome: string;
  email: string | null;
  papel: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  logado: boolean;
  entrar: (identificador: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);
export const useAuth = () => useContext(AuthContext);

interface LoginResposta {
  token: string;
  usuario: Usuario;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [logado, setLogado] = useState<boolean>(!!tokenStore.get());

  // ao recarregar com token salvo, recupera o usuário
  useEffect(() => {
    if (tokenStore.get() && !usuario) {
      api<Usuario>('/auth/eu')
        .then(setUsuario)
        .catch(() => {
          tokenStore.clear();
          setLogado(false);
        });
    }
  }, [usuario]);

  async function entrar(identificador: string, senha: string) {
    const r = await api<LoginResposta>('/auth/login', {
      method: 'POST',
      body: { identificador, senha },
    });
    tokenStore.set(r.token);
    setUsuario(r.usuario);
    setLogado(true);
  }

  function sair() {
    tokenStore.clear();
    setUsuario(null);
    setLogado(false);
  }

  return (
    <AuthContext.Provider value={{ usuario, logado, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}
