import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validations/schemas";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid reset request" },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You may now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password." },
      { status: 500 }
    );
  }
}
