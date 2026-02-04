import React from "react";
import './ModalBackdrop.css'

export interface ModalBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default function ModalBackdrop({ onClick, className = "", style = {}, children }: ModalBackdropProps) {
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
