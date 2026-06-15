-- Parcelamento e recebimento do crediário.

CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contaReceberId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "vencimento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "pagoEm" TIMESTAMP(3),
    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "parcelas_tenantId_contaReceberId_idx" ON "parcelas"("tenantId", "contaReceberId");
CREATE INDEX "parcelas_tenantId_status_idx" ON "parcelas"("tenantId", "status");

CREATE TABLE "recebimentos_parcela" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parcelaId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "formaPagamentoId" TEXT,
    "usuarioId" TEXT,
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recebimentos_parcela_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "recebimentos_parcela_tenantId_idx" ON "recebimentos_parcela"("tenantId");

ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_contaReceberId_fkey"
    FOREIGN KEY ("contaReceberId") REFERENCES "contas_receber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recebimentos_parcela" ADD CONSTRAINT "recebimentos_parcela_parcelaId_fkey"
    FOREIGN KEY ("parcelaId") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "parcelas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "parcelas"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

ALTER TABLE "recebimentos_parcela" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "recebimentos_parcela"
    USING ("tenantId" = current_setting('app.tenant_id', true))
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
