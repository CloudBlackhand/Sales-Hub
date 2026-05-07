import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import {
  ActivityStatus,
  CommissionStatus,
  CommissionType,
  CompanyPlan,
  MemberRole,
  PostSaleType,
  ProductType,
  SaleStatus,
  SaleType,
  TransactionType,
} from "../src/generated/prisma/enums";

const DEMO_EMAIL = "admin@saleshub.demo";
const DEMO_PASSWORD = "admin";
const COMPANY_SLUG = "empresa-demo";

/**
 * Migrações Prisma (`prisma migrate`) só criam/atualizam o **schema** (tabelas).
 * Este script é o **seed** (`prisma db seed`): cria o login demo e a empresa fictícia.
 *
 * Better Auth (email/senha) espera uma linha em `account` com:
 * `providerId: "credential"` e `accountId` igual ao **id do usuário** (ver fluxo interno do pacote).
 */
async function ensureDemoUserAndCredential(
  prisma: PrismaClient,
  passwordHash: string
): Promise<{ id: string; email: string; name: string }> {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Administrador Demo",
        email: DEMO_EMAIL,
        emailVerified: true,
      },
    });
    console.log("[seed] Usuário demo criado:", DEMO_EMAIL);
  } else {
    console.log("[seed] Usuário demo já existe; garantindo conta credential e senha.");
  }

  const credential = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!credential) {
    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
    console.log("[seed] Registro em `account` (credential) criado.");
  } else {
    await prisma.account.update({
      where: { id: credential.id },
      data: {
        accountId: user.id,
        password: passwordHash,
      },
    });
    console.log("[seed] Conta credential atualizada (senha demo admin/admin + accountId).");
  }

  return user;
}

async function seedDemoCompanyAndSampleData(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  let company = await prisma.company.findUnique({ where: { slug: COMPANY_SLUG } });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Empresa Demonstração",
        slug: COMPANY_SLUG,
        plan: CompanyPlan.PRO,
        onboarded: true,
        email: "contato@empresa-demo.local",
        phone: "(11) 99999-0000",
      },
    });
    console.log("[seed] Empresa fictícia criada:", COMPANY_SLUG);
  } else {
    console.log("[seed] Empresa demo já existe:", COMPANY_SLUG);
  }

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId: company.id } },
  });
  if (!membership) {
    await prisma.companyMember.create({
      data: {
        userId,
        companyId: company.id,
        role: MemberRole.OWNER,
      },
    });
    console.log("[seed] Usuário demo vinculado como OWNER da empresa.");
  }

  const settings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
  });
  if (!settings) {
    await prisma.companySettings.create({
      data: {
        companyId: company.id,
        commissionDefaultType: CommissionType.PERCENTAGE,
        commissionDefaultValue: new Prisma.Decimal("5"),
        currency: "BRL",
      },
    });
  }

  const sellerCount = await prisma.seller.count({ where: { companyId: company.id } });
  if (sellerCount > 0) {
    console.log("[seed] Dados de exemplo (vendedores/produtos/vendas) já presentes — pulando.");
    return;
  }

  const sellerA = await prisma.seller.create({
    data: {
      companyId: company.id,
      code: "V01",
      name: "João Silva",
      email: "joao@empresa-demo.local",
      commissionType: CommissionType.PERCENTAGE,
      commissionValue: new Prisma.Decimal("10"),
      isActive: true,
    },
  });

  const sellerB = await prisma.seller.create({
    data: {
      companyId: company.id,
      code: "V02",
      name: "Maria Santos",
      email: "maria@empresa-demo.local",
      commissionType: CommissionType.FIXED,
      commissionValue: new Prisma.Decimal("150"),
      isActive: true,
    },
  });

  const prodNotebook = await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Notebook Empresarial",
      sku: "NB-PRO-01",
      type: ProductType.PRODUCT,
      price: new Prisma.Decimal("2500"),
      stock: 42,
      description: "Equipamento para equipe comercial — exemplo de catálogo.",
    },
  });

  await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Consultoria de vendas (hora)",
      sku: null,
      type: ProductType.SERVICE,
      price: new Prisma.Decimal("350"),
      description: "Serviço — exemplo para ticket médio e KPIs.",
    },
  });

  await prisma.product.create({
    data: {
      companyId: company.id,
      name: "Projetor 4K (aluguel/dia)",
      sku: "ALU-PROJ-1",
      type: ProductType.RENTAL,
      price: new Prisma.Decimal("120"),
      rentalPricePerDay: new Prisma.Decimal("120"),
      description: "Aluguel de equipamento — exemplo de tipo RENTAL.",
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Cliente Alpha Ltda",
      email: "compras@alpha.example",
      phone: "(11) 3456-7890",
      tags: ["corporativo", "recorrente"],
      notes: "Cliente fictício para demonstração do CRM.",
    },
  });

  await prisma.customer.create({
    data: {
      companyId: company.id,
      name: "Beta Comércio ME",
      email: "contato@beta.example",
      tags: ["novo"],
    },
  });

  const saleTotal = new Prisma.Decimal("5000");
  const itemQty = new Prisma.Decimal("2");
  const unitPrice = new Prisma.Decimal("2500");
  const itemDiscount = new Prisma.Decimal("0");
  const itemTotal = new Prisma.Decimal("5000");

  const saleDate = new Date();
  const sale = await prisma.sale.create({
    data: {
      companyId: company.id,
      sellerId: sellerA.id,
      customerId: customer1.id,
      number: 1,
      type: SaleType.SALE,
      status: SaleStatus.CONFIRMED,
      totalAmount: saleTotal,
      discount: new Prisma.Decimal("0"),
      notes: "Venda de exemplo — confira comissão e financeiro.",
      saleDate,
      items: {
        create: [
          {
            productId: prodNotebook.id,
            description: "Notebook Empresarial x2",
            quantity: itemQty,
            unitPrice,
            discount: itemDiscount,
            totalPrice: itemTotal,
          },
        ],
      },
    },
  });

  const commissionAmount = new Prisma.Decimal("500");

  await prisma.commission.create({
    data: {
      companyId: company.id,
      saleId: sale.id,
      sellerId: sellerA.id,
      baseAmount: saleTotal,
      rate: new Prisma.Decimal("10"),
      amount: commissionAmount,
      type: CommissionType.PERCENTAGE,
      status: CommissionStatus.PENDING,
    },
  });

  await prisma.financialTransaction.create({
    data: {
      companyId: company.id,
      type: TransactionType.INCOME,
      category: "Vendas",
      amount: saleTotal,
      description: `Venda #${sale.number} — demonstração`,
      referenceId: sale.id,
      referenceType: "sale",
      date: saleDate,
    },
  });

  await prisma.postSaleActivity.create({
    data: {
      companyId: company.id,
      saleId: sale.id,
      type: PostSaleType.FOLLOWUP,
      status: ActivityStatus.OPEN,
      title: "Ligar para satisfação (7 dias)",
      notes: "Atividade de pós-venda de exemplo.",
      scheduledAt: new Date(saleDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      assignedToSellerId: sellerA.id,
    },
  });

  await prisma.sale.create({
    data: {
      companyId: company.id,
      sellerId: sellerB.id,
      number: 2,
      type: SaleType.SERVICE,
      status: SaleStatus.DRAFT,
      totalAmount: new Prisma.Decimal("700"),
      discount: new Prisma.Decimal("0"),
      notes: "Orçamento em rascunho — exemplo de status DRAFT.",
      saleDate: new Date(),
      items: {
        create: [
          {
            description: "Consultoria (2h)",
            quantity: new Prisma.Decimal("2"),
            unitPrice: new Prisma.Decimal("350"),
            discount: new Prisma.Decimal("0"),
            totalPrice: new Prisma.Decimal("700"),
          },
        ],
      },
    },
  });

  await prisma.financialTransaction.create({
    data: {
      companyId: company.id,
      type: TransactionType.EXPENSE,
      category: "Operacional",
      amount: new Prisma.Decimal("450"),
      description: "Despesa de exemplo — marketing",
      date: new Date(),
    },
  });

  console.log("[seed] Catálogo, vendas e financeiro de exemplo inseridos.");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definido");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("[seed] Lembrete: migrations não criam usuários — apenas este seed insere o demo.");

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const user = await ensureDemoUserAndCredential(prisma, passwordHash);
  await seedDemoCompanyAndSampleData(prisma, user.id);

  console.log("Seed concluído:");
  console.log(`  Usuário: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Ou na tela de login: admin / ${DEMO_PASSWORD}`);
  console.log(`  Empresa: /${COMPANY_SLUG}/overview`);
  console.log("  Supervisão global: /supervise (este usuário é admin da plataforma)");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
