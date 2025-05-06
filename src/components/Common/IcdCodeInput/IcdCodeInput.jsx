import React, { useState, useEffect, useRef } from 'react';
import styles from './IcdCodeInput.module.scss';

// Mock ICD code data - will be replaced with API call later
const mockIcdData = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'F41.1', description: 'Generalized anxiety disorder' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
  { code: 'E78.5', description: 'Dyslipidemia, unspecified' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
  { code: 'R05', description: 'Cough' },
  { code: 'R51', description: 'Headache' }
];

const IcdCodeInput = ({ onSave, onCancel }) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const codeInputRef = useRef(null);
  const descInputRef = useRef(null);
  const codeSuggestionsRef = useRef(null);
  const descSuggestionsRef = useRef(null);

  useEffect(() => {
    // Handle clicks outside suggestion boxes
    const handleClickOutside = (event) => {
      if (codeSuggestionsRef.current && !codeSuggestionsRef.current.contains(event.target)) {
        setShowCodeSuggestions(false);
      }
      if (descSuggestionsRef.current && !descSuggestionsRef.current.contains(event.target)) {
        setShowDescriptionSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e, suggestions, setShow, inputType) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex], inputType);
        }
        break;
      case 'Escape':
        setShow(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setCode(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.trim()) {
      const filtered = mockIcdData.filter(item => 
        item.code.toLowerCase().includes(value.toLowerCase())
      );
      setCodeSuggestions(filtered);
      setShowCodeSuggestions(true);
    } else {
      setCodeSuggestions([]);
      setShowCodeSuggestions(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.trim()) {
      const filtered = mockIcdData.filter(item => 
        item.description.toLowerCase().includes(value.toLowerCase())
      );
      setDescriptionSuggestions(filtered);
      setShowDescriptionSuggestions(true);
    } else {
      setDescriptionSuggestions([]);
      setShowDescriptionSuggestions(false);
    }
  };

  const handleSuggestionSelect = (item, type) => {
    setCode(item.code);
    setDescription(item.description);
    setShowCodeSuggestions(false);
    setShowDescriptionSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Focus the next input after selection
    if (type === 'code') {
      descInputRef.current?.focus();
    } else {
      codeInputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() && description.trim()) {
      onSave({ code: code.trim(), description: description.trim() });
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="icd-code">ICD Code</label>
          <div className={styles.inputWrapper} ref={codeSuggestionsRef}>
            <input
              id="icd-code"
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyDown={(e) => handleKeyDown(e, codeSuggestions, setShowCodeSuggestions, 'code')}
              placeholder="Enter ICD code"
              className={styles.input}
              autoComplete="off"
            />
            {showCodeSuggestions && codeSuggestions.length > 0 && (
              <ul className={styles.suggestions} role="listbox">
                {codeSuggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionSelect(item, 'code')}
                    className={`${styles.suggestionItem} ${index === selectedSuggestionIndex ? styles.selected : ''}`}
                    role="option"
                    aria-selected={index === selectedSuggestionIndex}
                  >
                    <span className={styles.code}>{item.code}</span>
                    <span className={styles.description}>{item.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="icd-description">Description</label>
          <div className={styles.inputWrapper} ref={descSuggestionsRef}>
            <input
              id="icd-description"
              ref={descInputRef}
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              onKeyDown={(e) => handleKeyDown(e, descriptionSuggestions, setShowDescriptionSuggestions, 'description')}
              placeholder="Enter description"
              className={styles.input}
              autoComplete="off"
            />
            {showDescriptionSuggestions && descriptionSuggestions.length > 0 && (
              <ul className={styles.suggestions} role="listbox">
                {descriptionSuggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionSelect(item, 'description')}
                    className={`${styles.suggestionItem} ${index === selectedSuggestionIndex ? styles.selected : ''}`}
                    role="option"
                    aria-selected={index === selectedSuggestionIndex}
                  >
                    <span className={styles.code}>{item.code}</span>
                    <span className={styles.description}>{item.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={!code.trim() || !description.trim()}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default IcdCodeInput; 