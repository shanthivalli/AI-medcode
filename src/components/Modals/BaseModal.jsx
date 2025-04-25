import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import styles from './Modals.module.scss';

const ModalPortal = ({ children }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    // Create the modal root if it doesn't exist
    const el = document.createElement('div');
    el.id = 'modal-root';
    document.body.appendChild(el);
    return ReactDOM.createPortal(children, el);
  }
  return ReactDOM.createPortal(children, modalRoot);
};

const BaseModal = ({ isOpen, onClose, children, title, size = 'medium' }) => {
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus the modal or first focusable element when opened
      modalRef.current?.focus();
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close modal on overlay click
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

   if (!isOpen) {
    return null;
  }

  return (
     <ModalPortal>
       <div
        className={styles.modalOverlay}
        onClick={handleOverlayClick}
        role="presentation" // Changed from dialog as the content div below has the role
      >
        <div
          ref={modalRef}
          className={`${styles.modalDialog} ${styles[size]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : null} // Label by title if exists
          tabIndex={-1} // Make the dialog focusable programmatically
        >
          <div className={styles.modalHeader}>
            {title && <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>}
            <Button
                variant="link"
                className={styles.closeButton}
                onClick={onClose}
                ariaLabel="Close Modal"
                size="small"
            >
              <Icon name="close" size="1.2em"/>
            </Button>
          </div>
          <div className={styles.modalContent}>
            {children}
          </div>
           {/* Optional Footer can be added here */}
            {/* <div className={styles.modalFooter}> */}
            {/*   <Button onClick={onClose} variant="secondary">Close</Button> */}
            {/* </div> */}
        </div>
      </div>
    </ModalPortal>
  );
};

export default BaseModal;