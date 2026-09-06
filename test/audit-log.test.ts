import { createMemoryAdapter } from 'tiny-cqrs/adapters/memory';
import { describe, expect, it } from 'vitest';
import { loadAuditLog } from '../src/audit-log.js';

type Posted = { type: 'Posted'; memo: string };

describe('loadAuditLog', () => {
  it('renders a chronological, cross-aggregate log via a caller-supplied describe function', async () => {
    const store = createMemoryAdapter();
    await store.appendEvents('t1', 'JournalEntry', 'e1', 0, [{ type: 'Posted', memo: 'rent' } satisfies Posted]);
    await store.appendEvents('t1', 'JournalEntry', 'e2', 0, [{ type: 'Posted', memo: 'payroll' } satisfies Posted]);

    const log = await loadAuditLog<Posted>(store, 't1', (e) => `posted: ${e.event.memo}`);

    expect(log.map((entry) => entry.description)).toEqual(['posted: rent', 'posted: payroll']);
    expect(log.every((entry) => entry.eventType === 'Posted')).toBe(true);
  });

  it('throws a clear error if the adapter does not implement loadTenantLog', async () => {
    const noLogStore = { loadEvents: async () => [], appendEvents: async () => {} };
    await expect(loadAuditLog(noLogStore, 't1', () => '')).rejects.toThrow('loadTenantLog');
  });
});
