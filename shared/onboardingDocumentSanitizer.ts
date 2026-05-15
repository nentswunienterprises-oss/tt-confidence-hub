const LEGACY_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\r\n/g, "\n"],
  [/\u0000/g, ""],
  [/[â€œâ€Ã¢â‚¬Å“Ã¢â‚¬Â]/g, '"'],
  [/[â€˜â€™Ã¢â‚¬Ëœ]/g, "'"],
  [/[â€“â€”Ã¢â‚¬â€œÃ¢â‚¬â€]/g, "-"],
  [/â†’|Ã¢â€ â€™/g, " -> "],
  [/\uFFFD/g, ""],
  [/TERRITORIAL TUTORING SA \(PTY\) LTD/gi, "RESPONSE INTEGRITY (PTY) LTD"],
  [/Territorial Tutoring SA \(Pty\) Ltd/gi, "Response Integrity (Pty) Ltd"],
  [/Territorial Tutoring Operating System/gi, "Response Integrity Operating System"],
  [/Territorial Tutoring\b/gi, "Response Integrity"],
  [/\bTT\b/gi, "Response Integrity"],
  [/AResponse Integrityended/g, "Attended"],
  [/aResponse Integrityached/g, "attached"],
  [/AResponse Integrityempting/g, "Attempting"],
  [/aResponse Integrityempting/g, "attempting"],
  [/AResponse Integrityempts/g, "Attempts"],
  [/aResponse Integrityempts/g, "attempts"],
  [/AResponse Integrityempt/g, "Attempt"],
  [/aResponse Integrityempt/g, "attempt"],
  [/submiResponse Integritying/g, "submitting"],
  [/submiResponse Integrityed/g, "submitted"],
  [/permiResponse Integrityed/g, "permitted"],
  [/maResponse Integrityers/g, "matters"],
  [/aResponse Integrityire/g, "attire"],
  [/BaResponse Integrityle/g, "Battle"],
  [/baResponse Integrityle/g, "battle"],
  [/PaResponse Integrityern/g, "Pattern"],
  [/paResponse Integrityern/g, "pattern"],
];

export function sanitizeLegacyOnboardingDocumentText(raw: string) {
  let next = String(raw || "");
  for (const [pattern, replacement] of LEGACY_TEXT_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return next.trim();
}
