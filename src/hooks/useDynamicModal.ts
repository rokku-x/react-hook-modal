import { useRef, ReactNode, useId, useState, useEffect, createElement } from "react";
import { createPortal } from "react-dom";
import useBaseModal, { AcceptableElement, RenderMode, useBaseModalInternal } from "@/hooks/useBaseModal";

/** Function returned by `useDynamicModal` to render content inside the modal window via a portal. */
export type RenderModalElementFn = (el: ReactNode) => ReactNode;
/** Function returned by `useDynamicModal` to open the modal. */
export type ShowDynamicModalFn = () => void;
/** Function returned by `useDynamicModal` to close the modal. */
export type CloseDynamicModalFn = () => void;
/** Function returned by `useDynamicModal` to focus the modal to foreground. */
export type FocusDynamicModalFn = () => boolean;
/** Tuple returned by `useDynamicModal`. */
export type UseDynamicModalReturn = [RenderModalElementFn, ShowDynamicModalFn, CloseDynamicModalFn, FocusDynamicModalFn, string, boolean];

/**
 * Hook for dynamic modals where content is rendered from within the modal window.
 *
 * Unlike static modals, the content is provided to `renderModalElement()` and
 * rendered into the modal window using a React portal. Requires a mounted
 * `BaseModalRenderer` so the window ref exists.
 *
 * @returns `[renderModalElement, showModal, closeModal, focus, id, isForeground]`
 * @example
 * const [render, show, close] = useDynamicModal()
 * return (<>
 *   <button onClick={show}>Open</button>
 *   {render(<div><button onClick={close}>Close</button></div>)}
 * </>)
 */
export default function useDynamicModal(): UseDynamicModalReturn {
    const id: string = useId();
    const { pushModal, popModal, focusModal, getModalWindowRef, currentModalId } = useBaseModal();
    const [, setRerender] = useState(0);
    const isForeground = currentModalId === id;

    useEffect(() => {
        setRerender((r) => r + 1);
    }, [currentModalId]);

    const renderModalElement = (el: ReactNode): ReactNode => {
        const modalWindowRef = getModalWindowRef(id);
        if (!modalWindowRef) return null;
        return createPortal(
            el,
            modalWindowRef
        );
    }

    const showModal = () => {
        return pushModal(id, null, true);
    }

    const closeModal = () => {
        return popModal(id);
    }

    const focus = () => {
        return focusModal(id);
    }

    return [renderModalElement, showModal, closeModal, focus, id, isForeground];
}
export { RenderMode };

