// /src/components/Common/Tabs/Tabs.jsx
import React, { useState, Children, isValidElement, useRef, useEffect } from 'react';
import styles from './Tabs.module.scss';

const Tabs = ({ children, defaultActiveKey, className = '' }) => {
  const tabs = Children.toArray(children).filter(isValidElement);
  const initialActiveKey = defaultActiveKey || tabs[0]?.props?.eventKey;
  const [activeKey, setActiveKey] = useState(initialActiveKey);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabListRef = useRef(null); const activeTabRef = useRef(null);
  const handleSelect = (key, element) => { setActiveKey(key); updateIndicator(element); };
  const updateIndicator = (element) => { if (element && tabListRef.current) { const lr = tabListRef.current.getBoundingClientRect(); const tr = element.getBoundingClientRect(); setIndicatorStyle({ left: tr.left - lr.left + tabListRef.current.scrollLeft, width: tr.width }); } };
  useEffect(() => { if (activeTabRef.current) { updateIndicator(activeTabRef.current); } const hr = () => { if (activeTabRef.current) { updateIndicator(activeTabRef.current); } }; window.addEventListener('resize', hr); return () => window.removeEventListener('resize', hr); }, [activeKey]);
  const handleKeyDown = (event, key, index) => { let ni = -1; if (event.key === 'ArrowRight') ni = (index + 1) % tabs.length; else if (event.key === 'ArrowLeft') ni = (index - 1 + tabs.length) % tabs.length; else if (event.key === 'Home') ni = 0; else if (event.key === 'End') ni = tabs.length - 1; if (ni !== -1) { event.preventDefault(); const nt = tabs[ni]; const nb = tabListRef.current?.children[ni]?.querySelector('button'); if(nb) { handleSelect(nt.props.eventKey, nb); nb.focus(); } } };
  return ( <div className={`${styles.tabsContainer} ${className}`}> <div className={styles.tabListWrapper}> <ul className={styles.tabList} role="tablist" ref={tabListRef}> {tabs.map((tab, index) => { const isSelected = activeKey === tab.props.eventKey; return ( <li key={tab.props.eventKey} className={styles.tabItem} role="presentation" > <button ref={isSelected ? activeTabRef : null} role="tab" id={`tab-${tab.props.eventKey}`} aria-controls={`tabpanel-${tab.props.eventKey}`} aria-selected={isSelected} onClick={(e) => handleSelect(tab.props.eventKey, e.currentTarget)} onKeyDown={(e) => handleKeyDown(e, tab.props.eventKey, index)} className={`${styles.tabButton} ${isSelected ? styles.active : ''}`} tabIndex={isSelected ? 0 : -1} > {tab.props.title} </button> </li> ); })} <div className={styles.tabIndicator} style={indicatorStyle} /> </ul> </div> <div className={styles.tabContent}> {tabs.map((tab) => ( <div key={tab.props.eventKey} id={`tabpanel-${tab.props.eventKey}`} role="tabpanel" aria-labelledby={`tab-${tab.props.eventKey}`} className={`${styles.tabPane} ${activeKey === tab.props.eventKey ? styles.active : ''}`} hidden={activeKey !== tab.props.eventKey} tabIndex={0} > {activeKey === tab.props.eventKey && tab.props.children} </div> ))} </div> </div> );
};
const TabPane = ({ children, eventKey, title }) => { return <>{children}</>; }; // Data carrier
Tabs.TabPane = TabPane;
export default Tabs;