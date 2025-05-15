class CodeService:
    def search_icd_codes(self, query):
        """
        Search ICD codes based on query
        Returns a list of matching ICD codes with descriptions
        """
        # TODO: Implement actual database integration
        # For now, return mock data
        mock_icd_codes = [
            {
                'code': 'J45.909',
                'description': 'Unspecified asthma without exacerbation',
                'category': 'Respiratory'
            },
            {
                'code': 'J45.20',
                'description': 'Mild intermittent asthma, uncomplicated',
                'category': 'Respiratory'
            },
            {
                'code': 'I10',
                'description': 'Essential (primary) hypertension',
                'category': 'Cardiovascular'
            },
            {
                'code': 'E11.9',
                'description': 'Type 2 diabetes mellitus without complications',
                'category': 'Endocrine'
            }
        ]
        
        # Simple search implementation
        query = query.lower()
        return [
            code for code in mock_icd_codes
            if query in code['code'].lower() or query in code['description'].lower()
        ]

    def search_cpt_codes(self, query):
        """
        Search CPT codes based on query
        Returns a list of matching CPT codes with descriptions
        """
        # TODO: Implement actual database integration
        # For now, return mock data
        mock_cpt_codes = [
            {
                'code': '99213',
                'description': 'Office visit, est patient, 10-19 min',
                'category': 'Evaluation and Management',
                'modifiers': ['25', '59'],
                'units': '1'
            },
            {
                'code': '99214',
                'description': 'Office visit, est patient, 20-29 min',
                'category': 'Evaluation and Management',
                'modifiers': ['25', '59'],
                'units': '1'
            },
            {
                'code': '96372',
                'description': 'Therapeutic injection, SC/IM',
                'category': 'Medicine',
                'modifiers': ['59'],
                'units': '1'
            },
            {
                'code': '93000',
                'description': 'Electrocardiogram, routine ECG with at least 12 leads',
                'category': 'Cardiovascular',
                'modifiers': [],
                'units': '1'
            }
        ]
        
        # Simple search implementation
        query = query.lower()
        return [
            code for code in mock_cpt_codes
            if query in code['code'].lower() or query in code['description'].lower()
        ] 