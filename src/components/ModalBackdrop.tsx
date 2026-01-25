import React from "react";

export interface ModalBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default function ModalBackdrop({ onClick, className = "", style = {}, children }: ModalBackdropProps) {
    return (
        <div
            className={`hook-modal-backdrop ${className}`}
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                ...style,
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
