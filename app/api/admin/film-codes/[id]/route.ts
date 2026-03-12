import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const filmCode = await prisma.filmCode.findUnique({ where: { id } });
  if (!filmCode) {
    return NextResponse.json({ error: "Film code not found" }, { status: 404 });
  }

  if (filmCode.status === "REDEEMED") {
    return NextResponse.json(
      { error: "Cannot revoke a redeemed code" },
      { status: 400 }
    );
  }

  if (filmCode.status === "REVOKED") {
    return NextResponse.json(
      { error: "Code is already revoked" },
      { status: 400 }
    );
  }

  const updatedCode = await prisma.filmCode.update({
    where: { id },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });

  return NextResponse.json({
    message: "Code revoked successfully",
    filmCode: updatedCode,
  });
}
