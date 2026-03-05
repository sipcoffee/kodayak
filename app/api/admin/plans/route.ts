import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
    include: {
      _count: {
        select: { payments: { where: { status: "PAID" } } },
      },
    },
  });

  // Calculate revenue per plan
  const plansWithRevenue = await Promise.all(
    plans.map(async (plan) => {
      const revenue = await prisma.payment.aggregate({
        where: { planId: plan.id, status: "PAID" },
        _sum: { amount: true },
      });
      return {
        ...plan,
        revenue: revenue._sum.amount || 0,
      };
    })
  );

  return NextResponse.json(plansWithRevenue);
}
