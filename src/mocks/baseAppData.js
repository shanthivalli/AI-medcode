// Mock data structure that the base app should provide
export const mockBaseAppData = {
    // Encounter details from the base app
    encounterDetails: {
      encounterNumber: "ENC123456",
      accountNumber: "ACC789012",
      insurance: "Blue Cross Blue Shield",
      provider: "Dr. John Smith",
      status: "Active",
      dateOfService: "2024-03-15",
      chartText: "Patient presents with acute upper respiratory symptoms. Temperature 101.2°F. Complains of sore throat and cough. No recent travel. No known COVID-19 exposure. Physical exam reveals pharyngeal erythema and bilateral cervical lymphadenopathy. Rapid strep test negative. Diagnosed with acute pharyngitis. Prescribed amoxicillin 500mg TID for 10 days. Follow-up in 1 week if symptoms persist."
    },
  
    // Provider's CPT codes from the base app
    providerCptCodes: [
      {
        code: "99213",
        modifiers: ["25"],
        units: 1,
        description: "Office or other outpatient visit for the evaluation and management of an established patient",
        rationale: "Level 3 visit for established patient with moderate complexity"
      },
      {
        code: "87880",
        modifiers: [],
        units: 1,
        description: "Infectious agent antigen detection by immunoassay with direct optical observation",
        rationale: "Rapid strep test performed"
      }
    ],
  
    // Provider's ICD codes from the base app
    providerIcdCodes: [
      {
        code: "J02.9",
        description: "Acute pharyngitis, unspecified",
        rationale: "Patient presents with sore throat and pharyngeal erythema"
      },
      {
        code: "R50.9",
        description: "Fever, unspecified",
        rationale: "Patient has elevated temperature of 101.2°F"
      }
    ]
  };
  
  // Example of how to use the mock data in the CodingModule component
  export const exampleUsage = `
  import { mockBaseAppData } from './mocks/baseAppData';
  import CodingModule from './components/CodingModule/CodingModule';
  
  function App() {
    return (
      <CodingModule
        encounterDetails={mockBaseAppData.encounterDetails}
        providerCptCodes={mockBaseAppData.providerCptCodes}
        providerIcdCodes={mockBaseAppData.providerIcdCodes}
        onSubmit={(data) => {
          console.log('Submitted data:', data);
          // Handle submission
        }}
        onSubmitWithFlag={(data) => {
          console.log('Submitted data with flag:', data);
          // Handle flagged submission
        }}
      />
    );
  }
  `;
  