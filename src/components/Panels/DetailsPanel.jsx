// /src/components/Panels/DetailsPanel.jsx
import React, { useEffect, useRef } from 'react';
// Assuming BaseModal doesn't exist or isn't suitable for slide-over panel.
// Recreate Panel logic here or abstract BasePanel component later.
import ReactDOM from 'react-dom';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import styles from './DetailsPanel.module.scss'; // Use dedicated styles

const PanelPortal = ({ children }) => { let pr = document.getElementById('panel-root'); if (!pr) { pr = document.createElement('div'); pr.id = 'panel-root'; document.body.appendChild(pr); } return ReactDOM.createPortal(children, pr); };

const DetailsPanel = ({ isOpen, onClose, content }) => {
    const panelRef = useRef(null);
    useEffect(() => { const hk = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) { document.addEventListener('keydown', hk); setTimeout(() => { panelRef.current?.querySelector('button, a, [tabindex="0"]')?.focus(); }, 100); } return () => { document.removeEventListener('keydown', hk); }; }, [isOpen, onClose]);
    if (!content) return null;
    const { codeType, code, description, unit, modifiers, rationale, relatedLink, aapcGuidance, relatedSeriesCodes } = content;
    const title = `${codeType.toUpperCase()} Details: ${code}`;
    return ( <PanelPortal> {isOpen && <div className={styles.panelOverlay} onClick={onClose} role="presentation"/>} <aside ref={panelRef} className={`${styles.detailsPanel} ${isOpen ? styles.isOpen : ''}`} role="dialog" aria-modal="true" aria-labelledby="details-panel-title" tabIndex={-1} > <div className={styles.panelHeader}> <h2 id="details-panel-title" className={styles.panelTitle}>{title}</h2> <Button variant="text" iconOnly size="small" onClick={onClose} ariaLabel="Close Details" className={styles.closeButton} > <Icon name="close" size="1.5em" /> </Button> </div> <div className={`${styles.panelContent} scrollable-panel`}> <div className={styles.section}> <h4><Icon name="code"/> Code & Description</h4> <p><strong>{code}</strong>: {description}</p> </div> {codeType === 'cpt' && ( <> <div className={styles.section}> <h4><Icon name="ai"/> AI Rationale</h4> <p>{rationale || 'No rationale.'}</p> </div> <div className={styles.section}> <h4><Icon name="edit"/> Unit & Modifiers</h4> <p>Default Unit: {unit ?? '1'} | Default Modifiers: {modifiers || 'None'}</p> <p className={styles.note}>(Actual units/modifiers applied via linking)</p> </div> <div className={styles.section}> <h4><Icon name="info"/> AAPC Guidance / Links</h4> <p>{aapcGuidance || 'N/A'}</p> {relatedLink && <p>Related: <a href={relatedLink} target="_blank" rel="noopener noreferrer">{relatedLink}</a></p>} </div> </> )} {codeType === 'icd' && ( <> <div className={styles.section}> <h4><Icon name="ai"/> AI Rationale</h4> <p>{rationale || 'No rationale.'}</p> </div> <div className={styles.section}> <h4><Icon name="link"/> Related Codes (Series)</h4> {relatedSeriesCodes?.length > 0 ? ( <ul className={styles.relatedList}> {relatedSeriesCodes.map(rc => <li key={rc}>{rc}</li>)} </ul> ) : ( <p>None found.</p> )} </div> </> )} </div> </aside> </PanelPortal> );
};
export default DetailsPanel;