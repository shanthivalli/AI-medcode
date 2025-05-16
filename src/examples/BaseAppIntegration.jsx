// Example of how the base app would integrate the CodingModule component
import React, { useState, useEffect } from 'react';
import CodingModule from '../components/CodingModule/CodingModule';

function BaseAppIntegration() {
  // State to hold the data from the base app
  const [baseAppData, setBaseAppData] = useState({
    encounterDetails: null,
    providerCptCodes: [],
    providerIcdCodes: []
  });

  // Simulating data fetch from base app's backend
  useEffect(() => {
    // This would be replaced with actual API call to base app's backend
    const fetchBaseAppData = async () => {
      try {
        // Example API call to base app's backend
        const response = await fetch('/api/base-app/encounter/current');
        const data = await response.json();
        
        // Transform the data to match our expected structure
        const transformedData = {
          encounterDetails: {
            encounterNumber: data.encounterId,
            accountNumber: data.patientAccountNumber,
            insurance: data.insuranceInfo,
            provider: data.providerName,
            status: data.encounterStatus,
            dateOfService: data.serviceDate,
            chartText: data.medicalNotes
          },
          providerCptCodes: data.cptCodes.map(code => ({
            code: code.code,
            modifiers: code.modifiers || [],
            units: code.units || 1,
            description: code.description,
            rationale: code.rationale
          })),
          providerIcdCodes: data.icdCodes.map(code => ({
            code: code.code,
            description: code.description,
            rationale: code.rationale
          }))
        };

        setBaseAppData(transformedData);
      } catch (error) {
        console.error('Error fetching base app data:', error);
      }
    };

    fetchBaseAppData();
  }, []);

  // Handler for when codes are submitted
  const handleSubmit = (submissionData) => {
    // Transform the data back to base app's format
    const baseAppSubmission = {
      encounterId: submissionData.encounterDetails.encounterNumber,
      cptCodes: submissionData.cptCodes.map(code => ({
        code: code.code,
        modifiers: code.modifiers,
        units: code.units,
        description: code.description,
        rationale: code.rationale
      })),
      icdCodes: submissionData.icdCodes.map(code => ({
        code: code.code,
        description: code.description,
        rationale: code.rationale
      })),
      removedCodeIds: submissionData.removedCodeIds,
      codeLinks: submissionData.codeLinks,
      chartText: submissionData.chartText
    };

    // Send data back to base app's backend
    fetch('/api/base-app/encounter/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(baseAppSubmission)
    });
  };

  // Handler for when codes are submitted with flag
  const handleSubmitWithFlag = (submissionData) => {
    const baseAppSubmission = {
      ...submissionData,
      flagged: true
    };
    
    // Send flagged data back to base app's backend
    fetch('/api/base-app/encounter/update-flagged', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(baseAppSubmission)
    });
  };

  // Show loading state while data is being fetched
  if (!baseAppData.encounterDetails) {
    return <div>Loading encounter data...</div>;
  }

  return (
    <div className="base-app-container">
      <CodingModule
        encounterDetails={baseAppData.encounterDetails}
        providerCptCodes={baseAppData.providerCptCodes}
        providerIcdCodes={baseAppData.providerIcdCodes}
        onSubmit={handleSubmit}
        onSubmitWithFlag={handleSubmitWithFlag}
      />
    </div>
  );
}

export default BaseAppIntegration; 