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

function CodingModule() {
  // --- State ---
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEmrExpanded, setIsEmrExpanded] = useState(false);
  const [encounterData] = useState({ /* ... initial ... */ });
  const [chartText, setChartText] = useState('Patient presents complaining of cough...');
  // Set provider codes only once on load (dummy data for demo)
  const [providerCptCodes] = useState([
    { code: '99213', modifiers: ['25'], units: 2 },
    { code: '93000', modifiers: [], units: 1 },
    { code: '99214', modifiers: ['59'], units: 1 }
  ]);
  const [providerIcdCodes] = useState([
    { code: 'J45.909' },
    { code: 'A01.1' },
    { code: 'B02.2' }
  ]);
  const [allCptCodes, setAllCptCodes] = useState([]);
  const [allIcdCodes, setAllIcdCodes] = useState([]);
  const [removedCodeIds, setRemovedCodeIds] = useState(new Set());
  const [codeLinks, setCodeLinks] = useState({});
  const [analysisData, setAnalysisData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    suggestions: false,
    analysis: false
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

  // --- Memos / Derived State ---
  const displayedCptCodes = useMemo(() => allCptCodes.filter(c => !removedCodeIds.has(c.id)), [allCptCodes, removedCodeIds]);
  const displayedIcdCodes = useMemo(() => allIcdCodes.filter(c => !removedCodeIds.has(c.id)), [allIcdCodes, removedCodeIds]);

  // --- Callbacks ---
  const handleGenerate = useCallback(async () => {
    if (!chartText || !chartText.trim()) {
      alert("Please paste chart text before generating suggestions.");
      return;
    }

    setIsLoading({ suggestions: true, analysis: true });
    setAllCptCodes([]); 
    setAllIcdCodes([]); 
    setAnalysisData({}); 
    setAlerts([]);
    setRemovedCodeIds(new Set()); 
    setCodeLinks({});

    try {
      const results = await api.getSuggestions(chartText);
      setAllCptCodes(results.cptCodes || []);
      setAllIcdCodes(results.icdCodes || []);
      setAnalysisData(results.analysisData || {});
      setAlerts(results.alerts || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setAlerts(['Error generating suggestions. Please try again.']);
      setAllCptCodes([]); 
      setAllIcdCodes([]); 
      setAnalysisData({});
    } finally {
      setIsLoading({ suggestions: false, analysis: false });
    }
  }, [chartText]);

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

  const handleSubmit = useCallback(() => {
    // Implementation of submit logic
    console.log('Submitting codes:', {
      cptCodes: displayedCptCodes,
      icdCodes: displayedIcdCodes,
      removedCodeIds: Array.from(removedCodeIds),
      codeLinks,
      chartText,
      encounterData
    });
  }, [displayedCptCodes, displayedIcdCodes, removedCodeIds, codeLinks, chartText, encounterData]);

  const openSlider = useCallback(() => {
    setIsSliderOpen(true);
    setIsEmrExpanded(false);
  }, []);

  const closeSlider = useCallback(() => {
    setIsSliderOpen(false);
    setIsEmrExpanded(false);
  }, []);

  const toggleAlertPanel = useCallback(() => setAlertPanelOpen(prev => !prev), []);

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

  const toggleEmrExpanded = useCallback(() => {
    setIsEmrExpanded(prev => !prev);
    if (!isSliderOpen) setIsSliderOpen(true);
  }, [isSliderOpen]);

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
          onClick={handleSubmit} 
          disabled={isLoading.suggestions}
        > 
          Submit 
        </Button>
        <Button 
          variant="warning" 
          size="medium" 
          iconLeft="flag" 
          onClick={handleSubmit} 
          disabled={isLoading.suggestions}
        > 
          Submit with Flag 
        </Button>
      </div>

      {isSliderOpen && (
        <EncounterSlider
          isOpen={isSliderOpen}
          isEmrExpanded={isEmrExpanded}
          onClose={closeSlider}
          onToggleEmrExpanded={toggleEmrExpanded}
          encounter={encounterData}
          providerCptCodes={providerCptCodes}
          providerIcdCodes={providerIcdCodes}
          chartText={chartText}
          onChartTextChange={setChartText}
          onGenerate={handleGenerate}
          isLoading={isLoading.suggestions}
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

export default CodingModule;