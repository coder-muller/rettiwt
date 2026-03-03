import { NextResponse } from "next/server";
import { z } from "zod";

import { checkPasswordCompromised } from "@/lib/security/password-leak-check";

const passwordSchema = z.object({
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Payload invalido.",
      },
      {
        status: 400,
      },
    );
  }

  const result = await checkPasswordCompromised(parsed.data.password);

  return NextResponse.json(result);
}
