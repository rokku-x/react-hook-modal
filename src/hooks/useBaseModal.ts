'use client'

import storeBaseModal from '../store/modal'
import { RenderMode } from '../types/modal'
import type { Store } from '../store/modal'
import type { ModalStackMapType } from '../types/modal'
export { RenderMode } from '../types/modal'
export type { AcceptableElement, ModalEntry } from '../types/modal'

/**
 * Primary hook for interacting with the modal store.
 *
 * Provides actions to push/pop/update/focus modals along with state access for
 * `currentModalId` and `renderMode`.
 *
 * @returns An object with modal actions and state.
 * @example
 * const { pushModal, popModal } = useBaseModal()
 * pushModal('my-id', <div>Content</div>)
 * popModal('my-id')
 */
export default function useBaseModal(): Store['actions'] & { currentModalId?: string; renderMode: RenderMode } {
    const { actions, currentModalId, renderMode } = storeBaseModal((state) => state)
    return { ...actions, currentModalId, renderMode };
}

/**
 * Internal hook for advanced operations and direct store access.
 *
 * Exposes internal actions and raw store data, useful for testing, debugging,
 * and renderer integration.
 */
export function useBaseModalInternal(): Store['internalActions'] & {
    isMounted: boolean;
    modalStackMap: ModalStackMapType;
    modalWindowRefs?: Map<string, HTMLDivElement>;
    currentModalId?: string;
    renderMode: RenderMode;
    store: typeof storeBaseModal;
} {
    const { internalActions, isMounted, modalStackMap, modalWindowRefs, currentModalId, renderMode } = storeBaseModal((state) => state)
    return { ...internalActions, isMounted, modalStackMap, modalWindowRefs, currentModalId, renderMode, store: storeBaseModal };
}