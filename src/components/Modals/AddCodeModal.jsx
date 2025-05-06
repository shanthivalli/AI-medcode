// /src/components/Modals/AddCodeModal.jsx
import React from 'react';
import Modal from '../Common/Modal/Modal';
import IcdCodeInput from '../Common/IcdCodeInput/IcdCodeInput';
import styles from './AddCodeModal.module.scss';

const AddCodeModal = ({
    isOpen,
    onClose,
    onAddCode, // Expects function: (codeInfo: object, codeType: string) => void
    codeType = ''  // Expects 'cpt' or 'icd' string, default to empty string
}) => {
  const handleSave = (codeData) => {
    onAddCode(codeData, codeType);
    onClose();
  };

  // Only render if we have a valid codeType
  if (!codeType) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${codeType.toUpperCase()} Code`}
      className={styles.addCodeModal}
    >
      {codeType === 'icd' ? (
        <IcdCodeInput onSave={handleSave} onCancel={onClose} />
      ) : (
        <div>CPT code input form will go here</div>
      )}
    </Modal>
  );
};

export default AddCodeModal;