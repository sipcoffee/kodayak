import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidCodeFormat } from "@/lib/code-generator";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase().trim();

  if (!isValidCodeFormat(normalizedCode)) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: 400 }
    );
  }

  const filmCode = await prisma.filmCode.findUnique({
    where: { code: normalizedCode },
    include: {
      plan: true,
    },
  });

  if (!filmCode) {
    return NextResponse.json(
      { error: "Invalid or unknown code" },
      { status: 404 }
    );
  }

  if (filmCode.status === "REDEEMED") {
    return NextResponse.json(
      { error: "This code has already been redeemed" },
      { status: 400 }
    );
  }

  if (filmCode.status === "REVOKED") {
    return NextResponse.json(
      { error: "This code has been revoked" },
      { status: 400 }
    );
  }

  if (filmCode.status === "EXPIRED") {
    return NextResponse.json(
      { error: "This code has expired" },
      { status: 400 }
    );
  }

  if (filmCode.expiresAt && new Date(filmCode.expiresAt) < new Date()) {
    await prisma.filmCode.update({
      where: { id: filmCode.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json(
      { error: "This code has expired" },
      { status: 400 }
    );
  }

  // Create UserFilm and update FilmCode in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const userFilm = await tx.userFilm.create({
      data: {
        userId: session.user.id,
        planId: filmCode.planId,
        status: "AVAILABLE",
        purchasedAt: new Date(),
      },
      include: {
        plan: true,
      },
    });

    await tx.filmCode.update({
      where: { id: filmCode.id },
      data: {
        status: "REDEEMED",
        redeemedById: session.user.id,
        userFilmId: userFilm.id,
        redeemedAt: new Date(),
      },
    });

    return userFilm;
  });

  return NextResponse.json({
    message: `Successfully redeemed ${result.plan.name} film!`,
    film: result,
  });
}
