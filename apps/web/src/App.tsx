import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Produtos } from './pages/Produtos';
import { NovoProduto } from './pages/NovoProduto';
import { ProdutoDetalhe } from './pages/ProdutoDetalhe';
import { EditarProduto } from './pages/EditarProduto';
import { Cadastros } from './pages/Cadastros';
import { Estoque } from './pages/Estoque';
import { EntradaEstoque } from './pages/EntradaEstoque';
import { Venda } from './pages/Venda';
import { Dashboard } from './pages/Dashboard';
import { Caixa } from './pages/Caixa';

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/caixa" element={<Caixa />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/novo" element={<NovoProduto />} />
        <Route path="/produtos/:id/editar" element={<EditarProduto />} />
        <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
        <Route path="/cadastros" element={<Cadastros />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/estoque/entrada" element={<EntradaEstoque />} />
        <Route path="/vender" element={<Venda />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
