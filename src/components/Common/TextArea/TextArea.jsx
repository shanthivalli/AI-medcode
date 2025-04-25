// /src/components/Common/TextArea/TextArea.jsx
import React, { useId } from 'react';
import styles from './TextArea.module.scss';

const TextArea = React.forwardRef(({ // Add forwardRef
  value, onChange, placeholder, disabled = false, rows = 4, className = '', wrapperClassName = '', id, label, error, ...props
}, ref) => { // Receive ref
   const generatedId = useId();
   const hasLabel = !!label;
   const inputId = id || generatedId;
   const wrapperClasses = [ styles.textAreaWrapper, disabled ? styles.disabled : '', error ? styles.error : '', hasLabel ? styles.hasLabel : '', wrapperClassName ].filter(Boolean).join(' ');
   const textAreaClasses = `${styles.textarea} ${className}`;
  return (
     <div className={wrapperClasses}>
      <textarea
        ref={ref} // Apply forwarded ref
        id={inputId} value={value} onChange={onChange} placeholder={placeholder && !hasLabel ? placeholder : ' '} disabled={disabled} rows={rows} className={textAreaClasses} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
       {hasLabel && ( <label htmlFor={inputId} className={styles.label}> {label} </label> )}
       {error && <div id={`${inputId}-error`} className={styles.errorMessage}>{error}</div>}
    </div>
  );
}); // Close forwardRef
export default TextArea;