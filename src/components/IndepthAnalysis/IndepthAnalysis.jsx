// /src/components/IndepthAnalysis/IndepthAnalysis.jsx
import React from 'react';
import Tabs from '../Common/Tabs/Tabs';
import AnalysisSection from './AnalysisSection/AnalysisSection';
import styles from './IndepthAnalysis.module.scss';
import Icon from '../Common/Icon/Icon';
import Button from '../Common/Button/Button';

const IndepthAnalysis = ({ 
  analysisData = {}, 
  isLoading, 
  analysisVisible, 
  onShowAnalysis,
  onAddCodeFromAnalysis,
  existingCodes = [] // Add existing codes prop to check for duplicates
}) => {
  const { symptoms = [], diagnoses = [], medications = [], procedures = [] } = analysisData;
  const hasData = symptoms.length > 0 || diagnoses.length > 0 || medications.length > 0 || procedures.length > 0;
  const shouldShowContent = hasData || isLoading;

  // Function to check if a code is already added
  const isCodeAlreadyAdded = (code) => {
    return existingCodes.some(existingCode => existingCode.code === code);
  };

  return (
    <div className={styles.analysisContainer}>
      <div className={styles.analysisHeader}>
        <h3 className={styles.title}><Icon name="chart" /> In-depth Analysis</h3>
        <Button
          variant="primary"
          size="small"
          onClick={onShowAnalysis}
          disabled={isLoading || analysisVisible}
        >
          {isLoading ? 'Loading...' : analysisVisible ? 'In-depth Analysis Shown' : 'Show In-depth Analysis'}
        </Button>
      </div>
      {analysisVisible && (
        isLoading ? (
          <p>Loading analysis...</p>
        ) : (
          <>
            {!shouldShowContent ? (
              <p className={styles.emptyMessage}>No analysis data available. Generate suggestions first.</p>
            ) : (
              <Tabs defaultActiveKey="diagnoses" className={styles.tabs}>
                <Tabs.TabPane eventKey="diagnoses" title={`Diagnoses (${diagnoses.length})`}>
                  <AnalysisSection 
                    items={diagnoses} 
                    isLoading={isLoading} 
                    onAddCodeFromAnalysis={onAddCodeFromAnalysis}
                    sectionType="diagnoses"
                    codeType="ICD"
                    isCodeAlreadyAdded={isCodeAlreadyAdded}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane eventKey="procedures" title={`Procedures (${procedures.length})`}>
                  <AnalysisSection 
                    items={procedures} 
                    isLoading={isLoading} 
                    onAddCodeFromAnalysis={onAddCodeFromAnalysis}
                    sectionType="procedures"
                    codeType="CPT"
                    isCodeAlreadyAdded={isCodeAlreadyAdded}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane eventKey="symptoms" title={`Symptoms (${symptoms.length})`}>
                  <AnalysisSection 
                    items={symptoms} 
                    isLoading={isLoading} 
                    onAddCodeFromAnalysis={onAddCodeFromAnalysis}
                    sectionType="symptoms"
                    codeType="ICD"
                    isCodeAlreadyAdded={isCodeAlreadyAdded}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane eventKey="medications" title={`Medications (${medications.length})`}>
                  <AnalysisSection 
                    items={medications} 
                    isLoading={isLoading} 
                    onAddCodeFromAnalysis={onAddCodeFromAnalysis}
                    sectionType="medications"
                    codeType="HCPCS"
                    isCodeAlreadyAdded={isCodeAlreadyAdded}
                  />
                </Tabs.TabPane>
              </Tabs>
            )}
          </>
        )
      )}
    </div>
  );
};

export default IndepthAnalysis;