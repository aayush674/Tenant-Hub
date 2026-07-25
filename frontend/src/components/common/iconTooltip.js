// Tooltip.jsx
import { createPortal } from "react-dom";
import { useState, useRef } from "react";

function IconTooltip({ label, children }) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const ref = useRef(null);
    const timerRef = useRef(null);

    const handleEnter = () => {
        const rect = ref.current.getBoundingClientRect();
        setPos({
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
        });
        timerRef.current = setTimeout(() => setShow(true), 300);
    };

    const handleLeave = () => {
        clearTimeout(timerRef.current);
        setShow(false);
    };

    // IconTooltip.jsx
    return (
        <div
            ref={ref}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        // style={{ display: "contents" }}   <-- remove this line
        >
            {children}
            {show &&
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            top: pos.top,
                            left: pos.left,
                            transform: "translateY(-50%)",
                            background: "#333",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            zIndex: 9999,
                        }}
                    >
                        {label}
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default IconTooltip;