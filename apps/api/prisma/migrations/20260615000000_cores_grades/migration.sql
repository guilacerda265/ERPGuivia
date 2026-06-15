-- Cores cadastráveis + tipos de grade de tamanhos personalizáveis.

CREATE TABLE "cores" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "hex" TEXT,
    CONSTRAINT "cores_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cores_tenantId_idx" ON "cores"("tenantId");

CREATE TABLE "grades_tamanho" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tamanhos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    CONSTRAINT "grades_tamanho_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "grades_tamanho_tenantId_idx" ON "grades_tamanho"("tenantId");

ALTER TABLE "cores" ADD CONSTRAINT "cores_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grades_tamanho" ADD CONSTRAINT "grades_tamanho_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS (consistente com as demais tabelas)
ALTER TABLE "cores" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "cores"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

ALTER TABLE "grades_tamanho" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "grades_tamanho"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
