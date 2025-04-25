// /src/components/Common/Input/Input.jsx
import React, { useId } from 'react'; // Import useId
import Icon from '../Icon/Icon';
import styles from './Input.module.scss';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  wrapperClassName = '',
  id, // Prop for external ID
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}) => {
  // --- Fix Start ---
  // Call useId unconditionally at the top level
  const generatedId = useId();
  // Use the provided id prop, or fall back to the generated one
  const inputId = id || generatedId;
  // --- Fix End ---

  const hasLabel = !!label;

  const wrapperClasses = [
      styles.inputWrapper,
      disabled ? styles.disabled : '',
      error ? styles.error : '',
      hasLabel ? styles.hasLabel : '',
      leftIcon ? styles.hasLeftIcon : '',
      rightIcon ? styles.hasRightIcon : '',
      wrapperClassName
  ].filter(Boolean).join(' ');

  const inputClasses = `${styles.input} ${className}`;

  return (
    <div className={wrapperClasses}>
       {leftIcon && (
           <Icon
                name={leftIcon}
                className={`${styles.inputIcon} ${styles.leftIcon}`}
                aria-hidden="true"
            />
        )}
      <input
        id={inputId} // Use the resolved inputId
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder && !hasLabel ? placeholder : ' '}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {hasLabel && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      {rightIcon && (
           <Icon
                name={rightIcon}
                className={`${styles.inputIcon} ${styles.rightIcon}`}
                aria-hidden="true"
           />
       )}
       {error && <div id={`${inputId}-error`} className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Input;