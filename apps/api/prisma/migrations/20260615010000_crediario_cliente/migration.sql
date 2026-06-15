-- Cliente robusto + config de crediário + conta a receber.

-- Cliente: novos campos
ALTER TABLE "clientes" ADD COLUMN "dataNascimento" TEXT;
ALTER TABLE "clientes" ADD COLUMN "cep" TEXT;
ALTER TABLE "clientes" ADD COLUMN "logradouro" TEXT;
ALTER TABLE "clientes" ADD COLUMN "numero" TEXT;
ALTER TABLE "clientes" ADD COLUMN "complemento" TEXT;
ALTER TABLE "clientes" ADD COLUMN "bairro" TEXT;
ALTER TABLE "clientes" ADD COLUMN "cidade" TEXT;
ALTER TABLE "clientes" ADD COLUMN "uf" TEXT;
ALTER TABLE "clientes" ADD COLUMN "limiteCreditoCentavos" INTEGER NOT NULL DEFAULT 0;

-- Config de crediário (1 por tenant)
CREATE TABLE "config_crediario" (
    "tenantId" TEXT NOT NULL,
    "exigeCpf" BOOLEAN NOT NULL DEFAULT true,
    "exigeTelefone" BOOLEAN NOT NULL DEFAULT true,
    "exigeEndereco" BOOLEAN NOT NULL DEFAULT false,
    "exigeNascimento" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "config_crediario_pkey" PRIMARY KEY ("tenantId")
);

-- Conta a receber
CREATE TABLE "contas_receber" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendaId" TEXT,
    "valorTotalCentavos" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contas_receber_tenantId_lojaId_idx" ON "contas_receber"("tenantId", "lojaId");
CREATE INDEX "contas_receber_clienteId_idx" ON "contas_receber"("clienteId");

-- FKs
ALTER TABLE "config_crediario" ADD CONSTRAINT "config_crediario_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_lojaId_fkey"
    FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS nas novas tabelas
ALTER TABLE "config_crediario" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "config_crediario"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

ALTER TABLE "contas_receber" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "contas_receber"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
