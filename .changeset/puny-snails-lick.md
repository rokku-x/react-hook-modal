---
"@rokku-x/react-hook-modal": minor
---

- Added: `useStaticModal` now supports multiple instance modes:
  - Pass a **string id** to `showModal(el, 'my-id')` to open/target a named instance (subsequent calls with the same id update/replace that instance).
  - Pass **true** to `showModal(el, true)` to create a new unique instance each call (one-off modals).
- Changed: `showModal` now returns the hook's `id` (string) instead of a close function.
- Changed: `useStaticModal` tuple now returns `[showModal, closeModal, focus, updateModalContent, id]` (`id` moved to the last position).
- Fixed: `updateModalContent` now returns `boolean` indicating success/failure when updating.
- Tests and README updated to reflect the above changes.
