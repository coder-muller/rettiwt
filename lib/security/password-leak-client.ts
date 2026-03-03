import type { PasswordCompromiseCheckResult } from "@/lib/types/security";

export async function checkPasswordCompromisedWithApi(password: string): Promise<PasswordCompromiseCheckResult> {
  if (!password) {
    return { compromised: false };
  }

  try {
    const response = await fetch("/api/security/password-compromised", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });

    if (!response.ok) {
      return {
        compromised: false,
        checkFailed: true,
      };
    }

    const json = (await response.json()) as PasswordCompromiseCheckResult;

    return {
      compromised: Boolean(json.compromised),
      count: json.count,
      checkFailed: Boolean(json.checkFailed),
    };
  } catch {
    return {
      compromised: false,
      checkFailed: true,
    };
  }
}
