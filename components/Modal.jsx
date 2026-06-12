import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const Modal = ({ children, onClose }) => {
  // Create a div for the modal
  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
      return el;
    })();

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
