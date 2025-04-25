// /src/components/Common/Button/Button.jsx
import React from 'react';
import Icon from '../Icon/Icon';
import styles from './Button.module.scss';

const Button = ({ children, onClick, variant = 'primary', size = 'medium', disabled = false, type = 'button', className = '', iconLeft, iconRight, iconOnly = false, ariaLabel, href, ...props }) => {
  const hasIconProp = !!(iconLeft || iconRight);
  const hasValidIconChild = React.Children.count(children) === 1 && React.isValidElement(children) && children.type === Icon;
  const hasNoTextChildren = !children || hasValidIconChild;
  const isEffectivelyIconOnly = iconOnly || (hasNoTextChildren && hasIconProp);

  const buttonClasses = [ styles.button, styles[variant], styles[size], isEffectivelyIconOnly ? styles.iconOnly : '', disabled ? styles.disabled : '', className ].filter(Boolean).join(' ');

  let content = null;
  if (isEffectivelyIconOnly) {
    const iconName = iconLeft || iconRight;
    if (iconName) { content = <Icon name={iconName} size="1.2em"/>; }
    else if (hasValidIconChild) { content = React.cloneElement(children, { size: children.props.size || "1.2em", ...children.props }); }
    else { console.warn("IconOnly button rendered without valid icon prop/child.", { iconLeft, iconRight, children }); }
  } else {
    content = ( <> {iconLeft && <Icon name={iconLeft} className={styles.iconLeft} size="1.1em"/>} {children && <span>{children}</span>} {iconRight && <Icon name={iconRight} className={styles.iconRight} size="1.1em"/>} </> );
  }

  if (href) { return ( <a href={!disabled ? href : undefined} className={buttonClasses} onClick={!disabled ? onClick : (e) => e.preventDefault()} aria-disabled={disabled} role="button" {...props}> {content} </a> ); }
  return ( <button type={type} className={buttonClasses} onClick={onClick} disabled={disabled} aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)} {...props} > {content} </button> );
};
export default Button;