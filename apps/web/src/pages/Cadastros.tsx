import { ListaEditavel } from '../components/ListaEditavel';
import { GradesEditor } from '../components/GradesEditor';

export function Cadastros() {
  return (
    <div className="p-5 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Cadastros</h1>
      <p className="text-sm text-stone-400 mb-6">
        Gerencie as listas usadas nos produtos. Renomeie ou adicione novos.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <ListaEditavel titulo="Categorias" recurso="categorias" />
        <ListaEditavel titulo="Marcas" recurso="marcas" />
        <ListaEditavel titulo="Departamentos" recurso="departamentos" />
        <ListaEditavel titulo="Coleções" recurso="colecoes" />
        <ListaEditavel titulo="Cores" recurso="cores" />
      </div>
      <GradesEditor />
    </div>
  );
}
