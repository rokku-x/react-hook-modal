# @rokku-x/react-hook-modal

## 0.10.1

### Patch Changes

- 38978ed: fix: add wildcard for CSS file side effects in package.json

## 0.10.0

### Minor Changes

- c4de3d7: feat: support multiple BaseModalRenderer instances with isolated stores and update hooks to accept options

### Patch Changes

- c4de3d7: docs: update README for improved clarity and add usage examples; enhance package.json keywords
- c4de3d7: feat: implement createPolyfillComponent utility and update Modal components to use it

## 0.9.4

### Patch Changes

- 8df4f01: patch: inert warning fix

## 0.9.3

### Patch Changes

- 7f7a671: patch: new css bundling method
- 7f7a671: patch: update readme

## 0.9.2

### Patch Changes

- ef02c20: patch: css styling importing

## 0.9.1

### Patch Changes

- 4108140: patch: changed modal backdrop and window to class styling, changed modal store management

## 0.9.0

### Minor Changes

- b272c08: feat: add screenshot examples for React Hook Dialog

  - Added multiple modal examples demonstrating various use cases.
  - Integrated Playwright for automated screenshot testing of examples.
  - Updated package.json to include Playwright and related scripts.
  - Enhanced Vite configuration to use Terser for better directive preservation.
  - Improved documentation with visual aids for better user understanding.
  - Refactored example components for clarity and maintainability.
  - 'use client' directive for build fix

### Patch Changes

- 177abdb: fix: update build configuration to use Terser for better directive preservation and add new dependencies

## 0.8.0

### Minor Changes

- 5d0b104: - Added: `useStaticModal` now supports multiple instance modes:
  - Pass a **string id** to `showModal(el, 'my-id')` to open/target a named instance (subsequent calls with the same id update/replace that instance).
  - Pass **true** to `showModal(el, true)` to create a new unique instance each call (one-off modals).
  - Changed: `showModal` now returns the hook's `id` (string) instead of a close function.
  - Changed: `useStaticModal` tuple now returns `[showModal, closeModal, focus, updateModalContent, id]` (`id` moved to the last position).
  - Fixed: `updateModalContent` now returns `boolean` indicating success/failure when updating.
  - Tests and README updated to reflect the above changes.

## 0.7.10

### Patch Changes

- e416474: chore: add changesets for versioning and release management

  - Updated package.json to include @changesets/cli and added scripts for changeset commands.
  - Refactored BaseModalRenderer to use useMemo for modal stack and rendering logic.
  - Removed unnecessary 'use client' banner from vite.config.ts.
  - Added GitHub Actions workflows for changeset versioning and release creation.
