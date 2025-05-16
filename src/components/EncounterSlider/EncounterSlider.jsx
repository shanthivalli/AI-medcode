// /src/components/EncounterSlider/EncounterSlider.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../Common/Button/Button';
import TextArea from '../Common/TextArea/TextArea';
import Icon from '../Common/Icon/Icon';
import Chip from '../Common/Chip/Chip';
import Tooltip from '../Common/Tooltip/Tooltip';
import FlexibleTextArea from '../Common/FlexibleTextArea/FlexibleTextArea';
import styles from './EncounterSlider.module.scss';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} ProviderCode
 * @property {string} code - The code value (e.g., '99213' for CPT, 'J45.909' for ICD)
 * @property {string[]} [modifiers] - Optional modifiers for CPT codes
 * @property {string|number} [units] - Optional units for CPT codes
 * @property {string} [description] - Optional description of the code
 * @property {string} [rationale] - Optional rationale for the code
 */

/**
 * @typedef {Object} EncounterDetails
 * @property {string} encounterNumber - Unique identifier for the encounter
 * @property {string} accountNumber - Patient's account number
 * @property {string} insurance - Insurance information
 * @property {string} provider - Provider name
 * @property {string} status - Encounter status
 * @property {string} dateOfService - Date of service
 * @property {string} chartText - The medical chart text
 */

/**
 * @typedef {Object} EncounterSliderProps
 * @property {boolean} isOpen - Whether the slider is open
 * @property {boolean} isEmrExpanded - Whether the EMR section is expanded
 * @property {Function} onClose - Callback when slider is closed
 * @property {Function} onToggleEmrExpanded - Callback to toggle EMR expansion
 * @property {EncounterDetails} encounter - Details of the current encounter
 * @property {ProviderCode[]} providerCptCodes - List of provider's CPT codes
 * @property {ProviderCode[]} providerIcdCodes - List of provider's ICD codes
 * @property {string} chartText - The medical chart text
 * @property {Function} onChartTextChange - Callback when chart text changes
 * @property {Function} onGenerate - Callback when generate button is clicked
 * @property {boolean} isLoading - Whether suggestions are being generated
 * @property {boolean} hasBaseAppChartText - Whether the chart text is coming from the base app
 */

const EncounterSlider = ({
  isOpen,
  isEmrExpanded,
  onClose,
  onToggleEmrExpanded,
  encounter = {},
  providerCptCodes = [],
  providerIcdCodes = [],
  chartText,
  onChartTextChange,
  onGenerate,
  isLoading,
  hasBaseAppChartText
}) => {
  const sliderRef = useRef(null);
  const textAreaRef = useRef(null);
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
          onToggleEmrExpanded();
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
  }, [isOpen, isEmrExpanded, onClose, onToggleEmrExpanded]);

  // Internal toggle function
  const toggleEmrExpanded = useCallback((e) => {
    if (e) e.stopPropagation();
    onToggleEmrExpanded();
  }, [onToggleEmrExpanded]);

  // Safely destructure encounter properties with defaults
  const {
    encounterNumber = 'N/A',
    accountNumber = 'N/A',
    provider = 'N/A',
    status = 'N/A',
    insurance = 'N/A',
    dateOfService = 'N/A'
  } = encounter || {};

  if (!isOpen) { return null; }

  const isGenerateDisabled = isLoading || !chartText || !chartText.trim();
  const hasProviderCodes = providerCptCodes.length > 0 || providerIcdCodes.length > 0;

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
                <div><strong>Encounter #:</strong> {encounterNumber}</div>
                <div><strong>Account #:</strong> {accountNumber}</div>
                <div><strong>Insurance:</strong> {insurance}</div>
                <div><strong>Provider:</strong> {provider}</div>
                <div><strong>Status:</strong> {status}</div>
                <div><strong>Date of Service:</strong> {dateOfService}</div>
              </div>
            )}
          </section>

          {/* Provider Codes Section */}
          <section className={`${styles.section} ${styles.providerSection} ${isEmrExpanded ? styles.isCollapsed : ''}`}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}><Icon name="medical"/> Provider Coded</h3>
              <Button
                variant="text"
                iconOnly
                size="small"
                onClick={() => setProviderExpanded(e => !e)}
                aria-label={providerExpanded ? 'Collapse Provider Codes' : 'Expand Provider Codes'}
                className={styles.sectionToggleButton}
              >
                <Icon name={providerExpanded ? 'chevron-up' : 'chevron-down'} size="1.2em" />
              </Button>
            </div>
            {providerExpanded && (!hasProviderCodes ? (
              <p className={styles.emptyMessage}>No codes entered by provider.</p>
            ) : (
              <div className={styles.providerCodeLists}>
                {providerIcdCodes.length > 0 && (
                  <div>
                    <h4 className={styles.codeListTitle}>ICD Codes</h4>
                    <ul className={styles.providerCodeScrollable}>
                      {providerIcdCodes.map((code, idx) => (
                        <li key={code.id || code.code || idx}>{code.code}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {providerCptCodes.length > 0 && (
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
                          {providerCptCodes.map((code, idx) => {
                            const modifiers = code.modifiers && code.modifiers.length > 0 ? code.modifiers.join(', ') : '-';
                            const units = code.units || code.unit;
                            return (
                              <tr key={code.id || code.code || idx}>
                                <td style={{ padding: '4px', border: '1px solid #ccc' }}>{code.code}</td>
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
            <div className={styles.emrHeader}>
              <h3 className={styles.sectionTitle}>
                <Icon name="clipboard"/> 
                {hasBaseAppChartText ? 'EMR Chart' : 'Paste Chart Text'}
              </h3>
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
            <div className={styles.textAreaWrapper}>
              {!isEmrExpanded ? (
                <FlexibleTextArea
                  ref={textAreaRef}
                  value={chartText}
                  onChange={e => onChartTextChange(e.target.value)}
                  className={`${styles.chartTextArea} scrollable-panel`}
                  style={{ resize: 'none' }}
                  placeholder={hasBaseAppChartText ? "Chart text from EMR" : "Paste the relevant chart notes here..."}
                  readOnly={hasBaseAppChartText}
                />
              ) : (
                <TextArea
                  ref={textAreaRef}
                  id="emr-chart-paste"
                  value={chartText}
                  onChange={e => onChartTextChange(e.target.value)}
                  placeholder={hasBaseAppChartText ? "Chart text from EMR" : "Paste the relevant chart notes here..."}
                  className={`${styles.chartTextArea} ${isEmrExpanded ? styles.isExpanded : ''} scrollable-panel`}
                  disabled={isLoading || hasBaseAppChartText}
                  readOnly={hasBaseAppChartText}
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

EncounterSlider.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isEmrExpanded: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleEmrExpanded: PropTypes.func.isRequired,
  encounter: PropTypes.shape({
    encounterNumber: PropTypes.string,
    accountNumber: PropTypes.string,
    insurance: PropTypes.string,
    provider: PropTypes.string,
    status: PropTypes.string,
    dateOfService: PropTypes.string,
    chartText: PropTypes.string
  }),
  providerCptCodes: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    modifiers: PropTypes.arrayOf(PropTypes.string),
    units: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    rationale: PropTypes.string
  })),
  providerIcdCodes: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    description: PropTypes.string,
    rationale: PropTypes.string
  })),
  chartText: PropTypes.string.isRequired,
  onChartTextChange: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasBaseAppChartText: PropTypes.bool.isRequired
};

export default EncounterSlider;