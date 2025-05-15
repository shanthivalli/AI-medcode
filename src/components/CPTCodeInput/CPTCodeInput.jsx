import React, { useState, useEffect, useRef } from 'react';
import { ErrorAlert } from '../Common/ErrorAlert/ErrorAlert';
import { LoadingSpinner } from '../Common/LoadingSpinner/LoadingSpinner';
import { api } from '../../services/api';
import styles from './CPTCodeInput.module.scss';

export const CPTCodeInput = ({ onSelect, onCancel }) => {
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('1');
    const [modifiers, setModifiers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeField, setActiveField] = useState('code'); // 'code' or 'description'
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const results = await api.searchCptCodes(query);
            setSuggestions(results);
            setSelectedIndex(-1);
        } catch (err) {
            setError(err.message);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        const value = e.target.value;
        setCode(value);
        setActiveField('code');
        fetchSuggestions(value);
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        setActiveField('description');
        fetchSuggestions(value);
    };

    const handleUnitChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[1-9][0-9]*$/.test(value)) {
            setUnit(value);
        }
    };

    const handleModifierChange = (e) => {
        const value = e.target.value;
        if (value.length <= 2 && /^[A-Z0-9]*$/.test(value)) {
            setModifiers([value]);
        }
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onCancel();
                break;
            default:
                break;
        }
    };

    const handleSelect = (suggestion) => {
        setCode(suggestion.code);
        setDescription(suggestion.description);
        setSuggestions([]);
        onSelect({
            ...suggestion,
            unit: parseInt(unit) || 1,
            modifiers: modifiers.filter(Boolean),
        });
    };

    return (
        <div className={styles.container}>
            {error && (
                <ErrorAlert
                    error={error}
                    onRetry={() => fetchSuggestions(activeField === 'code' ? code : description)}
                    onDismiss={() => setError(null)}
                />
            )}

            <div className={styles.inputGroup}>
                <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter CPT code"
                    className={styles.input}
                />
                <input
                    type="text"
                    value={description}
                    onChange={handleDescriptionChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter description"
                    className={styles.input}
                />
                <input
                    type="text"
                    value={unit}
                    onChange={handleUnitChange}
                    placeholder="Units"
                    className={styles.unitInput}
                />
                <input
                    type="text"
                    value={modifiers[0] || ''}
                    onChange={handleModifierChange}
                    placeholder="Modifier"
                    className={styles.modifierInput}
                />
            </div>

            {loading ? (
                <LoadingSpinner size="small" />
            ) : suggestions.length > 0 && (
                <ul className={styles.suggestions}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.code}
                            className={`${styles.suggestion} ${
                                index === selectedIndex ? styles.selected : ''
                            }`}
                            onClick={() => handleSelect(suggestion)}
                        >
                            <span className={styles.code}>{suggestion.code}</span>
                            <span className={styles.description}>
                                {suggestion.description}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}; 