import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
import { sendEmail } from "@/lib/services/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Valid email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });

    if (user && !user.deletedAt) {
      const token = crypto.randomBytes(24).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendEmail({
        to: user.email,
        subject: "Reset your Nexora password",
        html: `<p>Click to reset your password: <a href="${appUrl}/reset-password?token=${token}">Reset Password</a></p>`,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}
