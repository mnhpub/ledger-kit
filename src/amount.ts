/**
 * Amounts are always integer cents (bigint) — never floats. Floating point cannot represent
 * currency exactly (0.1 + 0.2 !== 0.3), and that's fatal in a ledger. Every helper in ledger-kit
 * that touches money takes and returns `Cents`.
 */
export type Cents = bigint;

/** Parses a decimal string like "12.34" or "-0.05" into exact cents. Throws on non-decimal input. */
export function parseCents(decimal: string): Cents {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(decimal.trim());
  if (!match) throw new Error(`not a valid decimal amount: "${decimal}"`);
  const sign = match[1] ?? '';
  const whole = match[2] ?? '0';
  const fraction = (match[3] ?? '').padEnd(2, '0');
  const magnitude = BigInt(whole) * 100n + BigInt(fraction);
  return sign === '-' ? -magnitude : magnitude;
}

/** Formats cents back into a decimal string, e.g. 1234n -> "12.34". */
export function formatCents(amount: Cents): string {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const whole = abs / 100n;
  const fraction = (abs % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

export function sumCents(amounts: readonly Cents[]): Cents {
  return amounts.reduce((total, a) => total + a, 0n);
}
