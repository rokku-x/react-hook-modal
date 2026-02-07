'use client'

import { useCallback, useEffect, useRef, useMemo } from "react";
import { RenderMode, useBaseModalInternal } from "@/hooks/useBaseModal";
import { createPortal } from "react-dom";

/**
 * Renders the modal container for the application.
 *
 * Multiple `BaseModalRenderer` instances are supported — one per unique `id`.
 * When mounted, it sets up internal state and provides a wrapper `<dialog>` element where modal windows
 * are rendered according to the selected `renderMode`. Each renderer instance uses an isolated store keyed by `id`.
 *
 * @remarks
 * - Mounting this component enables the modal store (`isMounted`) for that `id`, which is required for hook actions.
 * - Mounting two `BaseModalRenderer` with the same `id` will throw an error (only one instance per id is allowed).
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
    /** Allow children in tests/examples */
    children?: React.ReactNode
}

export default function BaseModalRenderer({ id, renderMode = RenderMode.STACKED, style, className, windowClassName, windowStyle, disableBackgroundScroll = true }: BaseModalRendererProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const modalWindowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const { setIsMounted, setModalWindowRefRef, modalStackMap, currentModalId, store } = useBaseModalInternal({ rendererId: id });
    const modalStack = useMemo(() => Array.from(modalStackMap.values()), [modalStackMap]);
    const modalStackIds = useMemo(() => Array.from(modalStackMap.keys()), [modalStackMap]);
    const wrapperIdFinal = id || 'base-modal-wrapper';
    const prevActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (store.getState().isMounted) throw new Error(`A BaseModalRenderer with id "${id}" is already mounted; only one instance per id is allowed.`);
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
            prevActiveElement.current = document.activeElement as HTMLElement | null;
            dialogRef.current?.showModal();
            document.body.setAttribute('inert', 'true');
            if (disableBackgroundScroll) document.body.classList.add('hook-modal-open');
            const el = modalWindowRefs.current.get(lastModalId);
            if (el) el.focus();
        } else if (lastModalId === undefined) {
            dialogRef.current?.close();
            document.body.removeAttribute('inert');
            if (disableBackgroundScroll) document.body.classList.remove('hook-modal-open');
            prevActiveElement.current?.focus?.();
        }

    }, [currentModalId, disableBackgroundScroll]);

    const refCallback = useCallback((node: HTMLDivElement | null, modalId: string) => {
        if (node) {
            modalWindowRefs.current.set(modalId, node);
        } else {
            modalWindowRefs.current.delete(modalId);
        }
    }, []);

    const renderContent = useMemo(() => {
        if (modalStack.length === 0) return null;
        switch (renderMode) {
            case RenderMode.STACKED:
                return modalStack.map(([modal, isDynamic], index) => (
                    <div
                        key={modalStackIds[index]}
                        ref={node => refCallback(node, modalStackIds[index])}
                        className={`modal-instance ${windowClassName || ''}`}
                        id={modalStackIds[index]}
                        style={{ ...(windowStyle || {}) }}
                        tabIndex={-1}
                        inert={currentModalId! !== modalStackIds[index] ? '' : undefined}
                        aria-hidden={currentModalId! !== modalStackIds[index]}
                    >
                        {typeof modal === 'function' ? (modal as () => React.ReactNode | JSX.Element)() : modal}
                    </div>
                ));
            case RenderMode.CURRENT_ONLY:
                return <div
                    id={modalStackIds[modalStack.length - 1]}
                    ref={node => refCallback(node, modalStackIds[modalStack.length - 1])}
                    key={modalStackIds[modalStack.length - 1]}
                    className={`modal-instance ${windowClassName || ''}`}
                    style={{ ...(windowStyle || {}) }}
                    tabIndex={-1}
                    aria-hidden={false}
                >
                    {!modalStack[modalStack.length - 1][1] ? (typeof modalStack[modalStack.length - 1][0] === 'function' ? (modalStack[modalStack.length - 1][0] as () => React.ReactNode | JSX.Element)() : modalStack[modalStack.length - 1][0]) as React.ReactNode : null}
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
                            tabIndex={-1}
                            inert={currentModalId! !== modalStackIds[index] ? '' : undefined}
                            aria-hidden={currentModalId! !== modalStackIds[index]}
                        >
                            {!isDynamic ? (typeof modal === 'function' ? (modal as () => React.ReactNode | JSX.Element)() : modal) : null}
                        </div>
                    ))
                );
            default:
                return null;
        }
    }, [renderMode, modalStack, modalStackIds, currentModalId, windowClassName, windowStyle, refCallback]);


    return modalStackIds.length === 0 ? null :
        <>
            {createPortal(<style>{`${disableBackgroundScroll ? `body:has(dialog#${wrapperIdFinal}[open]){overflow:hidden}body{scrollbar-gutter:stable}` : ''}dialog#${wrapperIdFinal}[open]{width:100vw;height:100vh;max-width:100%;max-height:100%}.renderer-wrapper{border:none;padding:0;background:unset}.modal-instance{display:block;position:absolute;width:100%;height:100%;backdrop-filter:blur(2px);background-color:rgba(0,0,0,.1)}`}</style>, document.head)}
            {createPortal(<dialog role="dialog" aria-modal="true" ref={dialogRef} id={wrapperIdFinal} className={`renderer-wrapper ${className || ''}`} style={style} children={renderContent} />, document.body)}
        </>
}