// /src/components/IndepthAnalysis/AnalysisSection/AnalysisSection.jsx
import React from 'react';
import styles from './AnalysisSection.module.scss';
import Icon from '../../Common/Icon/Icon';
import Tooltip from '../../Common/Tooltip/Tooltip';
import Button from '../../Common/Button/Button';

const AnalysisSection = ({ items = [], isLoading, onAddCodeFromAnalysis, sectionType }) => {
  if (isLoading) { return ( <div className={styles.loadingSkeleton}> {[...Array(5)].map((_, i) => ( <div key={i} className={styles.skeletonItem}> <div className={styles.skeletonCode}></div> <div className={styles.skeletonText}></div> <div className={styles.skeletonRationale}></div> </div> ))} </div> ); }
  if (items.length === 0) { return <p className={styles.emptySection}>No items found in this section.</p>; }
  const determineCodeType = () => { switch (sectionType) { case 'procedures': return 'cpt'; case 'diagnoses': case 'symptoms': return 'icd'; default: return null; } };
  return ( <ul className={styles.analysisList}> {items.map((item, index) => { const codeTypeToAdd = determineCodeType(); const canAdd = codeTypeToAdd && item.code; return ( <li key={index} className={styles.analysisItem}> <div className={styles.itemMain}> <div className={styles.itemHeader}> {item.code && ( <Tooltip content="Code" position="top"> <strong className={styles.itemCode}> <Icon name="code" size="0.9em"/> {item.code} </strong> </Tooltip> )} <Tooltip content="Description" position="top"> <span className={styles.itemDescription}>{item.description}</span> </Tooltip> </div> {item.rationale && ( <Tooltip content="AI Rationale" position="top"> <p className={styles.itemRationale}> <Icon name="ai" size="0.9em"/> {item.rationale} </p> </Tooltip> )} </div> {canAdd && onAddCodeFromAnalysis && ( <Tooltip content={`Add ${item.code} as ${codeTypeToAdd.toUpperCase()}`} position="left"> <Button variant="light" size="small" iconOnly onClick={() => onAddCodeFromAnalysis({ code: item.code, description: item.description, isManual: true }, codeTypeToAdd)} className={styles.addButton} aria-label={`Add code ${item.code}`}> <Icon name="add"/> </Button> </Tooltip> )} </li> ); })} </ul> );
};
export default AnalysisSection;