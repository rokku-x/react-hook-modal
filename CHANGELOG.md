# @rokku-x/react-hook-modal

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
