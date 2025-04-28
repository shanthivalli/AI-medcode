// /src/components/CodingModule/CodingModule.jsx
import React, { useState, useCallback, useMemo } from 'react';
import EncounterSlider from '../EncounterSlider/EncounterSlider';
import CodeList from '../CodeList/CodeList';
import IndepthAnalysis from '../IndepthAnalysis/IndepthAnalysis';
import DetailsPanel from '../Panels/DetailsPanel';
import AlertPanel from '../Panels/AlertPanel';
import AddCodeModal from '../Modals/AddCodeModal';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import Tooltip from '../Common/Tooltip/Tooltip';
import styles from './CodingModule.module.scss';

// Mock data function - ensure this simulates async behavior
const fetchAiSuggestions = async (chartText) => {
    console.log("SIMULATING FETCH: AI suggestions for text starting with:", chartText.substring(0, 30) + "...");
    // Simulate network delay (e.g., 1.5 seconds)
    await new Promise(res => setTimeout(res, 1500));
    console.log("SIMULATING FETCH: Received AI suggestions.");
    // Return mock data structure
    return { cptCodes: [ { id: 'cpt-ai-1', code: '99213', description: 'Office visit, est patient, 10-19 min', unit: 1, modifiers: '', rationale: 'Based on time doc.', relatedLink: '#', aapcGuidance: 'Verify time or MDM.' }, { id: 'cpt-ai-3', code: '96372', description: 'Therapeutic injection, SC/IM', unit: 1, modifiers: '59', rationale: 'Injection documented.', relatedLink: '#', aapcGuidance: 'Check distinct service.', isManual: false }, ], icdCodes: [ { id: 'icd-ai-1', code: 'J45.909', description: 'Unspecified asthma without exacerbation', rationale: 'Primary diagnosis.', relatedSeriesCodes: ['J45.20'], isManual: false }, { id: 'icd-ai-2', code: 'I10', description: 'Essential (primary) hypertension', rationale: 'Chronic condition.', relatedSeriesCodes: ['I11.9'], isManual: false }, ], analysisData: { symptoms: [ { description: 'Cough', rationale: 'Patient report.', code: 'R05'}], diagnoses: [ { code: 'J45.909', description: 'Asthma', rationale: 'Main condition addressed.' }], medications: [ { description: 'Albuterol Inhaler', rationale: 'Prescribed for asthma.', code: null}], procedures: [ { code: '99213', description: 'Office Visit E/M', rationale: 'Core service provided.' }] }, alerts: ['Verify modifier usage on 96372.', 'Check asthma control.'], providerCptCodes: [{ id: 'cpt-prov-1', code: '99213' }], providerIcdCodes: [{ id: 'icd-prov-1', code: 'J45.909' }] };
};

function CodingModule() {
  // --- State ---
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEmrExpanded, setIsEmrExpanded] = useState(false); // State for slider internal logic
  const [encounterData, setEncounterData] = useState({ /* ... initial ... */ });
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
  // --- FIX: Ensure isLoading state structure matches usage ---
  const [isLoading, setIsLoading] = useState({
       suggestions: false, // For the overall generation process
       analysis: false    // Could be separate if analysis loads later
    });
  // --- End Fix ---
  const [detailsPanelState, setDetailsPanelState] = useState({ isOpen: false, content: null });
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const [addCodeModalState, setAddCodeModalState] = useState({ isOpen: false, type: null });
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);

  // --- Callbacks ---
  // --- FIX: Verify handleGenerate Logic ---
  const handleGenerate = useCallback(async () => {
      console.log('--- handleGenerate: START ---'); // Log start
      // Ensure chartText has content before proceeding
      if (!chartText || !chartText.trim()) {
          console.log('handleGenerate: Aborted - chartText is empty.');
          alert("Please paste chart text before generating suggestions.");
          return;
      }

      // Set loading state correctly
      setIsLoading({ suggestions: true, analysis: true }); // Set both true initially
      setAllCptCodes([]); setAllIcdCodes([]); setAnalysisData({}); setAlerts([]);
      setRemovedCodeIds(new Set()); setCodeLinks({});
      // Keep slider open during generation? Or close it? Decide based on UX.
      // setIsSliderOpen(false); // Optional: Close slider

      try {
        console.log('handleGenerate: Calling fetchAiSuggestions...');
        const results = await fetchAiSuggestions(chartText);
        console.log('handleGenerate: Received results:', results);

        // Update state with results
        setAllCptCodes(results.cptCodes || []);
        setAllIcdCodes(results.icdCodes || []);
        setAnalysisData(results.analysisData || {});
        setAlerts(results.alerts || []);
        // Provider codes are NOT updated here anymore
        // setProviderCptCodes(results.providerCptCodes || []);
        // setProviderIcdCodes(results.providerIcdCodes || []);

      } catch (error) {
        console.error("handleGenerate: Error fetching AI suggestions:", error);
        setAlerts(['Error generating suggestions. Please try again.']);
        // Ensure state is cleared on error too
        setAllCptCodes([]); setAllIcdCodes([]); setAnalysisData({});
      } finally {
        console.log('--- handleGenerate: FINALLY - Resetting loading state ---');
        setIsLoading({ suggestions: false, analysis: false }); // Reset loading state
      }
  }, [chartText]); // Dependency is chartText
  // --- End Fix ---

  // Other callbacks (Keep as before)
  const handleRemoveCode = useCallback((type, codeId) => {
    setRemovedCodeIds(prev => new Set([...prev, codeId]));
    
    // Also remove from existingCodes
    setExistingCodes(prev => prev.filter(code => code.id !== codeId));
    
    // Also clean up any code links if it's an ICD code
    if (type === 'icd') {
      setCodeLinks(prev => {
        const newLinks = { ...prev };
        // Remove this ICD from all CPT code links
        Object.keys(newLinks).forEach(cptId => {
          newLinks[cptId] = newLinks[cptId].filter(id => id !== codeId);
        });
        return newLinks;
      });
    }
    // If it's a CPT code, remove all its ICD links
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
  const handleAddCodeFromAnalysis = (code, codeType) => {
    // Check if code already exists
    if (existingCodes.some(existingCode => existingCode.code === code)) {
      return;
    }

    // Generate a unique ID for the new code
    const codeId = `${codeType}-${code}-${Date.now()}`;

    // Add the new code
    const newCode = {
      id: codeId,
      code,
      codeType,
      source: 'analysis',
      timestamp: new Date().toISOString()
    };

    setExistingCodes(prev => [...prev, newCode]);
    
    // Add to appropriate section based on codeType
    if (codeType === 'ICD') {
      setAllIcdCodes(prev => [...prev, newCode]);
    } else if (codeType === 'CPT') {
      setAllCptCodes(prev => [...prev, newCode]);
    } else if (codeType === 'HCPCS') {
      // Handle HCPCS addition
    }
  };
  const handleLinkUpdateInternal = useCallback((cptId, newLinkedIcdIds) => { /* ... */ }, []);
  const handleSubmit = useCallback((isFlagged = false) => { /* ... */ }, [allCptCodes, allIcdCodes, removedCodeIds, codeLinks, chartText, encounterData]);
  const openSlider = useCallback(() => { setIsSliderOpen(true); setIsEmrExpanded(false); }, []);
  const closeSlider = useCallback(() => { setIsSliderOpen(false); setIsEmrExpanded(false); }, []);
  const toggleAlertPanel = useCallback(() => setAlertPanelOpen(prev => !prev), []);
  const showDetailsPanel = useCallback((codeData, type) => { setDetailsPanelState({ isOpen: true, content: { ...codeData, codeType: type } }); }, []);
  const closeDetailsPanel = useCallback(() => { setDetailsPanelState({ isOpen: false, content: null }); }, []);
  const openAddCodeModal = useCallback((type) => {
    setAddCodeModalState({ 
      isOpen: true, 
      type: type
    });
  }, []);
  const closeAddCodeModal = useCallback(() => { setAddCodeModalState({ isOpen: false, type: null }); }, []);
  const toggleEmrExpanded = useCallback(() => { setIsEmrExpanded(prev => !prev); if (!isSliderOpen) setIsSliderOpen(true); }, [isSliderOpen]);

  const handleShowAnalysis = async () => {
    setIsLoadingAnalysis(true);
    // Simulate API call or use your real fetch function
    const data = await fetchAiSuggestions(chartText); // or your real fetch function for analysis
    setAnalysisData(data.analysisData || {});
    setIsLoadingAnalysis(false);
    setAnalysisVisible(true);
  };

  // --- Memos / Derived State ---
  const displayedCptCodes = useMemo(() => allCptCodes.filter(c => !removedCodeIds.has(c.id)), [allCptCodes, removedCodeIds]);
  const displayedIcdCodes = useMemo(() => allIcdCodes.filter(c => !removedCodeIds.has(c.id)), [allIcdCodes, removedCodeIds]);
  const isAnalysisVisible = !isSliderOpen;

  // --- RENDER ---
  return (
    <div className={styles.codingModule}>
       {/* Slider Trigger Button */}
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
       {/* Top Right Action Buttons */}
       <div className={styles.topRightActions}> 
         {/* Alert Button */}
         <button
           className={styles.alertButton}
           onClick={() => setAlertPanelOpen(!alertPanelOpen)}
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
         <Button variant="success" size="medium" iconLeft="send" onClick={() => handleSubmit(false)} disabled={isLoading.suggestions} > 
           Submit 
         </Button> 
         <Button variant="warning" size="medium" iconLeft="flag" onClick={() => handleSubmit(true)} disabled={isLoading.suggestions} > 
           Submit w/ Flag 
         </Button> 
       </div>

      {/* Render Slider only when isSliderOpen is true */}
      {isSliderOpen && (
          <EncounterSlider
            isOpen={isSliderOpen}
            isEmrExpanded={isEmrExpanded}
            onClose={closeSlider}
            onToggleEmrExpanded={toggleEmrExpanded} // Pass EMR expand toggle
            encounter={encounterData}
            providerCptCodes={providerCptCodes}
            providerIcdCodes={providerIcdCodes}
            chartText={chartText}
            onChartTextChange={setChartText}
            onGenerate={handleGenerate} // *** Pass handleGenerate here ***
            isLoading={isLoading.suggestions} // *** Pass correct loading state part ***
          />
       )}

      {/* Main Content Area */}
      <main className={`${styles.mainContent} ${isSliderOpen ? styles.sliderIsOpen : ''}`}>
        <section className={`${styles.panel} ${styles.panelCpt}`}> <CodeList title="CPT Codes" codes={displayedCptCodes} type="cpt" onRemove={handleRemoveCode} onShowDetails={showDetailsPanel} onAddCode={openAddCodeModal} onLinkUpdateInternal={handleLinkUpdateInternal} codeLinks={codeLinks} availableIcdsForLinking={displayedIcdCodes} isLoading={isLoading.suggestions} /> </section>
        <section className={`${styles.panel} ${styles.panelIcd}`}> <CodeList title="ICD Codes" codes={displayedIcdCodes} type="icd" onRemove={handleRemoveCode} onShowDetails={showDetailsPanel} onAddCode={openAddCodeModal} isLoading={isLoading.suggestions} /> </section>
        {isAnalysisVisible && ( <section className={`${styles.panel} ${styles.panelAnalysis}`}> <IndepthAnalysis
          analysisData={analysisData}
          isLoading={isLoadingAnalysis}
          analysisVisible={analysisVisible}
          onShowAnalysis={handleShowAnalysis}
          onAddCodeFromAnalysis={handleAddCodeFromAnalysis}
          existingCodes={existingCodes}
        /> </section> )}
      </main>

      {/* Other Panels/Modals */}
      <DetailsPanel isOpen={detailsPanelState.isOpen} onClose={closeDetailsPanel} content={detailsPanelState.content} />
      <AlertPanel isOpen={alertPanelOpen} onClose={toggleAlertPanel} alerts={alerts} />
      <AddCodeModal isOpen={addCodeModalState.isOpen} onClose={closeAddCodeModal} onAddCode={handleAddManualCode} codeType={addCodeModalState.type} />
    </div>
  );
}

export default CodingModule;