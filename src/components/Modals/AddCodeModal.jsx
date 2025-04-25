// /src/components/Modals/AddCodeModal.jsx
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal'; // Import BaseModal correctly
import Button from '../Common/Button/Button';
import Input from '../Common/Input/Input';
import styles from './AddCodeModal.module.scss';

const AddCodeModal = ({
    isOpen,
    onClose,
    onAddCode, // Expects function: (codeInfo: object, codeType: string) => void
    codeType   // Expects 'cpt' or 'icd' string
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  // Clear form state when the modal is closed or the type changes
  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setDescription('');
    }
  }, [isOpen]); // Rerun only when isOpen changes

  // Handler for the 'Add Code' button click
  const handleAdd = () => {
    // Validate essential props
    if (!codeType || !code.trim()) {
      console.warn("AddCodeModal: Cannot add code - codeType or code value is missing.");
      // TODO: Consider adding user feedback (e.g., highlight input)
      return;
    }

    // Prepare the object with code details (excluding type)
    const codeInfo = {
      id: `${codeType.toLowerCase()}-manual-${Date.now()}`, // Simple unique ID
      code: code.trim().toUpperCase(), // Standardize code format
      description: description.trim() || `Manually Added ${codeType.toUpperCase()}`, // Default description
      isManual: true, // Mark as manually added
    };

    // Call the callback passed from the parent component
    onAddCode(codeInfo, codeType);

    onClose(); // Close the modal after successful submission
  };

  // --- Prepare display strings safely ---
  const modalTitle = `Add Manual ${codeType ? codeType.toUpperCase() : 'Code'}`;
  const codeInputLabel = `${codeType ? codeType.toUpperCase() : 'Code'} Code`;
  const codeInputPlaceholder = `Enter ${codeType ? codeType.toUpperCase() : ''} code`;

  // --- Conditional Rendering ---
  // Don't render the modal DOM unless it's requested to be open
  if (!isOpen) {
     return null;
  }

  // --- JSX ---
  return (
    <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        size="medium"
    >
        {/* Form Content */}
        <div className={styles.formContent}>
            <Input
                // Use a predictable ID structure if needed for external labels or testing
                id={`add-code-input-${codeType || 'unknown'}`}
                label={codeInputLabel}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={codeInputPlaceholder}
                autoFocus // Automatically focus the code input when modal opens
                className={styles.inputField}
                // Add other relevant input attributes if needed (e.g., maxLength)
            />
            <Input
                id={`add-description-input-${codeType || 'unknown'}`}
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter code description"
                className={styles.inputField}
            />
            {/* Placeholder for potential future enhancements like linking */}
        </div>

         {/* Modal Footer */}
         <div className={styles.modalFooter}>
             <Button variant="light" onClick={onClose}>Cancel</Button>
             <Button
                variant="primary"
                onClick={handleAdd}
                // Disable button if code is empty OR if codeType is missing (belt-and-suspenders)
                disabled={!code.trim() || !codeType}
             >
                 Add Code
             </Button>
         </div>
    </BaseModal>
  );
};

export default AddCodeModal;