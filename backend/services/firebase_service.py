import firebase_admin
from firebase_admin import credentials, db
from config import FIREBASE_CREDENTIAL, FIREBASE_DB_URL

firebase_enabled = True

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIAL)
        firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DB_URL})
except Exception:
    firebase_enabled = False

def save_data(temp, humidity, ir_value, co2, reward, timestamp):
    if not firebase_enabled:
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
    except Exception:
        # Keep API responsive even if Firebase write fails.
        return
