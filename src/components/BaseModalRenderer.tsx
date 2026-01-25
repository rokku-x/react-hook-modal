'use client'

import { useCallback, useEffect, useRef } from "react";
import { RenderMode, useBaseModalInternal } from "@/hooks/useBaseModal";
import { createPortal } from "react-dom";

/**
 * Renders the shared modal container for the application.
 *
 * Must be mounted once at the root of your app. When mounted, it sets up
 * internal state and provides a wrapper `<dialog>` element where modal windows
 * are rendered according to the selected `renderMode`.
 *
 * @remarks
 * - Only one `BaseModalRenderer` can be mounted at a time.
 * - Mounting this component enables the modal store (`isMounted`), which is
 *   required for hook actions (e.g., `pushModal`, `renderModalElement`).
 */
export interface BaseModalRendererProps {
    /**
     * Determines how multiple modals are displayed.
     * @default RenderMode.STACKED
     */
    renderMode?: RenderMode
    /**
     * Unique ID for the wrapper `<dialog>` element.
     * @default 'base-modal-wrapper'
     */
    id?: string
    /** Inline styles for the wrapper `<dialog>` element. */
    style?: React.CSSProperties
    /** CSS class for the wrapper `<dialog>` element. */
    className?: string
    /** CSS class applied to each modal window element. */
    windowClassName?: string
    /** Inline styles applied to each modal window element. */
    windowStyle?: React.CSSProperties
    /**
     * Prevents body scroll when any modal is open.
     * @default true
     */
    disableBackgroundScroll?: boolean
}

export default function BaseModalRenderer({ renderMode = RenderMode.STACKED, id, style, className, windowClassName, windowStyle, disableBackgroundScroll = true }: BaseModalRendererProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const modalWindowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const { setIsMounted, setModalWindowRefRef, modalStackMap, currentModalId, store } = useBaseModalInternal();
    const modalStack = Array.from(modalStackMap.values())
    const modalStackIds = Array.from(modalStackMap.keys());
    const wrapperIdFinal = id || 'base-modal-wrapper';

    useEffect(() => {
        if (store.getState().isMounted) throw new Error("Multiple BaseModalRenderer detected. Only one BaseModalRenderer is allowed at a time.");
        setModalWindowRefRef(modalWindowRefs.current);
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            setModalWindowRefRef(undefined);
        }
    }, []);

    useEffect(() => {
        const lastModalId = modalStackIds[modalStackIds.length - 1];
        if (lastModalId !== undefined) {
            dialogRef.current?.showModal();
            document.body.setAttribute('inert', 'true');
        } else if (lastModalId === undefined) {
            dialogRef.current?.close();
            document.body.removeAttribute('inert');
        }

    }, [currentModalId]);

    const refCallback = useCallback((node: HTMLDivElement | null, modalId: string) => {
        if (node) {
            modalWindowRefs.current.set(modalId, node);
        } else {
            modalWindowRefs.current.delete(modalId);
        }
    }, []);

    const render = () => {
        switch (renderMode) {
            case RenderMode.STACKED:
                return modalStack.map(([modal, isDynamic], index) => (
                    <div
                        key={modalStackIds[index]}
                        ref={node => refCallback(node, modalStackIds[index])}
                        className={`modal-window ${windowClassName || ''}`}
                        id={modalStackIds[index]}
                        style={{ ...(windowStyle || {}) }}
                        {...(currentModalId! !== modalStackIds[index] ? { inert: true } as any : {})}
                        children={typeof modal === 'function' ? (modal as () => React.ReactNode | JSX.Element)() : modal}
                    />
                ));
            case RenderMode.CURRENT_ONLY:
                return <div
                    id={modalStackIds[modalStack.length - 1]}
                    ref={node => refCallback(node, modalStackIds[modalStack.length - 1])}
                    key={modalStackIds[modalStack.length - 1]}
                    className={`modal-window ${windowClassName || ''}`}
                    style={{ ...(windowStyle || {}) }}
                    children={!modalStack[modalStack.length - 1][1] ? (typeof modalStack[modalStack.length - 1][0] === 'function' ? (modalStack[modalStack.length - 1][0] as () => React.ReactNode | JSX.Element)() : modalStack[modalStack.length - 1][0]) as React.ReactNode : null}
                >

                </div>
            case RenderMode.CURRENT_HIDDEN_STACK:
                return (
                    modalStack.map(([modal, isDynamic], index) => (
                        <div
                            ref={node => refCallback(node, modalStackIds[index])}
                            id={modalStackIds[index]}
                            className={`modal-window ${windowClassName || ''}`}
                            key={modalStackIds[index]}
                            style={{
                                ...(windowStyle || {}),
                                visibility: currentModalId! === modalStackIds[index] ? 'visible' : 'hidden'
                            }}
                            {...(currentModalId! !== modalStackIds[index] ? { inert: true } as any : {})}
                        >
                            {!isDynamic ? (typeof modal === 'function' ? (modal as () => React.ReactNode | JSX.Element)() : modal) : null}
                        </div>
                    ))
                );
        }
    }

    return modalStackIds.length === 0 ? null :
        <>
            {createPortal(<style>{`${disableBackgroundScroll ? `body:has(dialog#${wrapperIdFinal}[open]){overflow:hidden}body{scrollbar-gutter:stable}` : ''}dialog#${wrapperIdFinal}[open]{width:100vw;height:100vh;max-width:100%;max-height:100%}.modal-wrapper{border:none;padding:0;background:unset}.modal-window{display:block;position:absolute;width:100%;height:100%;backdrop-filter:blur(2px);background-color:rgba(0,0,0,.1)}`}</style>, document.head)}
            {createPortal(<dialog ref={dialogRef} id={wrapperIdFinal} className={`modal-wrapper ${className || ''}`} style={style} children={render()} />, document.body)}
        </>
}