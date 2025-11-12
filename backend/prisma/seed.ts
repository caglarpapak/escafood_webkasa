import argon2 from "argon2";
import { ContactType, PrismaClient } from "@prisma/client";

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
    name: "Yapı Kredi Hesap",
    iban: "TR000000000000000000000000",
    initialBalance: 0,
  },
  {
    name: "Enpara Hesap",
    iban: "TR222222222222222222222222",
    initialBalance: 0,
  },
  {
    name: "Halkbank Hesap",
    iban: "TR111111111111111111111111",
    initialBalance: 0,
  },
];

const cards = [
  {
    name: "YKB Ticari Kart",
    limitTry: 250000,
    type: "credit",
    scheme: "Visa",
  },
  {
    name: "Enpara Ticari Kart",
    limitTry: 175000,
    type: "credit",
    scheme: "Mastercard",
  },
  {
    name: "Halkbank Ticari Kart",
    limitTry: 150000,
    type: "credit",
    scheme: "Troy",
  },
  {
    name: "YKB POS",
    limitTry: 0,
    type: "pos",
    linkedBank: "Yapı Kredi Hesap",
  },
  {
    name: "Enpara POS",
    limitTry: 0,
    type: "pos",
    linkedBank: "Enpara Hesap",
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
  {
    name: "Muhtelif",
    type: ContactType.OTHER,
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
  const existingBanks = await prisma.bankAccount.findMany({
    select: { id: true, name: true },
  });
  const bankMap = new Map(existingBanks.map((bank) => [bank.name, bank.id]));

  for (const card of cards) {
    await prisma.card.upsert({
      where: { name: card.name },
      update: {
        limitTry: card.limitTry,
        type: card.type,
        scheme: card.scheme,
        bankAccountId: card.linkedBank ? bankMap.get(card.linkedBank) ?? null : null,
      },
      create: {
        name: card.name,
        limitTry: card.limitTry,
        type: card.type,
        scheme: card.scheme,
        bankAccountId: card.linkedBank ? bankMap.get(card.linkedBank) ?? null : null,
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

async function seedTags() {
  const tags = ["POS", "POS Komisyonu"];
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
  }
}

async function main() {
  await seedUsers();
  await seedBanks();
  await seedCards();
  await seedContacts();
  await seedTags();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
