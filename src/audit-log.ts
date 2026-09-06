import type { Event, StorageAdapter, StoredEvent } from 'tiny-cqrs';

export interface AuditLogEntry {
  readonly sequence: string;
  readonly occurredAt: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly description: string;
}

/**
 * A query-time, cross-aggregate audit log — no separate table, derived directly from the event
 * stream via the adapter's `loadTenantLog` (which itself piggybacks on the storage backend's own
 * chronological ordering, e.g. D1's autoincrement `id`). You supply `describe` because only your
 * app knows how to render its own event types as human-readable audit lines.
 */
export async function loadAuditLog<E extends Event>(
  store: StorageAdapter,
  tenantId: string,
  describe: (event: StoredEvent<E>) => string,
  options?: { after?: string; limit?: number },
): Promise<AuditLogEntry[]> {
  if (!store.loadTenantLog) {
    throw new Error('loadAuditLog requires a StorageAdapter that implements loadTenantLog');
  }

  const events = await store.loadTenantLog(tenantId, options);
  return events.map((e) => ({
    sequence: e.sequence ?? '',
    occurredAt: e.occurredAt,
    aggregateType: e.aggregateType,
    aggregateId: e.aggregateId,
    eventType: e.event.type,
    description: describe(e as StoredEvent<E>),
  }));
}
