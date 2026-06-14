import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Produtos } from './pages/Produtos';
import { NovoProduto } from './pages/NovoProduto';

export function App() {
  const { logado } = useAuth();

  if (!logado) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/novo" element={<NovoProduto />} />
        <Route path="*" element={<Navigate to="/produtos" replace />} />
      </Routes>
    </Layout>
  );
}
