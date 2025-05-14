import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import styles from './RationalePanel.module.scss';

const RationalePanel = ({ 
  isOpen, 
  onClose, 
  rationale,
  onSaveRationale,
  cptCodes = [],
  icdCodes = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRationale, setEditedRationale] = useState(rationale);

  const handleSave = () => {
    onSaveRationale(editedRationale);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRationale(rationale);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const renderCodeSection = (title, codes) => (
    <div className={styles.codeSection}>
      <h3>{title}</h3>
      <ul>
        {codes.map(code => (
          <li key={code.id} className={styles.codeItem}>
            <span className={styles.code}>{code.code}</span>
            <span className={styles.description}>{code.description}</span>
            {code.rationale && (
              <p className={styles.codeRationale}>
                <Icon name="info" />
                {code.rationale}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={`${styles.panel} ${isOpen ? styles.isOpen : ''}`}>
        <div className={styles.header}>
          <h2>
            <Icon name="file-text" />
            Coding Rationale
          </h2>
          <div className={styles.headerActions}>
            {!isEditing && (
              <Button
                variant="text"
                iconLeft="edit"
                onClick={() => setIsEditing(true)}
                ariaLabel="Edit rationale"
              >
                Edit
              </Button>
            )}
            <Button
              variant="text"
              iconOnly
              onClick={onClose}
              ariaLabel="Close rationale panel"
            >
              <Icon name="x" />
            </Button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.overallRationale}>
            <h3>Overall Assessment</h3>
            {isEditing ? (
              <textarea
                value={editedRationale}
                onChange={(e) => setEditedRationale(e.target.value)}
                className={styles.rationaleInput}
                placeholder="Enter the overall coding rationale..."
                rows={6}
              />
            ) : (
              <div className={styles.rationaleText}>
                {rationale || 'No rationale provided.'}
              </div>
            )}
          </div>

          {renderCodeSection('CPT Codes', cptCodes)}
          {renderCodeSection('ICD-10 Codes', icdCodes)}
        </div>

        {isEditing && (
          <div className={styles.footer}>
            <Button variant="light" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default RationalePanel; 