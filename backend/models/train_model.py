import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle

df = pd.read_csv("GreenPulse_ADC_Based_CO2_Dataset.csv")

X = df[["Temperature_C", "Humidity_%", "IR_ADC"]]
y = df["CO2_ppm"]

model = LinearRegression()
model.fit(X, y)

print("Model trained successfully")

pickle.dump(model, open("co2_model.pkl", "wb"))
print("Model saved as co2_model.pkl")