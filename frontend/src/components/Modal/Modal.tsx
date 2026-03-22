import '../../css/modal.css';
import { createPortal } from 'react-dom';

function Modal({isOpen, onClose, children}: {isOpen: boolean, onClose: () => void, children: React.ReactNode}) {
    if (!isOpen) return null;
    
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={onClose}>
            &times;
            </button>

            {children}
        </div>
        </div>,
        document.body
    );
}

export default Modal;