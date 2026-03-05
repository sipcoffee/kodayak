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
      photoLimit: 100,
      eventDuration: 1,
      features: [
        "100 photos per event",
        "1 day event duration",
        "7 days gallery access",
        "Standard download quality",
        "1 QR code",
        "Email support",
      ],
    },
    {
      name: "Standard",
      type: PlanType.STANDARD,
      price: 999,
      photoLimit: 500,
      eventDuration: 3,
      features: [
        "500 photos per event",
        "3 days event duration",
        "30 days gallery access",
        "High quality downloads",
        "3 QR codes",
        "Priority support",
        "Minimal branding",
      ],
    },
    {
      name: "Premium",
      type: PlanType.PREMIUM,
      price: 1999,
      photoLimit: -1, // Unlimited
      eventDuration: 7,
      features: [
        "Unlimited photos",
        "7 days event duration",
        "Forever gallery access",
        "Original quality downloads",
        "Unlimited QR codes",
        "Dedicated support",
        "Custom branding",
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
