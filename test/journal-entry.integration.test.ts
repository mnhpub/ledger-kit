import { executeCommand } from 'tiny-cqrs';
import { createMemoryAdapter } from 'tiny-cqrs/adapters/memory';
import { describe, expect, it } from 'vitest';
import { parseCents } from '../src/amount.js';
import { assertBalanced, type LedgerLine } from '../src/double-entry.js';

// A minimal JournalEntry aggregate, showing how an app composes tiny-cqrs + ledger-kit —
// this is exactly the shape ledger-writer's real journal-entry-commands.ts would migrate to.

type JournalEntryPosted = { type: 'JournalEntryPosted'; lines: readonly LedgerLine[] };
type JournalEntryState = { posted: boolean; lines: readonly LedgerLine[] };
type PostCommand = { lines: readonly LedgerLine[] };

const fold = (events: readonly JournalEntryPosted[]): JournalEntryState =>
  events.reduce<JournalEntryState>(
    (state, e) => (e.type === 'JournalEntryPosted' ? { posted: true, lines: e.lines } : state),
    { posted: false, lines: [] },
  );

const decide = (state: JournalEntryState, command: PostCommand): JournalEntryPosted[] => {
  assertBalanced(command.lines); // the double-entry invariant, enforced before any event is produced
  return [{ type: 'JournalEntryPosted', lines: command.lines }];
};

describe('journal entry (tiny-cqrs + ledger-kit composed)', () => {
  it('posts a balanced entry', async () => {
    const store = createMemoryAdapter();
    const result = await executeCommand({
      store, fold, decide,
      tenantId: 'acme', aggregateType: 'JournalEntry', aggregateId: 'je-1',
      command: {
        lines: [
          { accountId: 'cash', debit: parseCents('500.00'), credit: 0n },
          { accountId: 'revenue', debit: 0n, credit: parseCents('500.00') },
        ],
      },
    });

    expect(result).toEqual({
      ok: true,
      data: { events: [{ type: 'JournalEntryPosted', lines: expect.any(Array) }], state: { posted: true, lines: expect.any(Array) } },
    });
  });

  it('rejects an unbalanced entry as a domain Outcome, not an exception', async () => {
    const store = createMemoryAdapter();
    const result = await executeCommand({
      store, fold, decide,
      tenantId: 'acme', aggregateType: 'JournalEntry', aggregateId: 'je-2',
      command: {
        lines: [
          { accountId: 'cash', debit: parseCents('500.00'), credit: 0n },
          { accountId: 'revenue', debit: 0n, credit: parseCents('400.00') },
        ],
      },
    });

    expect(result).toEqual({ ok: false, code: 'UNBALANCED_ENTRY', message: expect.stringContaining('50000') });
  });
});
