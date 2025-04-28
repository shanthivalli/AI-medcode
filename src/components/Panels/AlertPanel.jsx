// /src/components/Panels/AlertPanel.jsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import styles from './AlertPanel.module.scss';

const PanelPortal = ({ children }) => {
  let pr = document.getElementById('panel-root');
  if (!pr) {
    pr = document.createElement('div');
    pr.id = 'panel-root';
    document.body.appendChild(pr);
  }
  return ReactDOM.createPortal(children, pr);
};

const AlertPanel = ({ isOpen, onClose, alerts = [] }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      // Focus the close button when panel opens
      setTimeout(() => {
        const closeButton = panelRef.current?.querySelector(`.${styles.closeButton}`);
        if (closeButton) closeButton.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, onClose]);

  return (
    <PanelPortal>
      <aside
        ref={panelRef}
        className={`${styles.alertPanel} ${isOpen ? styles.isOpen : ''}`}
        role="complementary"
        aria-labelledby="alert-panel-title"
        hidden={!isOpen}
        tabIndex={-1}
      >
        <div className={styles.panelHeader}>
          <h2 id="alert-panel-title" className={styles.panelTitle}>
            <Icon name="warning" />
            AI Alerts
          </h2>
          <Button
            variant="danger"
            iconOnly
            size="small"
            onClick={onClose}
            aria-label="Close Alerts"
            className={styles.closeButton}
          >
            <Icon name="close" />
          </Button>
        </div>

        <div className={`${styles.panelContent} scrollable-panel`}>
          {alerts.length === 0 ? (
            <p className={styles.emptyMessage}>No alerts.</p>
          ) : (
            <ul className={styles.alertList}>
              {alerts.map((alert, index) => (
                <li key={index}>
                  <Icon name="warning" className={styles.alertIcon}/>
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </PanelPortal>
  );
};

export default AlertPanel;