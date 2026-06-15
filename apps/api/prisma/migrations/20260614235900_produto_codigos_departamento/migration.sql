-- Departamento (masculino/feminino/infantil) + código do produto.

-- CreateTable
CREATE TABLE "departamentos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "departamentos_tenantId_idx" ON "departamentos"("tenantId");

-- AlterTable produtos
ALTER TABLE "produtos" ADD COLUMN "codigo" TEXT;
ALTER TABLE "produtos" ADD COLUMN "departamentoId" TEXT;

CREATE UNIQUE INDEX "produtos_tenantId_codigo_key" ON "produtos"("tenantId", "codigo");

-- Foreign keys
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_departamentoId_fkey"
    FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS na nova tabela (consistente com a migração de policies)
ALTER TABLE "departamentos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "departamentos"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
