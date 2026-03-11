import os
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "models", "co2_model.pkl")
)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

def predict_co2(temp, humidity, ir_adc):
    features = np.array([[temp, humidity, ir_adc]])
    prediction = model.predict(features)
    return float(prediction[0])
