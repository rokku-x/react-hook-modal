import { stopPropagation } from "@/utils/utils";
import React from "react";
import './ModalWindow.css'

export interface ModalWindowProps extends React.HTMLAttributes<HTMLDivElement> {

}

export default function ModalWindow({ className = "", style = {}, children, ...rest }: ModalWindowProps) {
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
