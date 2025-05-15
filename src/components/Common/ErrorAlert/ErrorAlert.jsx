import React from 'react';
import Icon from '../Icon/Icon';
import styles from './ErrorAlert.module.scss';

const ErrorAlert = ({ error, onRetry, onDismiss }) => {
    if (!error) return null;

    const getIcon = () => {
        switch (error.type) {
            case 'timeout':
                return 'clock';
            case 'network':
                return 'wifi-off';
            default:
                return 'alert-circle';
        }
    };

    return (
        <div className={`${styles.errorAlert} ${styles[error.type]}`}>
            <Icon name={getIcon()} className={styles.icon} />
            <div className={styles.content}>
                <p className={styles.message}>{error.message}</p>
                {onRetry && (
                    <button 
                        onClick={onRetry}
                        className={styles.retryButton}
                    >
                        Try Again
                    </button>
                )}
            </div>
            {onDismiss && (
                <button 
                    onClick={onDismiss}
                    className={styles.dismissButton}
                    aria-label="Dismiss error"
                >
                    <Icon name="x" />
                </button>
            )}
        </div>
    );
};

export default ErrorAlert; 