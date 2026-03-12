import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const films = await prisma.userFilm.findMany({
    where: {
      userId: session.user.id,
      status: "AVAILABLE",
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      plan: true,
    },
    orderBy: { purchasedAt: "asc" },
  });

  return NextResponse.json(films);
}
