// /src/components/EncounterSlider/EncounterSlider.jsx
import React, { useRef, useEffect } from 'react'; // Removed useState, useCallback
import Button from '../Common/Button/Button';
import TextArea from '../Common/TextArea/TextArea';
import Icon from '../Common/Icon/Icon';
import Chip from '../Common/Chip/Chip';
import Tooltip from '../Common/Tooltip/Tooltip';
import styles from './EncounterSlider.module.scss';

const EncounterSlider = ({
  isOpen,
  onClose,
  encounter = {},
  providerCptCodes = [],
  providerIcdCodes = [],
  chartText,
  onChartTextChange,
  onGenerate, // *** Receive this prop ***
  isLoading, // *** This should be boolean (isLoading.suggestions from parent) ***
  isEmrExpanded, // Receive prop for internal styling/logic if needed
  onToggleEmrExpanded, // Receive prop for internal logic if needed
}) => {
  const sliderRef = useRef(null);
  // Removed internal fullscreen state

  // --- Focus Management ---
  useEffect(() => {
    if (isOpen && !isEmrExpanded) { // Check expanded state received from parent
      setTimeout(() => { sliderRef.current?.querySelector(`.${styles.internalCloseButton}, button, textarea`)?.focus(); }, 300);
    }
    // Don't focus textarea here, fullscreen is handled externally or via internal state if kept
  }, [isOpen, isEmrExpanded]);

  // --- Escape Key Handling ---
  useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
           event.stopPropagation();
           if (isEmrExpanded) { // Use prop
              console.log("Esc: Requesting exit expanded");
              onToggleEmrExpanded(); // Call parent toggle handler
           } else if (isOpen) {
               console.log("Esc: Closing slider");
               onClose();
           }
        }
      };
      if(isOpen) { window.addEventListener('keydown', handleKeyDown); }
      return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, isEmrExpanded, onClose, onToggleEmrExpanded]); // Add dependencies


  const { encounterNumber = 'N/A', accountNumber = 'N/A', patientName = 'N/A', provider = 'N/A', status = 'N/A', time = 'N/A' } = encounter;
  const hasProviderCodes = providerCptCodes.length > 0 || providerIcdCodes.length > 0;

   // Render slider only if open
   if (!isOpen) { return null; }

   // --- FIX: Check disabled state calculation ---
   const isGenerateDisabled = isLoading || !chartText || !chartText.trim();
   console.log('EncounterSlider: Generate Button Disabled State:', { isLoading, chartTextExists: !!chartText?.trim(), isGenerateDisabled });
   // --- End Fix ---

  // --- RENDER ---
  return (
    <>
      {/* Overlay */}
      {isOpen && !isEmrExpanded && <div className={styles.sliderOverlay} onClick={onClose} />}

      {/* Panel gets expanded class based on prop */}
      <aside
        ref={sliderRef}
        className={`${styles.sliderPanel} ${isOpen ? styles.isOpen : ''} ${isEmrExpanded ? styles.isEmrExpanded : ''}`}
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        aria-labelledby="encounter-details-title"
        data-expanded={isEmrExpanded}
      >
        {/* Header */}
        <div className={styles.sliderHeader}>
            <Tooltip content="Close Panel (Esc)" position="right"> 
                <Button 
                    onClick={onClose} 
                    variant="secondary" 
                    iconOnly 
                    className={styles.internalCloseButton} 
                    ariaLabel="Close Encounter Details" 
                    size="small"
                > 
                    <Icon name="chevron-left" /> 
                </Button> 
            </Tooltip>
            <h2 id="encounter-details-title" className={styles.title}>Encounter Details</h2>
            <Tooltip content={"Exit Expanded View (Esc)"} position={"left"}> 
                <Button 
                    variant="text" 
                    iconOnly 
                    size="small" 
                    onClick={onToggleEmrExpanded} 
                    aria-label={"Exit Expanded EMR View"} 
                    className={styles.exitExpandedButton}
                > 
                    <Icon name={'minimize'} /> 
                </Button> 
            </Tooltip>
        </div>

        {/* Content Area */}
        <div className={`${styles.sliderContent} scrollable-panel`}>
            <section className={styles.section}> <h3 className={styles.sectionTitle}><Icon name="list"/> Details</h3> <div className={styles.detailGrid}> {/* ...details... */} </div> </section>
            <section className={styles.section}> <h3 className={styles.sectionTitle}><Icon name="medical"/> Provider Coded</h3> {/* ...provider codes... */} </section>
            <section className={`${styles.section} ${styles.emrSection}`}>
                 <div className={styles.emrHeader}>
                     <h3 className={styles.sectionTitle}><Icon name="clipboard"/> EMR Chart</h3>
                      <Tooltip content={"Expand EMR View"} position={"left"}>
                          <Button variant="text" iconOnly size="small" onClick={onToggleEmrExpanded} aria-label={"Expand EMR View"} className={styles.enterExpandedButton} >
                             <Icon name={'maximize'} />
                          </Button>
                      </Tooltip>
                 </div>
                 <div className={`${styles.textAreaWrapper}`}>
                     <TextArea
                         id="emr-chart-paste"
                         value={chartText}
                         onChange={(e) => onChartTextChange(e.target.value)}
                         placeholder="Paste the relevant chart notes here..."
                         className={`${styles.chartTextArea} ${isEmrExpanded ? styles.isExpanded : ''} scrollable-panel`}
                         disabled={isLoading} // Use the isLoading boolean directly
                         key={isEmrExpanded ? 'emr-expanded' : 'emr-normal'}
                     />
                 </div>
             </section>
        </div>

        {/* Footer */}
         <div className={styles.actionFooter}>
              {/* --- FIX: Ensure onClick and disabled are correct --- */}
              <Button
                 onClick={onGenerate} // Use the passed prop
                 disabled={isGenerateDisabled} // Use calculated disabled state
                 className={styles.generateButton}
                 variant="primary" size="large"
                 iconLeft={isLoading ? 'sync' : 'ai'} // Show spinner/icon based on loading
              >
                 {isLoading ? 'Generating...' : 'Generate AI Suggestions'}
              </Button>
              {/* --- End Fix --- */}
          </div>
      </aside>
    </>
  );
};

export default EncounterSlider;