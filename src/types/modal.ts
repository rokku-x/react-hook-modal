import type { ReactNode } from 'react'

/**
 * Controls how the modal windows are rendered by `BaseModalRenderer`.
 *
 * - `STACKED`: All modals are visible and stacked.
 * - `CURRENT_ONLY`: Only the topmost modal window is visible.
 * - `CURRENT_HIDDEN_STACK`: All modals stay mounted, but only the topmost is visible (preserves state).
 */
export const RenderMode = {
    STACKED: 0,
    CURRENT_ONLY: 1,
    CURRENT_HIDDEN_STACK: 2,
} as const

export type RenderMode = (typeof RenderMode)[keyof typeof RenderMode];

/**
 * Any content that can be shown inside a modal window.
 */
export type AcceptableElement = ReactNode | (() => ReactNode);

/**
 * A single modal stack entry: `[content, isDynamic]`.
 */
export type ModalEntry = [AcceptableElement | null, boolean];
export type ModalStackMapType = Map<string, ModalEntry>;
