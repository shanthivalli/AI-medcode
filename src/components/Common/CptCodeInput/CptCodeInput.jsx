import React, { useState, useEffect, useRef } from 'react';
import styles from './CptCodeInput.module.scss';

// Mock CPT code data - will be replaced with API call later
const mockCptData = [
  { code: '99213', description: 'Office/outpatient visit established patient, 20-29 minutes', unit: 1, modifiers: '' },
  { code: '99214', description: 'Office/outpatient visit established patient, 30-39 minutes', unit: 1, modifiers: '' },
  { code: '99215', description: 'Office/outpatient visit established patient, 40-54 minutes', unit: 1, modifiers: '' },
  { code: '96372', description: 'Therapeutic, prophylactic, or diagnostic injection, subcutaneous or intramuscular', unit: 1, modifiers: '' },
  { code: '90471', description: 'Immunization administration', unit: 1, modifiers: '' },
  { code: '97110', description: 'Therapeutic exercises to develop strength, endurance, range of motion, and flexibility', unit: 1, modifiers: '' },
  { code: '97140', description: 'Manual therapy techniques, 15 minutes', unit: 1, modifiers: '' },
  { code: '99202', description: 'Office/outpatient visit new patient, 15-29 minutes', unit: 1, modifiers: '' },
  { code: '99203', description: 'Office/outpatient visit new patient, 30-44 minutes', unit: 1, modifiers: '' },
  { code: '99204', description: 'Office/outpatient visit new patient, 45-59 minutes', unit: 1, modifiers: '' }
];

const CptCodeInput = ({ onSave, onCancel }) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState(1);
  const [modifiers, setModifiers] = useState('');
  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const codeInputRef = useRef(null);
  const descInputRef = useRef(null);
  const codeSuggestionsRef = useRef(null);
  const descSuggestionsRef = useRef(null);

  // Handle clicks outside suggestions
  useEffect(() => {
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

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setCode(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.trim()) {
      const filtered = mockCptData.filter(item => 
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
      const filtered = mockCptData.filter(item => 
        item.description.toLowerCase().includes(value.toLowerCase())
      );
      setDescriptionSuggestions(filtered);
      setShowDescriptionSuggestions(true);
    } else {
      setDescriptionSuggestions([]);
      setShowDescriptionSuggestions(false);
    }
  };

  const handleKeyDown = (e, suggestions, setShowSuggestions, type) => {
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
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex], type);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSuggestionSelect = (item, type) => {
    setCode(item.code);
    setDescription(item.description);
    setUnit(item.unit);
    setModifiers(item.modifiers);
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
      onSave({ 
        code: code.trim(), 
        description: description.trim(),
        unit,
        modifiers: modifiers.trim()
      });
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="cpt-code">CPT Code</label>
          <div className={styles.inputWrapper} ref={codeSuggestionsRef}>
            <input
              id="cpt-code"
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyDown={(e) => handleKeyDown(e, codeSuggestions, setShowCodeSuggestions, 'code')}
              placeholder="Enter CPT code"
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
          <label htmlFor="cpt-description">Description</label>
          <div className={styles.inputWrapper} ref={descSuggestionsRef}>
            <input
              id="cpt-description"
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

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="cpt-unit">Unit</label>
            <input
              id="cpt-unit"
              type="number"
              min="1"
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cpt-modifiers">Modifiers</label>
            <input
              id="cpt-modifiers"
              type="text"
              value={modifiers}
              onChange={(e) => setModifiers(e.target.value)}
              placeholder="e.g., 25, 59"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!code.trim() || !description.trim()}
          >
            Add CPT Code
          </button>
        </div>
      </form>
    </div>
  );
};

export default CptCodeInput; 