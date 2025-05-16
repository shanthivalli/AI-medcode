const API_BASE_URL = 'http://localhost:5000/api';
const BASE_APP_API_URL = process.env.REACT_APP_BASE_APP_API_URL || 'http://localhost:3000/api/base-app';

export const api = {
    // Get AI suggestions for CPT and ICD codes
    getSuggestions: async (chartText) => {
        const response = await fetch(`${API_BASE_URL}/suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chartText }),
        });
        if (!response.ok) {
            throw new Error('Failed to get suggestions');
        }
        return response.json();
    },

    // Get in-depth analysis
    getAnalysis: async (chartText) => {
        const response = await fetch(`${API_BASE_URL}/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chartText }),
        });
        if (!response.ok) {
            throw new Error('Failed to get analysis');
        }
        return response.json();
    },

    // Search ICD codes
    searchIcdCodes: async (query) => {
        const response = await fetch(`${API_BASE_URL}/icd/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search ICD codes');
        }
        return response.json();
    },

    // Search CPT codes
    searchCptCodes: async (query) => {
        const response = await fetch(`${API_BASE_URL}/cpt/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search CPT codes');
        }
        return response.json();
    },

    // Get coding rationale
    getRationale: async (cptCodes, icdCodes) => {
        const response = await fetch(`${API_BASE_URL}/rationale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cptCodes, icdCodes }),
        });
        if (!response.ok) {
            throw new Error('Failed to get rationale');
        }
        return response.json();
    },

    // Send updated codes to base app
    updateEncounterCodes: async (encounterId, codes) => {
        const response = await fetch(`${BASE_APP_API_URL}/encounter/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                encounterId,
                codes: {
                    cptCodes: codes.cptCodes,
                    icdCodes: codes.icdCodes
                },
                isFlagged: codes.isFlagged || false
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to update encounter codes');
        }
        return response.json();
    },
}; 