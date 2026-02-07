import { stopPropagation } from "@/utils/utils";
import React from "react";
import './ModalWindow.css'
import { createPolyfillComponent } from "@/utils/createPolyfillComponent";

export interface ModalWindowProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

function ModalWindow({ className = "", style = {}, children, ...rest }: ModalWindowProps) {
    return (
        <div
            className={`hook-modal-window ${className}`}
            style={style}
            tabIndex={-1}
            onClick={stopPropagation}
            {...rest}
        >
            {children}
        </div>
    );
}

export default createPolyfillComponent(ModalWindow) as typeof ModalWindow;