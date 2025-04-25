// /src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Assuming this imports global.scss with font
import App from './App';

// --- Dynamically Create Portal Roots ---
function createPortalRoot(id) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement('div');
    element.id = id;
    document.body.appendChild(element); // Append it directly to the body
    console.log(`Portal root #${id} created.`);
  }
  return element;
}
createPortalRoot('modal-root');
createPortalRoot('panel-root');
createPortalRoot('popover-root');
createPortalRoot('tooltip-root');

// --- Render React App ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Fatal Error: Root element with ID 'root' was not found in the DOM.");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}