// /src/components/Common/Tooltip/Tooltip.jsx
import React, { useState, cloneElement, isValidElement, Children, useRef } from 'react';
import { useFloating, useHover, useFocus, useDismiss, useRole, useInteractions, safePolygon, offset, flip, shift, autoUpdate, FloatingPortal, FloatingArrow, arrow } from '@floating-ui/react';
import styles from './Tooltip.module.scss';

const Tooltip = ({ children, content, position = 'top', className = '', tooltipClassName = '', disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);
    const { x, y, strategy, refs, context, middlewareData } = useFloating({ open: isOpen, onOpenChange: setIsOpen, placement: position, whileElementsMounted: autoUpdate, middleware: [ offset(6), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowRef }), ], });
    const hover = useHover(context, { move: false, handleClose: safePolygon(), enabled: !disabled });
    const focus = useFocus(context, { enabled: !disabled });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'tooltip' });
    const { getReferenceProps, getFloatingProps } = useInteractions([ hover, focus, dismiss, role ]);

    let trigger = null; let targetChild = null;
    Children.forEach(children, (child) => { if (isValidElement(child) && !targetChild) { targetChild = child; } });
    if (targetChild) { trigger = cloneElement( targetChild, getReferenceProps({ ref: refs.setReference, ...targetChild.props, 'aria-describedby': isOpen ? context.floatingId : undefined, }) ); }
    else if (children != null && children !== false) { console.warn("Tooltip children not single valid element. Wrapping in span."); trigger = ( <span {...getReferenceProps({ ref: refs.setReference })} className={className}> {children} </span> ); }
    else { console.warn("Tooltip received no valid children."); return null; }

    if (disabled || !content) { return <>{trigger}</>; }
    return ( <> {trigger} <FloatingPortal id="tooltip-root"> {isOpen && ( <div ref={refs.setFloating} style={{ position: strategy, top: y ?? 0, left: x ?? 0 }} className={`${styles.tooltipContent} ${tooltipClassName}`} id={context.floatingId} {...getFloatingProps()} > <FloatingArrow ref={arrowRef} context={context} fill="rgba(52, 73, 94, 0.9)" className={styles.tooltipArrow} height={5} width={10} /> {content} </div> )} </FloatingPortal> </> );
};
export default Tooltip;