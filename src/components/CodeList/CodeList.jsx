import React from 'react';
import CodeCard from '../CodeCard/CodeCard';
import Icon from '../Common/Icon/Icon';
import Button from '../Common/Button/Button';
import styles from './CodeList.module.scss';

const CodeList = ({
  title,
  codes = [],
  type, // Expect 'cpt' or 'icd' to be passed reliably now
  onRemove,
  onShowDetails,
  onAddCode,
  // CPT specific props for linking dropdown
  onLinkUpdateInternal,
  codeLinks,
  availableIcdsForLinking,
  isLoading,
}) => {
  // Apply specific grid class for ICD list styling based on the received type
  const listClasses = `${styles.listContent} scrollable-panel ${type === 'icd' ? styles.icdGrid : ''}`;

  return (
    <div className={styles.codeListContainer}>
        {/* Header with Title and Add Button */}
        <div className={styles.listHeader}>
            <h3 className={styles.title}>{title} ({codes.length})</h3>
             {/* Render Add button only if onAddCode handler is provided */}
             {onAddCode && (
                 <Button
                    variant="primary"
                    size="small"
                    iconLeft="add"
                    onClick={() => onAddCode(type)} // Pass type directly
                    // Directly use type prop, assuming it's valid ('cpt' or 'icd')
                    aria-label={`Add manual ${type.toUpperCase()} code`}
                 >
                    Add {type.toUpperCase()}
                </Button>
            )}
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
                        type={type} // Pass type directly
                        onRemove={() => onRemove(type, codeData.id)} // Pass type directly
                        onShowDetails={() => onShowDetails(codeData, type)} // Pass type directly
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