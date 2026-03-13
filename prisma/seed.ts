import { PrismaClient, PlanType } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create plans
  const plans = [
    {
      name: "Basic",
      type: PlanType.BASIC,
      price: 499,
      guestPhotoLimit: 10,
      eventDuration: 1,
      features: [
        "Unlimited shots for local",
        "10 upload photos per guest",
        "1 day event duration",
        "7 days gallery access",
        "Save to local device",
        "Email support",
      ],
    },
    {
      name: "Standard",
      type: PlanType.STANDARD,
      price: 999,
      guestPhotoLimit: 15,
      eventDuration: 3,
      features: [
        "Unlimited shots for local",
        "15 upload photos per guest",
        "3 days event duration",
        "30 days gallery access",
        "Save to local device",
        "Priority support",
      ],
    },
    {
      name: "Premium",
      type: PlanType.PREMIUM,
      price: 1999,
      guestPhotoLimit: 25,
      eventDuration: 7,
      features: [
        "Unlimited shots for local",
        "25 upload photos per guest",
        "7 days event duration",
        "Forever gallery access",
        "Save to local device",
        "Dedicated support",
        "Analytics dashboard",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type },
      update: plan,
      create: plan,
    });
    console.log(`Created/updated plan: ${plan.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
