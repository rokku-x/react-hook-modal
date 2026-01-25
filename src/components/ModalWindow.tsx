import { stopPropagation } from "@/utils/utils";
import React from "react";

export interface ModalWindowProps extends React.HTMLAttributes<HTMLDivElement> {

}

export default function ModalWindow({ className = "", style = {}, children, ...rest }: ModalWindowProps) {
    return (
        <div
            className={`hook-modal-window ${className}`}
            style={{
                minWidth: 360,
                maxWidth: "90vw",
                backgroundColor: "#fff",
                borderRadius: 30,
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                padding: 25,
                position: "relative",
                ...style,
            }}
            tabIndex={-1}
            onClick={stopPropagation}
            {...rest}
        >
            {children}
        </div>
    );
}
