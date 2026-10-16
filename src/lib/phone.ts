// Předvolby pro přihlášení SMS — Firebase má SMS povolené jen pro CZ a SK
export const DIAL_CODES = [
  { code: "+420", country: "CZ" },
  { code: "+421", country: "SK" },
] as const;

export type DialCode = (typeof DIAL_CODES)[number]["code"];

// Rozdělí vložené/automaticky vyplněné číslo na předvolbu a národní část.
// "727 872 060" → národní; "+420727872060", "00420…", "420727872060" → předvolba se pozná.
export function splitPhone(raw: string): { dialCode?: DialCode; national: string } {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  for (const { code } of DIAL_CODES) {
    const digits = code.slice(1);
    if (p.startsWith(code)) return { dialCode: code, national: p.slice(code.length) };
    if (!p.startsWith("+") && p.length === 12 && p.startsWith(digits)) {
      return { dialCode: code, national: p.slice(digits.length) };
    }
  }
  // Neznámá předvolba zůstane celá — nesmí se potichu spojit s +420
  return { national: p };
}

export function toE164(dialCode: DialCode, national: string): string {
  const p = national.replace(/[^\d+]/g, "");
  return p.startsWith("+") ? p : `${dialCode}${p}`;
}
