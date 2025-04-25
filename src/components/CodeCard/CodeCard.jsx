// /src/components/CodeCard/CodeCard.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import Chip from '../Common/Chip/Chip';
import Tooltip from '../Common/Tooltip/Tooltip';
import styles from './CodeCard.module.scss';

// useOnClickOutside Hook (keep as before)
function useOnClickOutside(ref, handler) { useEffect(() => { const listener = (event) => { if (!ref.current || ref.current.contains(event.target)) { return; } handler(event); }; document.addEventListener("mousedown", listener); document.addEventListener("touchstart", listener); return () => { document.removeEventListener("mousedown", listener); document.removeEventListener("touchstart", listener); }; }, [ref, handler]); }

const CodeCard = ({ codeData, type, onRemove, onShowDetails, linkedIcdIds = [], availableIcdsForLinking = [], onLinkUpdateInternal }) => {
  const { id, code, description, isManual, unit, modifiers } = codeData;
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [selectedIcds, setSelectedIcds] = useState(new Set(linkedIcdIds));
  const dropdownRef = useRef(null);
  const linkButtonRef = useRef(null);

  useOnClickOutside(dropdownRef, (event) => { if (linkButtonRef.current && !linkButtonRef.current.contains(event.target)) { setIsLinkDropdownOpen(false); } });
  useEffect(() => { setSelectedIcds(new Set(linkedIcdIds)); }, [linkedIcdIds]);

  const handleCardClick = (e) => { if (e.target.closest(`.${styles.actionButton}, .${styles.linkDropdown}`)) { return; } onShowDetails(); };
  const handleRemoveClick = (event) => { 
    event.stopPropagation(); 
    if (onRemove) {
      onRemove(id);
    }
  };
  const toggleLinkDropdown = (event) => { event.stopPropagation(); setIsLinkDropdownOpen(prev => !prev); }
  const handleIcdToggle = (icdId) => { setSelectedIcds(prev => { const newSet = new Set(prev); if (newSet.has(icdId)) { newSet.delete(icdId); } else { newSet.add(icdId); } if (onLinkUpdateInternal) { onLinkUpdateInternal(id, Array.from(newSet)); } return newSet; }); };

  const cardClasses = `${styles.codeCard} ${isManual ? styles.manual : ''} ${type === 'icd' ? styles.icdCard : styles.cptCard}`;

  return (
    <div 
      className={cardClasses} 
      role="article" 
      aria-labelledby={`code-${id}`} 
      onClick={handleCardClick} 
      tabIndex={0} 
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(e); } }}
      data-description={description}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.codeInfo}> <strong id={`code-${id}`} className={styles.code}>{code}</strong> {isManual && ( <Tooltip content="Manually Added" position="top"> <Icon name="edit" className={styles.manualIcon}/> </Tooltip> )} </div>
        <div className={styles.actions}>
            {/* Link Dropdown Button (CPT only) */}
            {type === 'cpt' && onLinkUpdateInternal && (
                 <div className={styles.linkActionWrapper} ref={dropdownRef}>
                    <Tooltip content={selectedIcds.size > 0 ? `Linked (${selectedIcds.size})` : "Link ICD Codes"} position="top">
                        <Button ref={linkButtonRef} variant="text" size="small" iconOnly onClick={toggleLinkDropdown} aria-label={`Link ICD codes to ${code}`} aria-haspopup="true" aria-expanded={isLinkDropdownOpen} className={`${styles.actionButton} ${styles.linkButton} ${selectedIcds.size > 0 ? styles.hasLinks : ''}`}> <Icon name="link" /> </Button>
                    </Tooltip>
                    {/* Linking Dropdown */}
                    {isLinkDropdownOpen && (
                        <div className={styles.linkDropdown} role="dialog" aria-label="Link ICD Codes">
                             <p className={styles.dropdownTitle}>Link applicable ICDs:</p>
                             <ul className={`${styles.icdList} scrollable-panel`}> {availableIcdsForLinking.length === 0 && <li className={styles.noIcds}>No ICDs available</li>} {availableIcdsForLinking.map(icd => ( <li key={icd.id}> <label className={styles.icdLabel}> <input type="checkbox" checked={selectedIcds.has(icd.id)} onChange={() => handleIcdToggle(icd.id)} className={styles.checkbox}/> <span className={styles.icdItemText}> <span className={styles.icdItemCode}>{icd.code}</span> - {icd.description} </span> </label> </li> ))} </ul>
                        </div>
                    )}
                </div>
            )}
            {/* Remove button */}
            <Tooltip content="Remove Code" position="top">
              <Button 
                variant="text" 
                size="small" 
                iconOnly 
                onClick={handleRemoveClick}
                aria-label={`Remove code ${code}`} 
                className={`${styles.actionButton} ${styles.removeButton}`}
              >
                <Icon name="delete" />
              </Button>
            </Tooltip>
        </div>
      </div>
      {/* Description */}
      <p className={styles.description}>{description}</p>
      {/* CPT Specific: Modifiers & Units */}
      {type === 'cpt' && ( <div className={styles.cptDetails}> <span className={styles.detailItem}> <Tooltip content="Default Units" position="top"> <Icon name="layers" /> </Tooltip> Unit: {unit ?? '1'} </span> <span className={styles.detailItem}> <Tooltip content="Default Modifiers" position="top"> <Icon name="edit-3" /> </Tooltip> Mods: {modifiers || 'None'} </span> </div> )}
      {/* Display linked ICDs on CPT card */}
       {type === 'cpt' && selectedIcds.size > 0 && (
           <div className={styles.linkedCodesSection}>
                {Array.from(selectedIcds).map(icdId => {
                     const icd = availableIcdsForLinking.find(i => i.id === icdId);
                     return icd ? (
                          <Tooltip key={icd.id} content={`${icd.code} - ${icd.description}`} position="bottom">
                              <Chip 
                                label={icd.code} 
                                size="small" 
                                color="info" 
                                variant="outlined" 
                                className={styles.linkedChip}
                                title={`${icd.code} - ${icd.description}`}
                              />
                          </Tooltip>
                     ) : null;
                 })}
           </div>
       )}
    </div>
  );
};
export default CodeCard;