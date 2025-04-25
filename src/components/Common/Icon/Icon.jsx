// /src/components/Common/Icon/Icon.jsx
import React from 'react';
import {
    FiMenu, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiEdit, FiTrash2, FiPlus, FiLink, FiExternalLink,
    FiSearch, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiMoreVertical, FiMoreHorizontal,
    FiEye, FiEyeOff, FiSettings, FiFilter, FiBell, FiFlag, FiSend, FiClipboard, FiActivity, FiHelpCircle,
    FiLogIn, FiList, FiBarChart2, FiHeart, FiPaperclip, FiDatabase, FiCode, FiRefreshCw,
    FiLayers, FiEdit3, FiMaximize, FiMinimize // Ensure maximize/minimize are here
} from 'react-icons/fi';
import { MdErrorOutline, MdOutlineMedicalServices } from 'react-icons/md';

const iconMap = {
    menu: FiMenu, close: FiX, info: FiInfo, warning: FiAlertTriangle, error: MdErrorOutline, success: FiCheckCircle,
    edit: FiEdit, delete: FiTrash2, add: FiPlus, link: FiLink, unlink: FiPaperclip, search: FiSearch,
    'chevron-down': FiChevronDown, 'chevron-up': FiChevronUp, 'chevron-left': FiChevronLeft, 'chevron-right': FiChevronRight,
    'more-vert': FiMoreVertical, 'more-horiz': FiMoreHorizontal, visibility: FiEye, 'visibility-off': FiEyeOff,
    settings: FiSettings, filter: FiFilter, bell: FiBell, flag: FiFlag, send: FiSend, externalLink: FiExternalLink,
    maximize: FiMaximize, minimize: FiMinimize, // Mapped icons
    code: FiCode, clipboard: FiClipboard, ai: FiActivity, sync: FiRefreshCw, list: FiList, chart: FiBarChart2,
    medical: MdOutlineMedicalServices, help: FiHelpCircle, layers: FiLayers, 'edit-3': FiEdit3,
};

const Icon = ({ name, size = '1em', className = '', 'aria-hidden': ariaHidden = true, title, ...props }) => {
    const IconComponent = iconMap[name] || iconMap['help'];
    if (!IconComponent) { console.warn(`Icon "${name}" not found.`); return null; }
    const effectiveAriaHidden = title ? false : ariaHidden;
    return ( <IconComponent size={size} className={className} aria-hidden={effectiveAriaHidden} title={title} {...props} /> );
};
export default Icon;