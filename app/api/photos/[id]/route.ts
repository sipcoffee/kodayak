import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, getKeyFromUrl } from "@/lib/r2";

// DELETE - Delete a photo (requires auth and ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the photo and verify ownership through the event
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Check if user owns the event (or is admin)
    const isOwner = photo.event.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from R2
    const key = getKeyFromUrl(photo.url);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch (error) {
        console.error("Failed to delete photo from R2:", error);
        // Continue with DB deletion even if R2 fails
      }
    }

    // Delete from database
    await prisma.photo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
