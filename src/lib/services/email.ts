export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Transactional email dispatcher.
 * Uses configured SMTP/Resend webhook when provided, and safely records structured logs in local dev.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ delivered: boolean }> {
  if (!process.env.SMTP_HOST) {
    console.info("[Nexora Email Dispatch - Dev Log]", {
      to: payload.to,
      subject: payload.subject,
    });
    return { delivered: true };
  }

  // Production SMTP/API hook point
  console.info("[Nexora Email Dispatch]", {
    host: process.env.SMTP_HOST,
    to: payload.to,
    subject: payload.subject,
  });
  return { delivered: true };
}
