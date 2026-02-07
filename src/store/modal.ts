'use client'

import { create } from 'zustand'
import { RenderMode } from '../types/modal'
import type { AcceptableElement, ModalEntry, ModalStackMapType } from '../types/modal'

export interface Store {
    isMounted: boolean;
    renderMode: RenderMode;
    modalStackMap: ModalStackMapType,
    modalWindowRefs?: Map<string, HTMLDivElement>
    currentModalId?: string;
    actions: {
        /** Returns the modal window `div` for a given `modalId`, if mounted. */
        getModalWindowRef: (modalId: string) => HTMLDivElement | undefined;
        /**
         * Pushes a modal onto the stack. If the ID exists, focuses it.
         * @param modalId Unique modal ID. Defaults to `useId()` if omitted.
         * @param el Modal content; for dynamic modals pass `null` and render via portal.
         * @param isDynamic Set `true` for dynamic modals.
         * @returns The modal ID.
         */
        pushModal: (modalId: string, el: AcceptableElement, isDynamic?: boolean) => string;
        /** Removes a modal by ID; returns `true` if found. */
        popModal: (modalId: string) => boolean;
        /** Retrieves a modal entry `[content, isDynamic]` by ID. */
        getModal: (modalId: string) => ModalEntry | undefined;
        /** Updates content for a static modal; dynamic modals cannot be updated. */
        updateModal: (modalId: string, newContent: AcceptableElement, isDynamic?: boolean) => boolean;
        /** Moves the modal with `modalId` to the top of the stack. */
        focusModal: (modalId: string) => boolean;
        /** Returns the zero-based index of the modal in stack order. */
        getModalOrderIndex: (modalId: string) => number;
    }
    internalActions: {
        /** Sets whether `BaseModalRenderer` is mounted. */
        setIsMounted: (mounted: boolean) => void;
        /** Sets the render mode used by the renderer. */
        setRenderMode: (mode: RenderMode) => void;
        /** Registers the internal map of modal window refs. */
        setModalWindowRefRef: (map?: Map<string, HTMLDivElement>) => void;
    }
}

function createStore(instanceId: string = "default") {
    return create<Store>()((set, get) => ({
        modalStackMap: new Map(),
        isMounted: false,
        renderMode: RenderMode.STACKED,
        modalWindowRefs: undefined,
        currentModalId: undefined,
        internalActions: {
            setModalWindowRefRef: (map?: Map<string, HTMLDivElement>) => set((state) => {
                return { modalWindowRefs: map };
            }),
            setIsMounted: (mounted: boolean) => set({ isMounted: mounted }),
            setRenderMode: (mode: RenderMode) => set({ renderMode: mode }),
        },
        actions: {
            pushModal: (modalId: string | undefined, el: AcceptableElement, isDynamic: boolean = false) => {
                modalId = modalId ?? Math.random().toString(36).substring(2, 6);
                if (!get().isMounted) console.warn("BaseModalRenderer must be mounted before using. Please add <BaseModalRenderer /> to your component tree.");
                const modal = get().modalStackMap.get(modalId);
                if (modal !== undefined) {
                    get().actions.focusModal(modalId);
                    return modalId;
                }
                set((state) => {
                    let item: [AcceptableElement | null, boolean] = [el, isDynamic];
                    const newMap = new Map(state.modalStackMap);
                    newMap.set(modalId, item);
                    return { modalStackMap: newMap, currentModalId: modalId };
                });
                return modalId
            },
            popModal: (modalId: string) => {
                const modal = get().modalStackMap.get(modalId);
                if (!modal) return false;
                set((state) => {
                    const newMap = new Map(state.modalStackMap);
                    newMap.delete(modalId);
                    const lastModalId = Array.from(newMap.keys())[newMap.size - 1];
                    return { modalStackMap: newMap, currentModalId: lastModalId };
                });
                return true
            },
            getModal: (modalId: string) => {
                return get().modalStackMap.get(modalId);
            },
            updateModal: (modalId: string, newContent: AcceptableElement, isDynamic?: boolean) => {
                const modal = get().modalStackMap.get(modalId);
                if (!modal) return false;
                set((state) => {
                    const newMap = new Map(state.modalStackMap);
                    //throw error if not dynamic
                    if (modal[1] === true) {
                        console.warn(`Modal with id ${modalId} is dynamic. Cannot update content.`);
                        return { modalStackMap: state.modalStackMap };
                    }
                    modal[0] = newContent;
                    modal[1] = isDynamic ?? modal[1];
                    newMap.set(modalId, modal);
                    return { modalStackMap: newMap };
                })
                return true
            },
            focusModal: (modalId: string) => {
                const item = get().modalStackMap.get(modalId);
                if (!item) return false;
                set((state) => {
                    const newMap = new Map(state.modalStackMap);
                    newMap.delete(modalId);
                    newMap.set(modalId, item);
                    return { modalStackMap: newMap, currentModalId: modalId };
                })
                return true;
            },
            getModalOrderIndex: (modalId: string) => {
                const keys = Array.from(get().modalStackMap.keys());
                return keys.indexOf(modalId);
            },
            getModalWindowRef: (modalId: string) => {
                return get().modalWindowRefs?.get(modalId);
            }
        }
    }));
}

const storeMap = new Map<string, ReturnType<typeof createStore>>();

export type BaseModalStoreInstance = ReturnType<typeof createStore>;

export default function (instanceId: string = "default"): BaseModalStoreInstance {
    if (!storeMap.has(instanceId)) storeMap.set(instanceId, createStore(instanceId));
    return storeMap.get(instanceId)! as BaseModalStoreInstance;
}

