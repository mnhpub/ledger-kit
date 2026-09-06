import { describe, expect, it } from 'vitest';
import { formatCents, parseCents, sumCents } from '../src/amount.js';

describe('amount', () => {
  it('parses and formats decimals exactly, no float drift', () => {
    expect(parseCents('12.34')).toBe(1234n);
    expect(parseCents('0.1') + parseCents('0.2')).toBe(parseCents('0.3')); // the classic float bug, doesn't happen here
    expect(formatCents(1234n)).toBe('12.34');
    expect(formatCents(5n)).toBe('0.05');
  });

  it('handles negative amounts and whole numbers', () => {
    expect(parseCents('-3.5')).toBe(-350n);
    expect(formatCents(-350n)).toBe('-3.50');
    expect(parseCents('7')).toBe(700n);
  });

  it('rejects malformed input', () => {
    expect(() => parseCents('abc')).toThrow();
    expect(() => parseCents('1.234')).toThrow();
  });

  it('sums a list of amounts', () => {
    expect(sumCents([100n, 250n, -50n])).toBe(300n);
  });
});
