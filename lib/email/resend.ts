import { Resend } from "resend";

let resendClient: Resend | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

export function getResendFrom() {
  return getRequiredEnv("RESEND_FROM");
}

export function getResendReplyTo() {
  return process.env.RESEND_REPLY_TO;
}
