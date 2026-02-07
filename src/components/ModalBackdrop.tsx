import React, { useRef } from "react";
import './ModalBackdrop.css'
import { createPolyfillComponent } from "@/utils/createPolyfillComponent";

export interface ModalBackdropProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

function ModalBackdrop({ onClick, className = "", style = {}, children }: ModalBackdropProps) {
    return (
        <div
            className={`hook-modal-backdrop ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export default createPolyfillComponent(ModalBackdrop) as typeof ModalBackdrop;
