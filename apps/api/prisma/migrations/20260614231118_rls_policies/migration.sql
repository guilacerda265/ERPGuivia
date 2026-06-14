-- RLS: isolamento por tenant (A1 do domínio).
-- Política: uma linha só é visível/gravável quando seu tenant casa com o contexto
-- da requisição, definido por `SET LOCAL app.tenant_id = '<id>'` (Fase 2).
--
-- ENABLE (não FORCE): o role OWNER (usado em migrações e seed) contorna a RLS — por isso
-- o bootstrap funciona. O enforcement real acontece ao conectar a aplicação com um role
-- NÃO-owner (passo de hardening). As policies já ficam prontas para esse momento.

-- tabela raiz: filtra pelo próprio id
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tenants"
  USING (id = current_setting('app.tenant_id', true))
  WITH CHECK (id = current_setting('app.tenant_id', true));

-- demais tabelas com coluna tenant_id
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'usuarios', 'lojas', 'categorias', 'marcas', 'colecoes', 'produtos', 'variacoes',
    'fornecedores', 'entradas_estoque', 'saldos_estoque', 'movimentos_estoque',
    'formas_pagamento', 'vendas', 'sessoes_caixa', 'lancamentos_caixa', 'clientes'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I '
      'USING ("tenantId" = current_setting(''app.tenant_id'', true)) '
      'WITH CHECK ("tenantId" = current_setting(''app.tenant_id'', true));',
      t
    );
  END LOOP;
END $$;
