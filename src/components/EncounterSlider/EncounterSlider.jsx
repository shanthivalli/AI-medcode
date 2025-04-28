// /src/components/EncounterSlider/EncounterSlider.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../Common/Button/Button';
import TextArea from '../Common/TextArea/TextArea';
import Icon from '../Common/Icon/Icon';
import Chip from '../Common/Chip/Chip';
import Tooltip from '../Common/Tooltip/Tooltip';
import FlexibleTextArea from '../Common/FlexibleTextArea/FlexibleTextArea';
import styles from './EncounterSlider.module.scss';

const EncounterSlider = ({
  isOpen,
  onClose,
  encounter = {},
  providerCptCodes = [],
  providerIcdCodes = [],
  chartText,
  onChartTextChange,
  onGenerate,
  isLoading,
}) => {
  const sliderRef = useRef(null);
  const textAreaRef = useRef(null);
  const [isEmrExpanded, setIsEmrExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [providerExpanded, setProviderExpanded] = useState(true);

  // Focus Management
  useEffect(() => {
    if (isOpen) {
      if (isEmrExpanded && textAreaRef.current) {
        setTimeout(() => textAreaRef.current?.focus(), 50);
      } else if (!isEmrExpanded) {
        setTimeout(() => sliderRef.current?.querySelector(`.${styles.internalCloseButton}, button, textarea`)?.focus(), 300);
      }
    }
  }, [isOpen, isEmrExpanded]);

  // Escape Key Handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isEmrExpanded) {
          setIsEmrExpanded(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isEmrExpanded, onClose]);

  // Internal toggle function
  const toggleEmrExpanded = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsEmrExpanded(prev => !prev);
  }, []);

  const { encounterNumber = 'N/A', accountNumber = 'N/A', patientName = 'N/A', provider = 'N/A', status = 'N/A', time = 'N/A' } = encounter;
  const hasProviderCodes = providerCptCodes.length > 0 || providerIcdCodes.length > 0;

   if (!isOpen) { return null; }

   const isGenerateDisabled = isLoading || !chartText || !chartText.trim();

  // DUMMY DATA FOR DEMO (remove in production)
  const demoIcdCodes = [
    ...providerIcdCodes,
    { code: 'A01.1' },
    { code: 'B02.2' },
    { code: 'C03.3' },
    { code: 'D04.4' },
    { code: 'E05.5' }
  ];
  const demoCptCodes = [
    ...providerCptCodes,
    { code: '99213', modifiers: ['25'], units: 2 },
    { code: '93000', modifiers: [], units: 1 },
    { code: '99214', modifiers: ['59'], units: 1 },
    { code: '99215', modifiers: ['25', '59'], units: 3 },
    { code: '99354', modifiers: [], units: 1 }
  ];

  // Only show first 3 ICD and CPT codes
  const visibleIcdCodes = demoIcdCodes.slice(0, 3);
  const visibleCptCodes = demoCptCodes.slice(0, 3);

  return (
    <>
      {isOpen && !isEmrExpanded && <div className={styles.sliderOverlay} onClick={onClose} />}

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
          <Button 
            onClick={onClose} 
            variant="text" 
            iconOnly 
            className={styles.internalCloseButton} 
            ariaLabel="Close Encounter Details" 
            size="small"
          >
            <Icon name="chevron-left" size="1.5em" />
          </Button>
          
          {/* Exit expanded mode button - shown only when expanded */}
          {isEmrExpanded && (
            <Button 
              variant="text" 
              iconOnly 
              size="small" 
              onClick={toggleEmrExpanded} 
              aria-label="Exit Expanded EMR View" 
              className={styles.exitExpandedButton}
            >
              <Icon name="minimize" size="1.2em" />
            </Button>
          )}
          
          <h2 id="encounter-details-title" className={styles.title}>
            {isEmrExpanded ? 'EMR Chart' : 'Encounter Details'}
          </h2>
        </div>

        {/* Content Area */}
        <div className={`${styles.sliderContent} scrollable-panel`}>
          {/* Details Section - Gets collapsed class when EMR is expanded */}
          <section className={`${styles.section} ${styles.detailsSection} ${isEmrExpanded ? styles.isCollapsed : ''}`}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={`${styles.sectionTitle} ${styles.detailsSectionTitle}`}><Icon name="list"/> Details</h3>
              <Button
                variant="text"
                iconOnly
                size="small"
                onClick={() => setDetailsExpanded(e => !e)}
                aria-label={detailsExpanded ? 'Collapse Details' : 'Expand Details'}
                className={styles.sectionToggleButton}
              >
                <Icon name={detailsExpanded ? 'chevron-up' : 'chevron-down'} size="1.2em" />
              </Button>
            </div>
            {detailsExpanded && (
              <div className={styles.detailGrid}>
                <div><strong>Encounter #:</strong> 123456</div>
                <div><strong>Account #:</strong> 789012</div>
                <div><strong>Patient:</strong> John Doe</div>
                <div><strong>Provider:</strong> Dr. Smith</div>
                <div><strong>Status:</strong> In Progress</div>
                <div><strong>Time:</strong> 2024-05-01 10:30 AM</div>
              </div>
            )}
          </section>

          {/* Provider Codes Section - Gets collapsed class when EMR is expanded */}
          <section className={`${styles.section} ${styles.providerSection} ${isEmrExpanded ? styles.isCollapsed : ''}`}>
            <div className={styles.sectionHeaderRow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className={styles.sectionTitle}><Icon name="medical"/> Provider Coded</h3>
              <Button
                variant="text"
                iconOnly
                size="small"
                onClick={() => setProviderExpanded(e => !e)}
                aria-label={providerExpanded ? 'Collapse Provider Codes' : 'Expand Provider Codes'}
                className={styles.sectionToggleButton}
                style={{ marginLeft: 'auto' }}
              >
                <Icon name={providerExpanded ? 'chevron-up' : 'chevron-down'} size="1.2em" />
              </Button>
            </div>
            {providerExpanded && (!hasProviderCodes ? (
              <p className={styles.emptyMessage}>No codes entered by provider.</p>
            ) : (
              <div className={styles.providerCodeLists}>
                {visibleIcdCodes.length > 0 && (
                  <div>
                    <h4 className={styles.codeListTitle}>ICD Codes</h4>
                    <ul className={styles.providerCodeScrollable}>
                      {visibleIcdCodes.map((code, idx) => (
                        <li key={code.id || code.code || idx}>{code.code || code}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {visibleCptCodes.length > 0 && (
                  <div>
                    <h4 className={styles.codeListTitle}>CPT Codes</h4>
                    <div className={styles.providerCodeScrollable}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc' }}>Code</th>
                            <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc' }}>Modifiers</th>
                            <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc' }}>Units</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleCptCodes.map((code, idx) => {
                            const modifiers = code.modifiers && code.modifiers.length > 0 ? code.modifiers.join(', ') : '-';
                            const units = code.units || code.unit;
                            return (
                              <tr key={code.id || code.code || idx}>
                                <td style={{ padding: '4px', border: '1px solid #ccc' }}>{code.code || code}</td>
                                <td style={{ padding: '4px', border: '1px solid #ccc' }}>{modifiers !== '' ? modifiers : '-'}</td>
                                <td style={{ padding: '4px', border: '1px solid #ccc' }}>{units && units !== 1 ? units : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* EMR Chart Section */}
          <section className={`${styles.section} ${styles.emrSection} ${isEmrExpanded ? styles.emrSectionExpanded : ''}`}>
            {/* EMR Header only contains expand button */}
            <div className={styles.emrHeader}>
              <h3 className={styles.sectionTitle}><Icon name="clipboard"/> EMR Chart</h3>
              {/* Enter Expanded View Button */}
              {!isEmrExpanded && (
                <Button 
                  variant="text" 
                  iconOnly 
                  size="small" 
                  onClick={toggleEmrExpanded} 
                  aria-label="Expand EMR View" 
                  className={styles.enterExpandedButton}
                >
                  <Icon name="maximize" size="1.2em" />
                </Button>
              )}
            </div>
            {/* Wrapper contains the textarea */}
            <div className={styles.textAreaWrapper}>
              {!isEmrExpanded ? (
                <FlexibleTextArea
                  ref={textAreaRef}
                  value={chartText}
                  onChange={e => onChartTextChange(e.target.value)}
                  className={`${styles.chartTextArea} scrollable-panel`}
                  style={{ resize: 'none' }}
                />
              ) : (
                <TextArea
                  ref={textAreaRef}
                  id="emr-chart-paste"
                  value={chartText}
                  onChange={e => onChartTextChange(e.target.value)}
                  placeholder="Paste the relevant chart notes here..."
                  className={`${styles.chartTextArea} ${isEmrExpanded ? styles.isExpanded : ''} scrollable-panel`}
                  disabled={isLoading}
                  key={isEmrExpanded ? 'emr-expanded' : 'emr-normal'}
                  isExpanded={isEmrExpanded}
                  rows={4}
                />
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        {!isEmrExpanded && (
          <div className={styles.actionFooter}>
            <Button 
              onClick={onGenerate} 
              disabled={isGenerateDisabled} 
              className={styles.generateButton} 
              variant="primary" 
              size="large" 
              iconLeft={isLoading ? 'sync' : 'ai'}
            >
              {isLoading ? 'Generating...' : 'Generate AI Suggestions'}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};

export default EncounterSlider;