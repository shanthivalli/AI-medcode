import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import styles from './CodeInput.module.scss';

const CPTCodeInput = ({ onSelect, value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await api.searchCptCodes(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching CPT suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.codeInputContainer}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search CPT code..."
        className={styles.codeInput}
      />
      {isLoading && <div className={styles.loading}>Loading...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          className={styles.suggestionsList}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.code}
              className={`${styles.suggestionItem} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className={styles.code}>{suggestion.code}</span>
              <span className={styles.description}>
                {suggestion.description}
              </span>
              {suggestion.modifiers && suggestion.modifiers.length > 0 && (
                <span className={styles.modifiers}>
                  Modifiers: {suggestion.modifiers.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CPTCodeInput; 