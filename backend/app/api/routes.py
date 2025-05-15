from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.services.code_service import CodeService

api_bp = Blueprint('api', __name__)
ai_service = AIService()
code_service = CodeService()

@api_bp.route('/suggestions', methods=['POST'])
def get_ai_suggestions():
    """Get AI suggestions for CPT and ICD codes based on chart text"""
    data = request.get_json()
    chart_text = data.get('chartText', '')
    
    if not chart_text:
        return jsonify({'error': 'Chart text is required'}), 400
    
    try:
        suggestions = ai_service.generate_suggestions(chart_text)
        if "error" in suggestions:
            return jsonify({'error': suggestions["error"]}), 500
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/analysis', methods=['POST'])
def get_analysis():
    """Get in-depth analysis of the medical chart"""
    data = request.get_json()
    chart_text = data.get('chartText', '')
    
    if not chart_text:
        return jsonify({'error': 'Chart text is required'}), 400
    
    try:
        analysis = ai_service.generate_analysis(chart_text)
        if "error" in analysis:
            return jsonify({'error': analysis["error"]}), 500
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/icd/search', methods=['GET'])
def search_icd_codes():
    """Search ICD codes based on query"""
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    try:
        results = code_service.search_icd_codes(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/cpt/search', methods=['GET'])
def search_cpt_codes():
    """Search CPT codes based on query"""
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    try:
        results = code_service.search_cpt_codes(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/rationale', methods=['POST'])
def get_rationale():
    """Get coding rationale for selected codes"""
    data = request.get_json()
    cpt_codes = data.get('cptCodes', [])
    icd_codes = data.get('icdCodes', [])
    
    if not cpt_codes and not icd_codes:
        return jsonify({'error': 'At least one code is required'}), 400
    
    try:
        rationale = ai_service.generate_rationale(cpt_codes, icd_codes)
        if "error" in rationale:
            return jsonify({'error': rationale["error"]}), 500
        return jsonify(rationale)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 