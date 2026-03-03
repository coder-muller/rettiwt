import { createHash } from "node:crypto";

import type { PasswordCompromiseCheckResult } from "@/lib/types/security";

function sha1Uppercase(value: string) {
  return createHash("sha1").update(value, "utf8").digest("hex").toUpperCase();
}

export async function checkPasswordCompromised(password: string): Promise<PasswordCompromiseCheckResult> {
  if (!password) {
    return {
      compromised: false,
    };
  }

  const hash = sha1Uppercase(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 5000);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: "GET",
      headers: {
        "Add-Padding": "true",
        "User-Agent": "Rettiwt Password Checker",
      },
      signal: abortController.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        compromised: false,
        checkFailed: true,
      };
    }

    const body = await response.text();
    const lines = body.split(/\r?\n/);

    for (const line of lines) {
      const [hashSuffix, countText] = line.split(":");

      if (!hashSuffix || !countText) {
        continue;
      }

      if (hashSuffix.trim().toUpperCase() !== suffix) {
        continue;
      }

      const count = Number.parseInt(countText.trim(), 10);

      return {
        compromised: true,
        count: Number.isFinite(count) ? count : undefined,
      };
    }

    return {
      compromised: false,
    };
  } catch {
    return {
      compromised: false,
      checkFailed: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}
