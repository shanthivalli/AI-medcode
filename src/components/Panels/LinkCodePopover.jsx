import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    useFloating,
    useDismiss,
    useRole,
    useInteractions,
    useClick, // Optional: Use if popover opens on click instead of hover/focus state managed elsewhere
    offset, // Position middleware
    flip, // Edge collision middleware
    shift, // Edge collision middleware
    autoUpdate, // Keep position updated on scroll/resize
    FloatingFocusManager, // Trap focus inside
    FloatingPortal // Use Floating UI's portal
} from '@floating-ui/react';

import Button from '../Common/Button/Button';
import Icon from '../Common/Icon/Icon';
import Chip from '../Common/Chip/Chip';
import styles from './LinkCodePopover.module.scss';

// Note: No need for our custom PopoverPortal anymore, use FloatingPortal

const LinkCodePopover = ({
    isOpen,
    onClose,
    anchorElement, // The element the popover should anchor to (e.g., the link button)
    cptCode, // The CPT code being linked
    availableIcds = [], // All ICDs (AI + Manual) available for linking
    linkedIcds = [], // Array of ICD IDs already linked to this CPT
    onLinkUpdate, // Function called with (cptId, newLinkedIcdIds)
}) => {
    const [selectedIcds, setSelectedIcds] = useState(new Set(linkedIcds));

    // --- Floating UI Setup ---
    const { refs, floatingStyles, context } = useFloating({
        elements: {
             reference: anchorElement, // Use the passed anchorElement directly
        },
        open: isOpen,
        onOpenChange: (open) => {
            if (!open) {
                onClose(); // Sync state if Floating UI closes it
            }
        },
        // Keep position updated automatically
        whileElementsMounted: autoUpdate,
        // Positioning strategy and middleware
        placement: 'bottom-start', // Preferred placement
        strategy: 'absolute', // Use absolute positioning
        middleware: [
            offset(8), // Offset popover 8px away from anchor
            flip({ // Flip placement if not enough space
                fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                padding: 10, // Add padding from viewport edges
            }),
            shift({ padding: 10 }), // Shift along axis to prevent overflow
        ],
    });

    // --- Interaction Hooks ---
    // Hook to handle dismissal (clicking outside, Escape key)
    const dismiss = useDismiss(context);
    // Hook to assign ARIA roles
    const role = useRole(context, { role: 'dialog' }); // Use 'dialog' role

    // Combine interaction hooks
    const { getReferenceProps, getFloatingProps } = useInteractions([
        dismiss,
        role,
        // Add useClick(context) here if the anchorElement itself should trigger the popover on click
    ]);

    // --- State & Logic ---
    // Reset selected ICDs when the target CPT code changes while it's open, or when opened
    useEffect(() => {
        if(isOpen) {
            setSelectedIcds(new Set(linkedIcds));
        }
    }, [isOpen, linkedIcds, cptCode]); // Depend on cptCode to reset if target changes

    const handleIcdToggle = (icdId) => {
        setSelectedIcds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(icdId)) {
                newSet.delete(icdId);
            } else {
                newSet.add(icdId);
            }
            return newSet;
        });
    };

    const handleSaveLinks = () => {
        if (cptCode) { // Ensure cptCode is available
           onLinkUpdate(cptCode.id, Array.from(selectedIcds));
        }
        onClose();
    };

    // Render nothing if not open or no anchor/cptCode
    if (!isOpen || !anchorElement || !cptCode) return null;

    return (
        // Use FloatingPortal for better stacking context management
        <FloatingPortal id="popover-root">
            {/* FloatingFocusManager traps focus inside the popover */}
            <FloatingFocusManager context={context} modal={true}>
                <div
                    ref={refs.setFloating} // Assign ref to the floating element
                    style={floatingStyles} // Apply calculated styles
                    className={styles.popover}
                    aria-labelledby="popover-header" // Labelled by header
                    {...getFloatingProps()} // Apply interaction props
                >
                    <div id="popover-header" className={styles.popoverHeader}>
                        Link ICDs to {cptCode.code}
                        <Button iconOnly variant="text" size="small" onClick={onClose} ariaLabel="Close Linking">
                            <Icon name="close" />
                        </Button>
                    </div>
                    <div className={`${styles.popoverContent} scrollable-panel`}>
                        <p className={styles.instruction}>Select applicable ICD codes:</p>
                        {availableIcds.length === 0 && <p>No ICD codes available.</p>}
                        <ul className={styles.icdList}>
                            {availableIcds.map(icd => (
                                <li key={icd.id}>
                                    <label className={styles.icdLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIcds.has(icd.id)}
                                            onChange={() => handleIcdToggle(icd.id)}
                                            className={styles.checkbox}
                                            aria-labelledby={`icd-chip-${icd.id}`} // Associate checkbox with chip label
                                        />
                                         {/* The Chip now acts as the visible label */}
                                        <Chip
                                            id={`icd-chip-${icd.id}`} // ID for association
                                            label={`${icd.code} - ${icd.description.substring(0, 30)}...`}
                                            size="small"
                                            color={selectedIcds.has(icd.id) ? 'primary' : 'secondary'}
                                            variant={selectedIcds.has(icd.id) ? 'filled' : 'outlined'}
                                            className={styles.icdChip}
                                            title={`${icd.code} - ${icd.description}`} // Full description on hover
                                        />
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.popoverFooter}>
                        <Button variant="light" size="small" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="small" onClick={handleSaveLinks}>
                            Save Links
                        </Button>
                    </div>
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
};

export default LinkCodePopover;