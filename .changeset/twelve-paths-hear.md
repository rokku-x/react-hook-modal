---
"@rokku-x/react-hook-modal": patch
---

chore: add changesets for versioning and release management

- Updated package.json to include @changesets/cli and added scripts for changeset commands.
- Refactored BaseModalRenderer to use useMemo for modal stack and rendering logic.
- Removed unnecessary 'use client' banner from vite.config.ts.
- Added GitHub Actions workflows for changeset versioning and release creation.
