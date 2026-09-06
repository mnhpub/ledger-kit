# ledger-kit

Accounting/finance helpers for [`tiny-cqrs`](https://github.com/mnhpub/tiny-cqrs): double-entry
invariants, decimal-safe amounts, and an audit-log projection helper. This is the first "flavor"
package built on `tiny-cqrs` — it's an ordinary consumer of the core library, not a plugin; a
`construction-kit` or `media-kit` would follow the exact same pattern with no changes to
`tiny-cqrs` itself.

**Status:** pre-1.0 (currently v0.1.0), tracking `tiny-cqrs`'s own pre-1.0 status.

## Install

```
npm install tiny-cqrs ledger-kit
```

## What's in here

- **`Cents` / `parseCents` / `formatCents` / `sumCents`** — amounts are always integer cents
  (`bigint`), never floats. `parseCents("0.1") + parseCents("0.2") === parseCents("0.3")`, which is
  not true of `0.1 + 0.2` in floating point — exactly the kind of bug you don't want in a ledger.
- **`assertBalanced(lines)`** — the core double-entry invariant. Call it from your `decide()`
  before returning a posting event; it throws a `DomainError('UNBALANCED_ENTRY', ...)` (from
  `tiny-cqrs`) if debits don't equal credits, so an unbalanced entry becomes a rejected command,
  never corrupt books.
- **`loadAuditLog(store, tenantId, describe)`** — a chronological, cross-aggregate audit trail
  derived directly from the event stream (via `StorageAdapter.loadTenantLog`), no separate table.
  You supply `describe` because only your app knows how to render its own event types as
  human-readable lines.

## Example

See `test/journal-entry.integration.test.ts` for a minimal JournalEntry aggregate composing
`tiny-cqrs`'s `executeCommand` with `assertBalanced` — the shape a real migration (e.g.
ledgerwriter.com's `journal-entry-commands.ts`) follows.

## Contributing

Bug reports, additional accounting helpers, and documentation fixes are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md) for how to get set up and what's in vs. out of scope for this
repo specifically.

## License

Apache-2.0
