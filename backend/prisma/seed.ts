import argon2 from "argon2";
import {
  ContactType,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

const adminUsers = [
  {
    email: "hayrullah@esca-food.com",
    fullName: "Hayrullah Yıldız",
    password: "397139",
  },
  {
    email: "onur@esca-food.com",
    fullName: "Onur Güneş",
    password: "248624",
  },
];

const bankAccounts = [
  {
    name: "Yapı Kredi",
    iban: "TR000000000000000000000000",
    initialBalance: 0,
  },
  {
    name: "Halkbank",
    iban: "TR111111111111111111111111",
    initialBalance: 0,
  },
];

const cards = [
  {
    name: "YKB Ticari Kart",
    limit: 250000,
  },
  {
    name: "Halkbank POS",
    limit: 150000,
  },
];

const contacts = [
  {
    name: "Esca Gıda Müşteri",
    type: ContactType.CUSTOMER,
  },
  {
    name: "Esca Tedarikçi",
    type: ContactType.SUPPLIER,
  },
];

async function seedUsers() {
  for (const user of adminUsers) {
    const passwordHash = await argon2.hash(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, passwordHash, isActive: true },
      create: {
        email: user.email,
        fullName: user.fullName,
        passwordHash,
      },
    });
  }
}

async function seedBanks() {
  for (const bank of bankAccounts) {
    await prisma.bankAccount.upsert({
      where: { name: bank.name },
      update: {
        iban: bank.iban,
        initialBalance: bank.initialBalance,
      },
      create: bank,
    });
  }
}

async function seedCards() {
  const [primaryBank] = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const card of cards) {
    await prisma.card.upsert({
      where: { name: card.name },
      update: {
        limit: card.limit,
        bankAccountId: primaryBank?.id,
      },
      create: {
        name: card.name,
        limit: card.limit,
        bankAccountId: primaryBank?.id,
      },
    });
  }
}

async function seedContacts() {
  for (const contact of contacts) {
    await prisma.contact.upsert({
      where: { name: contact.name },
      update: {},
      create: contact,
    });
  }
}

async function main() {
  await seedUsers();
  await seedBanks();
  await seedCards();
  await seedContacts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
