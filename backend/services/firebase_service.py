import firebase_admin
from firebase_admin import credentials, db
import os
import json
from config import FIREBASE_DB_URL

firebase_enabled = True

try:
    if not firebase_admin._apps:

        # Try getting Firebase key from environment variable (Render)
        firebase_key = os.getenv("FIREBASE_KEY")

        if firebase_key:
            # Load Firebase credentials from environment variable
            cred = credentials.Certificate(json.loads(firebase_key))
        else:
            # Load Firebase credentials from local file
            cred = credentials.Certificate("firebase_key.json")

        firebase_admin.initialize_app(cred, {
            "databaseURL": FIREBASE_DB_URL
        })

except Exception as e:
    print("Firebase initialization error:", e)
    firebase_enabled = False


def save_data(temp, humidity, ir_value, co2, reward, timestamp):
    if not firebase_enabled:
        print("Firebase disabled")
        return

    try:
        ref = db.reference("sensor_data")

        ref.push({
            "temperature": temp,
            "humidity": humidity,
            "ir_radiation": ir_value,
            "co2": co2,
            "reward": reward,
            "timestamp": timestamp
        })

    except Exception as e:
        print("Firebase write error:", e)