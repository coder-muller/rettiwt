import { getResendClient, getResendFrom, getResendReplyTo } from "@/lib/email/resend";

type AuthOtpType = "email-verification" | "forget-password" | "sign-in" | "change-email";

const subjectByType: Record<AuthOtpType, string> = {
  "email-verification": "Seu codigo de verificacao no Rettiwt",
  "forget-password": "Seu codigo para redefinir senha no Rettiwt",
  "sign-in": "Seu codigo de acesso no Rettiwt",
  "change-email": "Seu codigo para alterar e-mail no Rettiwt",
};

const headlineByType: Record<AuthOtpType, string> = {
  "email-verification": "Verificacao de e-mail",
  "forget-password": "Redefinicao de senha",
  "sign-in": "Acesso com codigo",
  "change-email": "Alteracao de e-mail",
};

export async function sendAuthOtpEmail(input: {
  email: string;
  otp: string;
  type: AuthOtpType;
  expiresInMinutes?: number;
}) {
  const expiresInMinutes = input.expiresInMinutes ?? 5;
  const resend = getResendClient();

  const subject = subjectByType[input.type];
  const title = headlineByType[input.type];

  const text = [
    `Rettiwt - ${title}`,
    "",
    `Seu codigo: ${input.otp}`,
    `Valido por ${expiresInMinutes} minutos.`,
    "",
    "Se voce nao solicitou este codigo, ignore este e-mail.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">${title}</h1>
      <p style="margin: 0 0 8px;">Use este codigo para continuar no Rettiwt:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 0 0 12px;">${input.otp}</p>
      <p style="margin: 0 0 8px;">Valido por ${expiresInMinutes} minutos.</p>
      <p style="margin: 0; color: #555;">Se voce nao solicitou este codigo, ignore este e-mail.</p>
    </div>
  `;

  const response = await resend.emails.send({
    from: getResendFrom(),
    to: [input.email],
    subject,
    text,
    html,
    replyTo: getResendReplyTo() ? [getResendReplyTo() as string] : undefined,
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to send auth OTP email.");
  }
}
