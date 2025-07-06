# relapse_prediction.py
from sklearn.ensemble import RandomForestClassifier
from joblib import dump, load
import pandas as pd

class RelapsePredictor:
    def __init__(self, model_path='relapse_model.joblib'):
        try:
            self.model = load(model_path)
        except:
            self.model = RandomForestClassifier(n_estimators=100)
        
    def train(self, X, y):
        self.model.fit(X, y)
        dump(self.model, 'relapse_model.joblib')
        
    def predict(self, patient_data):
        features = self._extract_features(patient_data)
        return self.model.predict_proba([features])[0][1]  # Return relapse probability
        
    def _extract_features(self, data):
        # Feature engineering from patient logs
        return [
            data['avg_cravings_7d'],
            data['max_stress_7d'],
            data['trigger_proximity'],
            data['days_sober']
        ]
