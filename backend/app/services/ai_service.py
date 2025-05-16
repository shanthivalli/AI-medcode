import os
import json
import re
from typing import List, Dict, Any
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# --- Constants for Prompt File Paths ---
PROMPT_DIR = os.path.join(os.path.dirname(__file__), '..', 'prompts')
CONFIDENT_CODES_PROMPT_FILE = os.path.join(PROMPT_DIR, 'confident_codes.txt')
SECTIONAL_ANALYSIS_PROMPT_FILE = os.path.join(PROMPT_DIR, 'sectional_analysis.txt')
CODING_ALERTS_PROMPT_FILE = os.path.join(PROMPT_DIR, 'coding_alerts.txt')

# --- Define schemas ---
class AnalysisSubSection(BaseModel):
    text_mention: str
    related_codes: List[str] = Field(default_factory=list)
    rationale: str
    source_snippet: str

class SectionalAnalysis(BaseModel):
    diagnoses: List[AnalysisSubSection] = Field(default_factory=list)
    symptoms: List[AnalysisSubSection] = Field(default_factory=list)
    medications: List[AnalysisSubSection] = Field(default_factory=list)
    procedures: List[AnalysisSubSection] = Field(default_factory=list)

class ConfidentICD(BaseModel):
    code: str
    rationale: str

class ConfidentCPT(BaseModel):
    code: str
    modifiers: List[str] = Field(default_factory=list)
    units: str
    rationale: str

class ConfidentCode(BaseModel):
    suggestedIcd: List[ConfidentICD] = Field(default_factory=list)
    suggestedCpt: List[ConfidentCPT] = Field(default_factory=list)

class Alert(BaseModel):
    alerts: List[str] = Field(default_factory=list)

class AIService:
    def __init__(self):
        self.genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self._load_prompt_templates()

    def _load_prompt_templates(self):
        """Load prompt templates from files."""
        def load_template(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                print(f"Error loading prompt template {filepath}: {e}")
                return None

        self.confident_codes_template = load_template(CONFIDENT_CODES_PROMPT_FILE)
        self.sectional_analysis_template = load_template(SECTIONAL_ANALYSIS_PROMPT_FILE)
        self.coding_alerts_template = load_template(CODING_ALERTS_PROMPT_FILE)

    def _clean_json_string(self, text: str) -> str:
        """Extract JSON block from Gemini response."""
        try:
            # First try to find a complete JSON block
            match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
            if match:
                return match.group(1)

            # If no complete block found, try to find the largest valid JSON object
            first_brace = text.find('{')
            if first_brace == -1:
                return text.strip()

            # Find all complete JSON objects
            json_objects = []
            stack = []
            start = first_brace
            
            for i, char in enumerate(text[first_brace:], first_brace):
                if char == '{':
                    stack.append(i)
                elif char == '}':
                    if stack:
                        start = stack.pop()
                        if not stack:  # We found a complete object
                            json_objects.append(text[start:i+1])
            
            if json_objects:
                # Return the largest complete JSON object
                return max(json_objects, key=len)

            # If no complete objects found, try to fix common issues
            text = text.strip()
            
            # Fix incomplete arrays
            if text.count('[') > text.count(']'):
                text += ']'
            
            # Fix incomplete objects
            if text.count('{') > text.count('}'):
                text += '}'
            
            # Fix trailing commas
            text = re.sub(r',\s*([}\]])', r'\1', text)
            
            # Fix incomplete strings
            text = re.sub(r'([^\\])"([^"]*?)(?=\s*[}\]])', r'\1"\2"', text)
            
            # Fix missing quotes around property names
            text = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)
            
            return text

        except Exception as e:
            print(f"Error cleaning JSON string: {str(e)}")
            return text.strip()

    def _call_gemini(self, prompt_type: str, prompt_text: str, response_schema=None) -> Dict[str, Any]:
        """Make call to Gemini API."""
        try:
            print(f"Making Gemini API call for {prompt_type}")
            print(f"Using model: gemini-2.5-pro-preview-03-25")
            print(f"Prompt text: {prompt_text[:200]}...")  # Print first 200 chars of prompt
            
            response = self.genai_client.models.generate_content(
                model="gemini-2.5-pro-preview-03-25",
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    max_output_tokens=10000,
                    top_k=32,
                    top_p=1,
                    temperature=0.4,
                    response_mime_type='application/json',
                    response_schema=response_schema,
                    safety_settings=[
                        types.SafetySetting(
                            category="HARM_CATEGORY_HATE_SPEECH",
                            threshold="BLOCK_MEDIUM_AND_ABOVE"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold="BLOCK_MEDIUM_AND_ABOVE"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_HARASSMENT",
                            threshold="BLOCK_MEDIUM_AND_ABOVE"
                        ),
                        types.SafetySetting(
                            category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold="BLOCK_MEDIUM_AND_ABOVE"
                        ),
                    ]
                )
            )
            print(f"Raw Gemini response: {response.text}")
            cleaned_text = self._clean_json_string(response.text)
            print(f"Cleaned JSON text: {cleaned_text}")
            
            try:
                result = json.loads(cleaned_text)
                print(f"Parsed JSON result: {result}")
                return result
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")
                # Try to extract partial results if possible
                if '"suggestedIcd"' in cleaned_text and '"suggestedCpt"' in cleaned_text:
                    # Extract the last complete object before the error
                    last_complete = cleaned_text.rfind('},')
                    if last_complete != -1:
                        cleaned_text = cleaned_text[:last_complete+1] + ']}'
                        try:
                            result = json.loads(cleaned_text)
                            print(f"Recovered partial result: {result}")
                            return result
                        except:
                            pass
                return {"error": f"Failed to parse JSON response: {str(e)}"}
                
        except Exception as e:
            print(f"Error in Gemini call ({prompt_type}): {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {"error": str(e)}

    def generate_suggestions(self, chart_text: str) -> Dict[str, Any]:
        """Generate CPT and ICD code suggestions based on chart text."""
        print(f"Starting generate_suggestions with chart text: {chart_text[:200]}...")
        
        if not self.confident_codes_template:
            print("Error: confident_codes_template is None")
            return {"error": "Prompt template not loaded"}
            
        try:
            prompt = self.confident_codes_template.format(emr_text=chart_text)
            print(f"Formatted prompt: {prompt[:200]}...")
            
            result = self._call_gemini("Confident Codes", prompt, ConfidentCode)
            print(f"Raw result from Gemini: {result}")
            
            if "error" in result:
                print(f"Error in result: {result['error']}")
                return {"error": result["error"]}

            # Transform the result to match the expected format
            transformed_result = {
                'cptCodes': [
                    {
                        'id': f'cpt-ai-{i+1}',
                        'code': cpt['code'],
                        'description': '',  # Would need to be populated from a code database
                        'unit': cpt['units'],
                        'modifiers': ','.join(cpt['modifiers']),
                        'rationale': cpt['rationale'],
                        'relatedLink': '#',
                        'aapcGuidance': 'Verify documentation'
                    }
                    for i, cpt in enumerate(result.get('suggestedCpt', []))
                ],
                'icdCodes': [
                    {
                        'id': f'icd-ai-{i+1}',
                        'code': icd['code'],
                        'description': '',  # Would need to be populated from a code database
                        'rationale': icd['rationale'],
                        'relatedSeriesCodes': []
                    }
                    for i, icd in enumerate(result.get('suggestedIcd', []))
                ]
            }
            print(f"Transformed result: {transformed_result}")
            return transformed_result
            
        except Exception as e:
            print(f"Error in generate_suggestions: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {"error": str(e)}

    def generate_alerts(self, chart_text: str) -> List[str]:
        """Generate coding alerts based on chart text."""
        prompt = self.coding_alerts_template.format(emr_text=chart_text)
        result = self._call_gemini("Alerts", prompt, Alert)
        return result.get('alerts', []) if "error" not in result else []

    def generate_analysis(self, chart_text: str) -> Dict[str, Any]:
        """Generate in-depth analysis of the medical chart."""
        try:
            prompt = self.sectional_analysis_template.format(emr_text=chart_text)
            result = self._call_gemini("Analysis", prompt, SectionalAnalysis)
            
            if "error" in result:
                print(f"Error in analysis result: {result['error']}")
                return {"error": result["error"]}

            # Ensure we have a valid result structure
            if not isinstance(result, dict):
                print(f"Invalid result type: {type(result)}")
                return {"error": "Invalid response format"}

            # Initialize default structure
            analysis = {
                'symptoms': [],
                'diagnoses': [],
                'medications': [],
                'procedures': []
            }

            # Safely extract and transform each section
            for section in ['symptoms', 'diagnoses', 'medications', 'procedures']:
                items = result.get(section, [])
                if not isinstance(items, list):
                    print(f"Invalid {section} format: {type(items)}")
                    continue

                for item in items:
                    try:
                        if section in ['symptoms', 'medications']:
                            analysis[section].append({
                                'description': item.get('text_mention', ''),
                                'rationale': item.get('rationale', ''),
                                'code': item.get('related_codes', [''])[0] if item.get('related_codes') else None
                            })
                        else:  # diagnoses and procedures
                            analysis[section].append({
                                'code': item.get('related_codes', [''])[0] if item.get('related_codes') else None,
                                'description': item.get('text_mention', ''),
                                'rationale': item.get('rationale', '')
                            })
                    except Exception as e:
                        print(f"Error processing {section} item: {str(e)}")
                        continue

            return analysis

        except Exception as e:
            print(f"Error in generate_analysis: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {"error": str(e)}

    def generate_rationale(self, cpt_codes: List[Dict], icd_codes: List[Dict]) -> Dict[str, Any]:
        """Generate coding rationale for selected codes."""
        # Create a prompt for rationale generation
        prompt = f"""Analyze the following selected codes and provide a comprehensive coding rationale:

CPT Codes:
{json.dumps(cpt_codes, indent=2)}

ICD Codes:
{json.dumps(icd_codes, indent=2)}

Please provide your analysis in the following JSON format:
{{
    "overallRationale": "Overall explanation of code selection",
    "codeRationales": {{
        "cpt": {{
            "code": "Rationale for this code"
        }},
        "icd": {{
            "code": "Rationale for this code"
        }}
    }}
}}"""

        result = self._call_gemini("Rationale", prompt)
        
        if "error" in result:
            return {
                'overallRationale': 'Error generating rationale',
                'codeRationales': {
                    'cpt': {code['code']: 'Error' for code in cpt_codes},
                    'icd': {code['code']: 'Error' for code in icd_codes}
                }
            }

        return {
            'overallRationale': result.get('overallRationale', 'No overall rationale provided'),
            'codeRationales': {
                'cpt': result.get('codeRationales', {}).get('cpt', {}),
                'icd': result.get('codeRationales', {}).get('icd', {})
            }
        } 