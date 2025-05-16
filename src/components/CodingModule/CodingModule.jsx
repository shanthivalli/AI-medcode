// /src/components/CodingModule/CodingModule.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import EncounterSlider from '../EncounterSlider/EncounterSlider';
import CodeList from '../CodeList/CodeList';
import IndepthAnalysis from '../IndepthAnalysis/IndepthAnalysis';
import DetailsPanel from '../Panels/DetailsPanel';
import AlertPanel from '../Panels/AlertPanel';
import AddCodeModal from '../Modals/AddCodeModal';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import Tooltip from '../Common/Tooltip/Tooltip';
import RationalePanel from '../Panels/RationalePanel';
import styles from './CodingModule.module.scss';
import { api } from '../../services/api';
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
 * @typedef {Object} CodingModuleProps
 * @property {EncounterDetails} encounterDetails - Details of the current encounter
 * @property {ProviderCode[]} providerCptCodes - List of provider's CPT codes
 * @property {ProviderCode[]} providerIcdCodes - List of provider's ICD codes
 * @property {Function} [onSubmit] - Callback when codes are submitted
 * @property {Function} [onSubmitWithFlag] - Callback when codes are submitted with flag
 */

function CodingModule({ 
  encounterDetails = {},
  providerCptCodes = [],
  providerIcdCodes = [],
  onSubmit,
  onSubmitWithFlag
}) {
  // --- State ---
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEmrExpanded, setIsEmrExpanded] = useState(false);
  const [chartText, setChartText] = useState('');
  const [allCptCodes, setAllCptCodes] = useState([]);
  const [allIcdCodes, setAllIcdCodes] = useState([]);
  const [removedCodeIds, setRemovedCodeIds] = useState(new Set());
  const [codeLinks, setCodeLinks] = useState({});
  const [analysisData, setAnalysisData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    suggestions: false,
    analysis: false,
    submit: false
  });
  const [detailsPanelState, setDetailsPanelState] = useState({ isOpen: false, content: null });
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const [addCodeModalState, setAddCodeModalState] = useState({ isOpen: false, type: null });
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [rationalePanelState, setRationalePanelState] = useState({
    isOpen: false,
    rationale: '',
  });

  // Update chartText when encounterDetails changes, but only if it's not empty
  useEffect(() => {
    if (encounterDetails?.chartText && !chartText) {
      setChartText(encounterDetails.chartText);
    }
  }, [encounterDetails, chartText]);

  // --- Memos / Derived State ---
  const displayedCptCodes = useMemo(() => allCptCodes.filter(c => !removedCodeIds.has(c.id)), [allCptCodes, removedCodeIds]);
  const displayedIcdCodes = useMemo(() => allIcdCodes.filter(c => !removedCodeIds.has(c.id)), [allIcdCodes, removedCodeIds]);

  // --- Callbacks ---
  const openSlider = useCallback(() => {
    setIsSliderOpen(true);
    setIsEmrExpanded(false);
  }, []);

  const closeSlider = useCallback(() => {
    setIsSliderOpen(false);
    setIsEmrExpanded(false);
  }, []);

  const toggleAlertPanel = useCallback(() => {
    setAlertPanelOpen(prev => !prev);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!chartText || !chartText.trim()) {
      setAlerts(['Please paste chart text before generating suggestions.']);
      return;
    }

    setIsLoading({ suggestions: true, analysis: false });
    setAllCptCodes([]); 
    setAllIcdCodes([]); 
    setAlerts([]);
    setRemovedCodeIds(new Set()); 
    setCodeLinks({});

    try {
      const results = await api.getSuggestions(chartText);
      setAllCptCodes(results.cptCodes || []);
      setAllIcdCodes(results.icdCodes || []);
      setAlerts((results.alerts || []).map(alert => 
        typeof alert === 'object' ? alert.message || 'Unknown alert' : alert
      ));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setAlerts(['Error generating suggestions. Please try again.']);
      setAllCptCodes([]); 
      setAllIcdCodes([]); 
    } finally {
      setIsLoading({ suggestions: false, analysis: false });
    }
  }, [chartText]);

  const handleSubmit = async (isFlagged = false) => {
    try {
      setIsLoading({ ...isLoading, submit: true });
      
      // Get all selected codes
      const selectedCodes = {
        cptCodes: displayedCptCodes.map(code => ({
          code: code.code,
          description: code.description,
          unit: code.units,
          modifiers: code.modifiers,
          rationale: code.rationale
        })),
        icdCodes: displayedIcdCodes.map(code => ({
          code: code.code,
          description: code.description,
          rationale: code.rationale
        }))
      };

      // Send codes to base app with flag if needed
      await api.updateEncounterCodes(encounterDetails.encounterId, {
        ...selectedCodes,
        isFlagged // Add the flag to indicate this is a flagged submission
      });

      // Set success alert as a string message
      setAlerts([`Codes successfully submitted to the base application${isFlagged ? ' with flag' : ''}`]);
    } catch (error) {
      console.error('Error submitting codes:', error);
      // Set error alert as a string message
      setAlerts(['Failed to submit codes. Please try again.']);
    } finally {
      setIsLoading({ ...isLoading, submit: false });
    }
  };

  const handleRemoveCode = useCallback((type, codeId) => {
    setRemovedCodeIds(prev => new Set([...prev, codeId]));
    setExistingCodes(prev => prev.filter(code => code.id !== codeId));
    
    if (type === 'icd') {
      setCodeLinks(prev => {
        const newLinks = { ...prev };
        Object.keys(newLinks).forEach(cptId => {
          newLinks[cptId] = newLinks[cptId].filter(id => id !== codeId);
        });
        return newLinks;
      });
    }
    if (type === 'cpt') {
      setCodeLinks(prev => {
        const { [codeId]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const handleAddManualCode = useCallback((codeInfo, type) => {
    if (type === 'cpt') {
      setAllCptCodes(prev => [...prev, codeInfo]);
    } else if (type === 'icd') {
      setAllIcdCodes(prev => [...prev, codeInfo]);
    }
  }, []);

  const handleAddCodeFromAnalysis = useCallback((code, codeType) => {
    if (existingCodes.some(existingCode => existingCode.code === code)) {
      return;
    }

    const codeId = `${codeType}-${code}-${Date.now()}`;
    const newCode = {
      id: codeId,
      code,
      codeType,
      source: 'analysis',
      timestamp: new Date().toISOString()
    };

    setExistingCodes(prev => [...prev, newCode]);
    
    if (codeType === 'ICD') {
      setAllIcdCodes(prev => [...prev, newCode]);
    } else if (codeType === 'CPT') {
      setAllCptCodes(prev => [...prev, newCode]);
    }
  }, [existingCodes]);

  const handleLinkUpdateInternal = useCallback((cptId, newLinkedIcdIds) => {
    setCodeLinks(prev => ({
      ...prev,
      [cptId]: newLinkedIcdIds
    }));
  }, []);

  const showDetailsPanel = useCallback((codeData, type) => {
    setDetailsPanelState({ isOpen: true, content: { ...codeData, codeType: type } });
  }, []);

  const closeDetailsPanel = useCallback(() => {
    setDetailsPanelState({ isOpen: false, content: null });
  }, []);

  const openAddCodeModal = useCallback((type) => {
    setAddCodeModalState({ isOpen: true, type });
  }, []);

  const closeAddCodeModal = useCallback(() => {
    setAddCodeModalState({ isOpen: false, type: null });
  }, []);

  const handleShowAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    try {
      const data = await api.getAnalysis(chartText);
      setAnalysisData(data);
      setAnalysisVisible(true);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAlerts(['Error generating analysis. Please try again.']);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [chartText]);

  const openRationalePanel = useCallback(() => {
    setRationalePanelState(prev => ({
      ...prev,
      isOpen: true
    }));
  }, []);

  const closeRationalePanel = useCallback(() => {
    setRationalePanelState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleSaveRationale = useCallback(async () => {
    try {
      const rationale = await api.getRationale(displayedCptCodes, displayedIcdCodes);
      setRationalePanelState(prev => ({
        ...prev,
        rationale: rationale.overallRationale
      }));
    } catch (error) {
      console.error('Error fetching rationale:', error);
      setAlerts(['Error generating rationale. Please try again.']);
    }
  }, [displayedCptCodes, displayedIcdCodes]);

  // --- Render ---
  return (
    <div className={styles.codingModule}>
      {!isSliderOpen && (
        <Tooltip content="Open Encounter Details" position="right">
          <Button 
            onClick={openSlider} 
            className={styles.sliderToggleButton} 
            aria-label="Open Encounter Details" 
            variant="light"
            iconLeft="chevron-right"
          />
        </Tooltip>
      )}

      <div className={styles.topRightActions}>
        <Button
          variant="light"
          size="medium"
          iconLeft="file-text"
          onClick={openRationalePanel}
          className={styles.rationaleButton}
        >
          Rationale
        </Button>

        <button
          className={styles.alertButton}
          onClick={toggleAlertPanel}
          data-has-alerts={alerts.length > 0}
          aria-label={`${alerts.length} alerts`}
          title={`${alerts.length} alerts`}
        >
          <Icon name="bell" />
          {alerts.length > 0 && (
            <span className={styles.alertCount}>
              {alerts.length}
            </span>
          )}
        </button>

        <Button 
          variant="success" 
          size="medium" 
          iconLeft="send" 
          onClick={() => handleSubmit(false)} 
          disabled={isLoading.submit || displayedCptCodes.length === 0 && displayedIcdCodes.length === 0}
        > 
          Submit 
        </Button>
        <Button 
          variant="warning" 
          size="medium" 
          iconLeft="flag" 
          onClick={() => handleSubmit(true)} 
          disabled={isLoading.submit || displayedCptCodes.length === 0 && displayedIcdCodes.length === 0}
        > 
          Submit with Flag 
        </Button>
      </div>

      {isSliderOpen && (
        <EncounterSlider
          isOpen={isSliderOpen}
          isEmrExpanded={isEmrExpanded}
          onClose={closeSlider}
          onToggleEmrExpanded={() => setIsEmrExpanded(prev => !prev)}
          encounter={encounterDetails}
          providerCptCodes={providerCptCodes}
          providerIcdCodes={providerIcdCodes}
          chartText={chartText}
          onChartTextChange={setChartText}
          onGenerate={handleGenerate}
          isLoading={isLoading.suggestions}
          hasBaseAppChartText={Boolean(encounterDetails?.chartText)}
        />
      )}

      <main className={`${styles.mainContent} ${isSliderOpen ? styles.sliderIsOpen : ''}`}>
        <section className={`${styles.panel} ${styles.panelCpt}`}>
          <CodeList 
            title="CPT Codes" 
            codes={displayedCptCodes} 
            type="cpt" 
            onRemove={handleRemoveCode} 
            onShowDetails={showDetailsPanel} 
            onAddCode={openAddCodeModal} 
            onLinkUpdateInternal={handleLinkUpdateInternal} 
            codeLinks={codeLinks} 
            availableIcdsForLinking={displayedIcdCodes} 
            isLoading={isLoading.suggestions} 
          />
        </section>

        <section className={`${styles.panel} ${styles.panelIcd}`}>
          <CodeList 
            title="ICD Codes" 
            codes={displayedIcdCodes} 
            type="icd" 
            onRemove={handleRemoveCode} 
            onShowDetails={showDetailsPanel} 
            onAddCode={openAddCodeModal} 
            isLoading={isLoading.suggestions} 
          />
        </section>

        {!isSliderOpen && (
          <section className={`${styles.panel} ${styles.panelAnalysis}`}>
            <IndepthAnalysis
              analysisData={analysisData}
              isLoading={isLoadingAnalysis}
              analysisVisible={analysisVisible}
              onShowAnalysis={handleShowAnalysis}
              onAddCodeFromAnalysis={handleAddCodeFromAnalysis}
              existingCodes={existingCodes}
            />
          </section>
        )}
      </main>

      <DetailsPanel 
        isOpen={detailsPanelState.isOpen} 
        onClose={closeDetailsPanel} 
        content={detailsPanelState.content} 
      />
      
      <AlertPanel 
        isOpen={alertPanelOpen} 
        onClose={toggleAlertPanel} 
        alerts={alerts} 
      />
      
      <AddCodeModal 
        isOpen={addCodeModalState.isOpen} 
        onClose={closeAddCodeModal} 
        onAddCode={handleAddManualCode} 
        codeType={addCodeModalState.type} 
      />
      
      <RationalePanel
        isOpen={rationalePanelState.isOpen}
        onClose={closeRationalePanel}
        rationale={rationalePanelState.rationale}
        onSaveRationale={handleSaveRationale}
        cptCodes={displayedCptCodes}
        icdCodes={displayedIcdCodes}
      />
    </div>
  );
}

CodingModule.propTypes = {
  encounterDetails: PropTypes.shape({
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
  onSubmit: PropTypes.func,
  onSubmitWithFlag: PropTypes.func
};

export default CodingModule;