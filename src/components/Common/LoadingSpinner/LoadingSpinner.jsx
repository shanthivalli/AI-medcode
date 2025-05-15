import React from 'react';
import styles from './LoadingSpinner.module.scss';

const LoadingSpinner = ({ size = 'medium', text }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={`${styles.spinner} ${styles[size]}`}>
                <div className={styles.spinnerInner}></div>
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
};

export default LoadingSpinner; 