import { DomainError } from 'tiny-cqrs';
import { describe, expect, it } from 'vitest';
import { parseCents } from '../src/amount.js';
import { assertBalanced } from '../src/double-entry.js';

describe('assertBalanced', () => {
  it('accepts a balanced entry', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'cash', debit: parseCents('100.00'), credit: 0n },
        { accountId: 'revenue', debit: 0n, credit: parseCents('100.00') },
      ]),
    ).not.toThrow();
  });

  it('rejects an unbalanced entry with the debits/credits in the message', () => {
    expect(() =>
      assertBalanced([
        { accountId: 'cash', debit: parseCents('100.00'), credit: 0n },
        { accountId: 'revenue', debit: 0n, credit: parseCents('90.00') },
      ]),
    ).toThrow(/debits \(10000\) must equal credits \(9000\)/);
  });

  it('rejects an empty entry', () => {
    expect(() => assertBalanced([])).toThrow(DomainError);
  });

  it('rejects a line with both a debit and a credit', () => {
    expect(() =>
      assertBalanced([{ accountId: 'cash', debit: 10n, credit: 10n }]),
    ).toThrow(/both a debit and a credit/);
  });

  it('rejects a negative line amount', () => {
    expect(() =>
      assertBalanced([{ accountId: 'cash', debit: -10n, credit: 0n }]),
    ).toThrow(/negative amount/);
  });

  it('throws a DomainError with a stable code, for HTTP-status mapping in the calling app', () => {
    let error: unknown;
    try {
      assertBalanced([{ accountId: 'cash', debit: 10n, credit: 0n }]);
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe('UNBALANCED_ENTRY');
  });
});
