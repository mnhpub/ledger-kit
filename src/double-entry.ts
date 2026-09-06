import { DomainError } from 'tiny-cqrs';
import type { Cents } from './amount.js';

/** One line of a journal entry. Exactly one of `debit`/`credit` should be non-zero. */
export interface LedgerLine {
  readonly accountId: string;
  readonly debit: Cents;
  readonly credit: Cents;
}

/**
 * The core double-entry invariant: total debits must equal total credits. Call this from your
 * `decide()` before returning a posting event — throwing here is exactly what turns an unbalanced
 * entry into a rejected command instead of corrupt books.
 */
export function assertBalanced(lines: readonly LedgerLine[]): void {
  if (lines.length === 0) {
    throw new DomainError('EMPTY_ENTRY', 'a journal entry must have at least one line');
  }

  let debits = 0n;
  let credits = 0n;
  for (const line of lines) {
    if (line.debit < 0n || line.credit < 0n) {
      throw new DomainError('NEGATIVE_LINE_AMOUNT', `line for ${line.accountId} has a negative amount`);
    }
    if (line.debit > 0n && line.credit > 0n) {
      throw new DomainError('AMBIGUOUS_LINE', `line for ${line.accountId} has both a debit and a credit`);
    }
    debits += line.debit;
    credits += line.credit;
  }

  if (debits !== credits) {
    throw new DomainError(
      'UNBALANCED_ENTRY',
      `debits (${debits}) must equal credits (${credits})`,
    );
  }
}
