import { useId } from "react";
import useBaseModal, { AcceptableElement, RenderMode } from "@/hooks/useBaseModal";
export { RenderMode };

/** Function returned by `useStaticModal` to show a modal. */
export type ShowModalFn = (el?: AcceptableElement) => () => boolean;
/** Function returned by `useStaticModal` to close a modal. */
export type CloseModalFn = () => boolean;
/** Function returned by `useStaticModal` to focus this modal to foreground. */
export type FocusStaticModalFn = () => boolean;
/** Function returned by `useStaticModal` to update modal content. */
export type UpdateModalContentFn = (newContent: AcceptableElement) => void;
/** Tuple returned by `useStaticModal`. */
export type UseStaticModalReturn = [ShowModalFn, CloseModalFn, FocusStaticModalFn, string, UpdateModalContentFn];

/**
 * Hook for displaying static modal content.
 *
 * Static modals render content provided at open time (or via the hook parameter).
 *
 * @param element Optional default content to use when calling `showModal()` without arguments.
 * @returns `[showModal, closeModal, focus, id, updateModalContent]`
 * @example
 * const [show, close, focus] = useStaticModal()
 * <button onClick={() => show(<div>Hi</div>)}>Open</button>
 */
export default function useStaticModal(element?: AcceptableElement): UseStaticModalReturn {
    const id: string = useId();
    const { pushModal, popModal, updateModal, focusModal } = useBaseModal();

    const showModal = (el?: AcceptableElement) => {
        pushModal(id, typeof el === "function" || (el as any)?.$$typeof !== undefined ? el : element, false);
        return closeModal
    }
    const closeModal = () => {
        return popModal(id);
    }

    const updateModalContent = (newContent: AcceptableElement) => {
        return updateModal(id, newContent);
    }

    const focus: FocusStaticModalFn = () => {
        return focusModal(id);
    }

    return [showModal, closeModal, focus, id, updateModalContent];
}