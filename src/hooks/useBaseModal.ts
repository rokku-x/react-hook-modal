'use client'

import storeInstanceBaseModal from '../store/modal'
import { RenderMode } from '../types/modal'
import type { BaseModalStoreInstance, Store } from '../store/modal'
import type { ModalStackMapType } from '../types/modal'
export { RenderMode } from '../types/modal'
export type { AcceptableElement, ModalEntry } from '../types/modal'

export type useBaseModalOptions = {
    rendererId?: string
}
/**
 * Primary hook for interacting with the modal store.
 *
 * Provides actions to push/pop/update/focus modals along with state access for
 * `currentModalId` and `renderMode`.
 *
 * @param rendererId Optional ID of the `BaseModalRenderer` to use; defaults to the default renderer.
 *                 The `rendererId` should match the `id` prop of a mounted `BaseModalRenderer` to target that renderer's store.
 * @returns An object with modal actions and state.
 * @example
 * const { pushModal, popModal } = useBaseModal()
 * pushModal('my-id', <div>Content</div>)
 * popModal('my-id')
 */
export default function useBaseModal({ rendererId = "default" }: useBaseModalOptions = {}): Store['actions'] & { currentModalId?: string; renderMode: RenderMode } {
    const storeBaseModal = storeInstanceBaseModal(rendererId);
    const { actions, currentModalId, renderMode } = storeBaseModal((state) => state)
    return { ...actions, currentModalId, renderMode };
}

/**
 * Internal hook for advanced operations and direct store access.
 *
 * @param rendererId Optional ID of the `BaseModalRenderer` to use; defaults to the default renderer.
 * @returns An object with internal actions and full store data.
 *
 * @remarks
 * Exposes internal actions and raw store data, useful for testing, debugging,
 * and renderer integration.
 */
export function useBaseModalInternal({ rendererId = "default" }: useBaseModalOptions = {}): Store['internalActions'] & {
    isMounted: boolean;
    modalStackMap: ModalStackMapType;
    modalWindowRefs?: Map<string, HTMLDivElement>;
    currentModalId?: string;
    renderMode: RenderMode;
    store: BaseModalStoreInstance;
} {
    const storeBaseModal = storeInstanceBaseModal(rendererId);
    const { internalActions, isMounted, modalStackMap, modalWindowRefs, currentModalId, renderMode } = storeBaseModal((state) => state)
    return { ...internalActions, isMounted, modalStackMap, modalWindowRefs, currentModalId, renderMode, store: storeBaseModal };
}