// /src/components/IndepthAnalysis/IndepthAnalysis.jsx
import React from 'react';
import Tabs from '../Common/Tabs/Tabs';
import AnalysisSection from './AnalysisSection/AnalysisSection';
import styles from './IndepthAnalysis.module.scss';
import Icon from '../Common/Icon/Icon';

const IndepthAnalysis = ({ analysisData = {}, isLoading, onAddCodeFromAnalysis }) => {
  const { symptoms = [], diagnoses = [], medications = [], procedures = [] } = analysisData;
  const hasData = symptoms.length > 0 || diagnoses.length > 0 || medications.length > 0 || procedures.length > 0;
  const shouldShowContent = hasData || isLoading;
  return ( <div className={styles.analysisContainer}> <h3 className={styles.title}><Icon name="chart" /> In-depth Analysis</h3> {!shouldShowContent ? ( <p className={styles.emptyMessage}>No analysis data available. Generate suggestions first.</p> ) : ( <Tabs defaultActiveKey="diagnoses" className={styles.tabs}> <Tabs.TabPane eventKey="diagnoses" title={`Diagnoses (${diagnoses.length})`}> <AnalysisSection items={diagnoses} isLoading={isLoading} onAddCodeFromAnalysis={onAddCodeFromAnalysis} sectionType="diagnoses" /> </Tabs.TabPane> <Tabs.TabPane eventKey="procedures" title={`Procedures (${procedures.length})`}> <AnalysisSection items={procedures} isLoading={isLoading} onAddCodeFromAnalysis={onAddCodeFromAnalysis} sectionType="procedures" /> </Tabs.TabPane> <Tabs.TabPane eventKey="symptoms" title={`Symptoms (${symptoms.length})`}> <AnalysisSection items={symptoms} isLoading={isLoading} onAddCodeFromAnalysis={onAddCodeFromAnalysis} sectionType="symptoms" /> </Tabs.TabPane> <Tabs.TabPane eventKey="medications" title={`Medications (${medications.length})`}> <AnalysisSection items={medications} isLoading={isLoading} sectionType="medications" /> </Tabs.TabPane> </Tabs> )} </div> );
};
export default IndepthAnalysis;