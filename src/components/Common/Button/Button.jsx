// /src/components/Common/Button/Button.jsx
import React, { forwardRef } from 'react';
import Icon from '../Icon/Icon';
import styles from './Button.module.scss';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  iconLeft,
  iconRight,
  iconOnly = false,
  className = '',
  ariaLabel,
  ...props
}, ref) => {
  const buttonClasses = `
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${iconOnly ? styles.iconOnly : ''}
    ${className}
  `.trim();

  return (
    <button
      ref={ref}
      className={buttonClasses}
      aria-label={ariaLabel || undefined}
      {...props}
    >
      {iconLeft && <Icon name={iconLeft} />}
      {children}
      {iconRight && <Icon name={iconRight} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;