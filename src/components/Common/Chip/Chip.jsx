// /src/components/Common/Chip/Chip.jsx
import React from 'react';
import styles from './Chip.module.scss';
import Icon from '../Icon/Icon';

const Chip = ({ label, color = 'secondary', variant = 'filled', size = 'medium', icon, onDelete, className = '', ...props }) => {
  const chipClasses = [ styles.chip, styles[color], styles[variant], styles[size], onDelete ? styles.deletable : '', className ].filter(Boolean).join(' ');
  const handleDelete = (e) => { e.stopPropagation(); if (onDelete) onDelete(); };
  return ( <div className={chipClasses} {...props}> {icon && <Icon name={icon} className={styles.chipIcon} />} <span className={styles.chipLabel}>{label}</span> {onDelete && ( <button onClick={handleDelete} className={styles.deleteButton} aria-label={`Remove ${label}`}> <Icon name="close" size="0.8em" /> </button> )} </div> );
};
export default Chip;