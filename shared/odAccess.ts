export const ALLOWED_OD_EMAILS = [
  "kring@gmail.com",
  "admin@territorialtutoring.co.za",
] as const;

export function normalizeEmail(email: string | null | undefined): string {
  return String(email || "").trim().toLowerCase();
}

export function isAllowedOdEmail(email: string | null | undefined): boolean {
  return ALLOWED_OD_EMAILS.includes(normalizeEmail(email) as (typeof ALLOWED_OD_EMAILS)[number]);
}

export function getAllowedOdEmailList(): string {
  return ALLOWED_OD_EMAILS.join(", ");
}
