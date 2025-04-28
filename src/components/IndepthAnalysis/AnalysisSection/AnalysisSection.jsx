// /src/components/IndepthAnalysis/AnalysisSection/AnalysisSection.jsx
import React from 'react';
import styles from './AnalysisSection.module.scss';
import Button from '../../Common/Button/Button';
import Icon from '../../Common/Icon/Icon';
import Tooltip from '../../Common/Tooltip/Tooltip';

const AnalysisSection = ({ 
  items = [], 
  isLoading, 
  onAddCodeFromAnalysis,
  sectionType,
  codeType,
  isCodeAlreadyAdded
}) => {
  if (isLoading) {
    return <div className={styles.loadingSkeleton}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonCode}></div>
          <div className={styles.skeletonText}></div>
        </div>
      ))}
    </div>;
  }

  if (items.length === 0) {
    return <div className={styles.emptyMessage}>No {sectionType} found</div>;
  }

  return (
    <div className={styles.section}>
      {items.map((item, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>{item.description}</span>
              {item.code && (
                <span className={styles.codeType}>
                  {codeType}: {item.code}
                </span>
              )}
            </div>
            {item.rationale && (
              <div className={styles.itemRationale}>
                <Icon name="info" size="1em" />
                {item.rationale}
              </div>
            )}
          </div>
          {item.code && (
            <Tooltip content={isCodeAlreadyAdded(item.code) ? "Code already added" : `Add ${codeType} code`}>
              <Button
                variant="light"
                size="small"
                onClick={() => onAddCodeFromAnalysis(item.code, codeType)}
                disabled={isCodeAlreadyAdded(item.code)}
                className={styles.addButton}
                aria-label={isCodeAlreadyAdded(item.code) ? "Code already added" : `Add ${codeType} code`}
              >
                {isCodeAlreadyAdded(item.code) ? (
                  <Icon name="success" size="1.2em" />
                ) : (
                  <svg
                    className={styles.icon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="2.2em"
                    height="2.2em"
                    style={{ display: 'block', margin: 'auto' }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </Button>
            </Tooltip>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnalysisSection;