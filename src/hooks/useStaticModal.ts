'use client'

import { useId } from "react";
import useBaseModal, { AcceptableElement, RenderMode } from "@/hooks/useBaseModal";
import { randomId } from "@/utils/utils";
export { RenderMode };
export type { AcceptableElement, ModalEntry } from '../types/modal'

interface ShowModalFnOverLoad {
    (el?: AcceptableElement, stack?: boolean): string,
    (el?: AcceptableElement, id?: string): string
}

interface CloseModalFnOverLoad {
    (customId?: string): boolean,
    (): boolean,
}
/** Function returned by `useStaticModal` to show a modal. */
export type ShowModalFn = ShowModalFnOverLoad;
/** Function returned by `useStaticModal` to close a modal. */
export type CloseModalFn = CloseModalFnOverLoad;
/** Function returned by `useStaticModal` to focus this modal to foreground. */
export type FocusStaticModalFn = (customId?: string) => boolean;
/** Function returned by `useStaticModal` to update modal content. */
export type UpdateModalContentFn = (newContent: AcceptableElement, customId?: string) => boolean;
/** Tuple returned by `useStaticModal`. */
export type UseStaticModalReturn = [ShowModalFn, CloseModalFn, FocusStaticModalFn, UpdateModalContentFn, string];

/**
 * Hook for displaying static modal content.
 *
 * Static modals render content provided at open time (or via the hook parameter).
 *
 * @param element Optional default content to use when calling `showModal()` without arguments.
 * @returns `[showModal, closeModal, focus, updateModalContent, id]`
 * @example
 * const [show, close, focus, updateModalContent, id] = useStaticModal()
 * <button onClick={() => show(<div>Hi</div>)}>Open</button>
 */
export default function useStaticModal(element?: AcceptableElement): UseStaticModalReturn {
    const id: string = useId();
    const { pushModal, popModal, updateModal, focusModal } = useBaseModal();

    const showModal: ShowModalFn = (el?: AcceptableElement, sId: boolean | string = id) => {
        let instanceId = typeof sId === "string" ? sId : sId === true ? randomId(4) : id;
        pushModal(instanceId, typeof el === "function" || (el as any)?.$$typeof !== undefined ? el : element, false);
        return instanceId;
    }

    const closeModal: CloseModalFn = (instanceId: string = id) => {
        instanceId = typeof instanceId === "string" ? instanceId : id;
        return popModal(instanceId);
    }

    const updateModalContent = (newContent: AcceptableElement, customId: string = id) => {
        return updateModal(customId, newContent);
    }

    const focus: FocusStaticModalFn = (customId: string = id) => {
        return focusModal(customId);
    }

    return [showModal, closeModal, focus, updateModalContent, id];
}