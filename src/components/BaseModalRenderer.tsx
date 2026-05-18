'use client'

import { useCallback, useEffect, useRef, useMemo } from "react";
import { RenderMode, useBaseModalInternal } from "@/hooks/useBaseModal";
import { createPortal } from "react-dom";
import "./BaseModalRenderer.css";

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
}

export default function BaseModalRenderer({ id, renderMode = RenderMode.STACKED, style, className, windowClassName, windowStyle, disableBackgroundScroll = true }: BaseModalRendererProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const modalWindowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const { setIsMounted, setModalWindowRefRef, modalStackMap, currentModalId, store } = useBaseModalInternal({ rendererId: id });
    const modalStackEntries = useMemo(() => Array.from(modalStackMap.entries()), [modalStackMap]);
    const wrapperIdFinal = id || 'base-modal-wrapper';
    const prevActiveElement = useRef<HTMLElement | null>(null);
    const wrapperClassName = ['renderer-wrapper', className].filter(Boolean).join(' ');
    const baseWindowStyle = windowStyle || {};

    useEffect(() => {
        if (store.getState().isMounted) {
            throw new Error(`A BaseModalRenderer with id "${id}" is already mounted; only one instance per id is allowed.`);
        }

        setModalWindowRefRef(modalWindowRefs.current);
        setIsMounted(true);

        return () => {
            setIsMounted(false);
            setModalWindowRefRef(undefined);
        };
    }, [id, setIsMounted, setModalWindowRefRef, store]);

    useEffect(() => {
        const activeModalId = currentModalId ?? modalStackEntries[modalStackEntries.length - 1]?.[0];

        if (activeModalId !== undefined) {
            prevActiveElement.current = document.activeElement as HTMLElement | null;
            dialogRef.current?.showModal();
            document.body.setAttribute('inert', 'true');

            if (disableBackgroundScroll) {
                document.body.classList.add('hook-modal-open');
            }

            modalWindowRefs.current.get(activeModalId)?.focus();
        } else {
            dialogRef.current?.close();
            document.body.removeAttribute('inert');

            if (disableBackgroundScroll) {
                document.body.classList.remove('hook-modal-open');
            }

            prevActiveElement.current?.focus?.();
        }
    }, [modalStackEntries, currentModalId, disableBackgroundScroll]);

    const refCallback = useCallback((node: HTMLDivElement | null, modalId: string) => {
        if (node) {
            modalWindowRefs.current.set(modalId, node);
        } else {
            modalWindowRefs.current.delete(modalId);
        }
    }, []);

    const renderModalContent = (modal: React.ReactNode | (() => React.ReactNode | JSX.Element), isDynamic: boolean) => {
        if (isDynamic) return null;
        return typeof modal === 'function' ? modal() : modal;
    };

    const renderModalWindow = (
        modalId: string,
        modal: React.ReactNode | (() => React.ReactNode | JSX.Element),
        isDynamic: boolean,
        isActive: boolean,
        extraStyle?: React.CSSProperties,
        windowClass = 'modal-instance'
    ) => (
        <div
            key={modalId}
            ref={node => refCallback(node, modalId)}
            id={modalId}
            className={[windowClass, windowClassName].filter(Boolean).join(' ')}
            style={{ ...baseWindowStyle, ...extraStyle }}
            tabIndex={-1}
            inert={!isActive ? '' : undefined}
            aria-hidden={!isActive}
        >
            {renderModalContent(modal, isDynamic)}
        </div>
    );

    const renderContent = useMemo(() => {
        if (!modalStackEntries.length) return null;

        const activeModalId = currentModalId ?? modalStackEntries[modalStackEntries.length - 1][0];
        const activeEntry = modalStackEntries.find(([modalId]) => modalId === activeModalId);

        if (renderMode === RenderMode.CURRENT_ONLY) {
            if (!activeEntry) return null;
            const [modalId, [modal, isDynamic]] = activeEntry;
            return renderModalWindow(modalId, modal, isDynamic, true);
        }

        return modalStackEntries.map(([modalId, [modal, isDynamic]]) => {
            const isActive = modalId === activeModalId;

            if (renderMode === RenderMode.CURRENT_HIDDEN_STACK) {
                return renderModalWindow(modalId, modal, isDynamic, isActive, { visibility: isActive ? 'visible' : 'hidden' }, 'modal-window');
            }

            return renderModalWindow(modalId, modal, isDynamic, isActive);
        });
    }, [renderMode, modalStackEntries, currentModalId, windowClassName, baseWindowStyle, refCallback]);

    if (!modalStackEntries.length) return null;

    return createPortal(
        <dialog role="dialog" aria-modal="true" ref={dialogRef} id={wrapperIdFinal} className={wrapperClassName} style={style}>
            {renderContent}
        </dialog>,
        document.body
    );
}