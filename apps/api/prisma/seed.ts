import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Seed: a loja da Cláudia (persona primária) com catálogo de exemplo. */
async function main() {
  const email = 'claudia@mariabonita.com';
  if (await prisma.usuario.findFirst({ where: { email } })) {
    console.log('Seed já aplicado (Cláudia existe). Pulando.');
    return;
  }

  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { nomeNegocio: 'Maria Bonita Modas' } });
    const loja = await tx.loja.create({ data: { tenantId: tenant.id, nome: 'Loja Centro' } });
    await tx.configFiscal.create({ data: { lojaId: loja.id } });
    await tx.usuario.create({
      data: { tenantId: tenant.id, nome: 'Cláudia', email, papel: 'DONO', senhaHash },
    });
    await tx.formaPagamento.createMany({
      data: [
        { tenantId: tenant.id, nome: 'Dinheiro', tipo: 'DINHEIRO' },
        { tenantId: tenant.id, nome: 'Pix', tipo: 'PIX' },
        { tenantId: tenant.id, nome: 'Débito', tipo: 'DEBITO' },
        { tenantId: tenant.id, nome: 'Crédito', tipo: 'CREDITO' },
      ],
    });

    const categoria = await tx.categoria.create({
      data: { tenantId: tenant.id, nome: 'Vestidos', tipoModa: 'ROUPA' },
    });
    const marca = await tx.marca.create({ data: { tenantId: tenant.id, nome: 'Maria Bonita' } });
    const colecao = await tx.colecao.create({
      data: { tenantId: tenant.id, nome: 'Verão 26', ano: 2026, estacao: 'Verão' },
    });
    const produto = await tx.produto.create({
      data: {
        tenantId: tenant.id,
        nome: 'Vestido Floral Midi',
        categoriaId: categoria.id,
        marcaId: marca.id,
        colecaoId: colecao.id,
        custoCompraCentavos: 6000,
        markupPercentual: 150,
        precoBaseCentavos: 15000,
        ncm: '6204.42.00',
        origem: '0',
        unidade: 'UN',
      },
    });

    for (const cor of ['Preto', 'Vermelho']) {
      for (const tamanho of ['P', 'M', 'G']) {
        const v = await tx.variacao.create({
          data: {
            tenantId: tenant.id,
            produtoId: produto.id,
            cor,
            tamanho,
            skuInterno: `VFM-${cor[0]}${tamanho}`.toUpperCase(),
          },
        });
        await tx.saldoEstoque.create({
          data: { tenantId: tenant.id, lojaId: loja.id, variacaoId: v.id, quantidade: 10 },
        });
      }
    }

    console.log('Seed OK — Maria Bonita Modas / Cláudia (login: claudia@mariabonita.com / 123456)');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
