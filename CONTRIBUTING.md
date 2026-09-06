# Contributing to ledger-kit

Thanks for considering a contribution. `ledger-kit` is the accounting/finance "flavor" package for
[`tiny-cqrs`](https://github.com/mnhpub/tiny-cqrs) — an ordinary consumer of that library, not a
fork or extension of it. Generic CQRS/event-sourcing behavior belongs in `tiny-cqrs`, not here;
this repo stays scoped to accounting-domain helpers (amounts, double-entry, ledger projections).

## Development

```
bun install
bun test
bunx tsc --noEmit
```

## Before opening a PR

- This is financial-correctness code. `parseCents`/`formatCents`/`assertBalanced` have exact,
  tested behavior (no floating point, ever) — any change to them needs tests demonstrating the
  before/after behavior explicitly, not just "the suite still passes."
- `test/journal-entry.integration.test.ts` is the reference example for how `ledger-kit` composes
  with `tiny-cqrs`'s `executeCommand`. A new helper meant to be used from `decide()` should have an
  equivalent integration test, not just unit tests in isolation.
- Keep `tsc --noEmit` clean.

## Scope

Accounting/finance domain helpers only. If what you're proposing isn't specific to that domain — a
generic storage adapter, a new core primitive, anything that doesn't need to know what a ledger
is — it belongs in `tiny-cqrs` instead.

## Reporting a security issue

Please use [GitHub's private vulnerability reporting](https://github.com/mnhpub/ledger-kit/security/advisories/new)
rather than a public issue.

## License

By contributing, you agree your contributions are licensed under this project's Apache-2.0 license.
