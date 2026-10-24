# susidy-client — project rules

## Never change: background scroll lock under every modal

While ANY modal, drawer, or side menu is open, the page behind it must not
scroll. This is an explicit, permanent requirement from the store owner.

- Every overlay component (modal / drawer / side menu) must call
  `useBodyScrollLock(isOpen)` from `src/hooks/useBodyScrollLock.js`.
- The hook must lock **both** `<html>` and `<body>` (`overflow: hidden`).
  Locking only `<body>` breaks as soon as `<html>` has any non-visible
  overflow (it currently has `overflow-x: hidden` in `src/index.css`),
  because `<html>` then becomes the scroll container.
- Do not remove, weaken, or route around this hook, and re-verify the lock
  in the browser after any change to `html`/`body` CSS in `src/index.css`.
