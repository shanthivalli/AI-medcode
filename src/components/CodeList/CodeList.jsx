import React from 'react';
import CodeCard from '../CodeCard/CodeCard';
import Icon from '../Common/Icon/Icon';
import Button from '../Common/Button/Button';
import styles from './CodeList.module.scss';

const CodeList = ({
  title,
  codes = [],
  type,
  onRemove,
  onShowDetails,
  onAddCode,
  onLinkUpdateInternal,
  codeLinks,
  availableIcdsForLinking,
  isLoading,
}) => {
  const listClasses = `${styles.listContent} scrollable-panel ${type === 'icd' ? styles.icdGrid : ''}`;
  
  const handleAddCode = () => {
    if (onAddCode) {
      onAddCode(type);
    }
  };

  return (
    <div className={styles.codeListContainer}>
        <div className={styles.listHeader}>
            <h3 className={styles.title}>{title} ({codes.length})</h3>
            <Button
                variant="primary"
                size="small"
                iconLeft="add"
                onClick={handleAddCode}
                className={styles.addButton}
                aria-label={`Add manual ${type.toUpperCase()} code`}
            >
                Add {type.toUpperCase()}
            </Button>
        </div>

        {/* Content Area */}
        <div className={listClasses}>
            {isLoading && (
                <div className={styles.loadingIndicator}>
                     {/* Directly use type prop */}
                    <Icon name="sync" className={styles.spin}/> Loading {type.toUpperCase()}...
                </div>
            )}

            {!isLoading && codes.length === 0 && (
                 // Directly use type prop
                <p className={styles.emptyMessage}>No {type.toUpperCase()} codes found or added.</p>
            )}

            {!isLoading && codes.length > 0 && (
                <div className={styles.list}>
                {codes.map((codeData) => (
                    <CodeCard
                        key={codeData.id}
                        codeData={codeData}
                        type={type}
                        onRemove={(id) => onRemove(type, id)}
                        onShowDetails={() => onShowDetails(codeData, type)}
                        // Pass linking props only if CPT
                        onLinkUpdateInternal={type === 'cpt' ? onLinkUpdateInternal : undefined}
                        linkedIcdIds={type === 'cpt' ? codeLinks?.[codeData.id] || [] : undefined}
                        availableIcdsForLinking={type === 'cpt' ? availableIcdsForLinking : undefined}
                    />
                ))}
                </div>
            )}
      </div>
    </div>
  );
};

export default CodeList;