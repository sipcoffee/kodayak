import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBulkCodes } from "@/lib/code-generator";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const planId = searchParams.get("planId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.code = { contains: search.toUpperCase(), mode: "insensitive" };
  }

  if (status) {
    where.status = status;
  }

  if (planId) {
    where.planId = planId;
  }

  const [filmCodes, total] = await Promise.all([
    prisma.filmCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        redeemedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.filmCode.count({ where }),
  ]);

  return NextResponse.json({
    filmCodes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { planId, quantity, expiresAt } = body;

  if (!planId) {
    return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
  }

  const qty = Math.min(Math.max(1, quantity || 1), 50);

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const codes = generateBulkCodes(qty);
  const expirationDate = expiresAt ? new Date(expiresAt) : null;

  const filmCodes = await prisma.filmCode.createMany({
    data: codes.map((code) => ({
      code,
      planId,
      createdById: session.user.id,
      expiresAt: expirationDate,
    })),
  });

  return NextResponse.json({
    message: `${filmCodes.count} code${filmCodes.count > 1 ? "s" : ""} generated successfully`,
    count: filmCodes.count,
    codes,
  });
}
