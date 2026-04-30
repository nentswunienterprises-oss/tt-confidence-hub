import crypto from "crypto";

export const PAYFAST_LIVE_PROCESS_URL = "https://www.payfast.co.za/eng/process";
export const PAYFAST_SANDBOX_PROCESS_URL = "https://sandbox.payfast.co.za/eng/process";

export type InternalPaymentStatus = "pending" | "paid" | "failed" | "cancelled";

function encodePayfastValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function buildPayfastSignature(
  values: Record<string, string | number | null | undefined>,
  passphrase?: string | null,
) {
  const pairs = Object.entries(values)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && String(value) !== "")
    .map(([key, value]) => `${key}=${encodePayfastValue(String(value).trim())}`);

  if (passphrase) {
    pairs.push(`passphrase=${encodePayfastValue(String(passphrase).trim())}`);
  }

  return crypto.createHash("md5").update(pairs.join("&")).digest("hex");
}

export function withPayfastSignature(
  values: Record<string, string | number | null | undefined>,
  passphrase?: string | null,
) {
  return {
    ...values,
    signature: buildPayfastSignature(values, passphrase),
  };
}

export function verifyPayfastSignature(
  values: Record<string, string | number | null | undefined>,
  passphrase?: string | null,
) {
  const provided = String(values.signature || "").trim().toLowerCase();
  const expected = buildPayfastSignature(values, passphrase).toLowerCase();
  return provided !== "" && provided === expected;
}

export function getPayfastProcessUrl(useSandbox: boolean) {
  return useSandbox ? PAYFAST_SANDBOX_PROCESS_URL : PAYFAST_LIVE_PROCESS_URL;
}

export function normalizePayfastPaymentStatus(rawStatus: unknown): InternalPaymentStatus {
  const value = String(rawStatus || "").trim().toUpperCase();

  if (value === "COMPLETE") return "paid";
  if (value === "CANCELLED") return "cancelled";
  if (value === "FAILED") return "failed";

  return "pending";
}
