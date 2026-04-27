export function stripWhatThisDoesSection(text: string) {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*WHAT THIS DOES\b[\s\S]*$/gi, "")
    .replace(/\n\s*What this does\b[\s\S]*$/gi, "")
    .trim();
}
