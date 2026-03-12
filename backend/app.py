from flask import Flask
from flask_cors import CORS
import os

from routes.sensor_routes import sensor_bp
from routes.auth_routes import auth_bp
from routes.reward_routes import admin_bp, reward_bp
from routes.global_routes import global_bp

app = Flask(__name__)

# Enable CORS
CORS(app)

# Register routes
app.register_blueprint(sensor_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(reward_bp, url_prefix="/api/rewards")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(global_bp, url_prefix="/api")


@app.route("/")
def home():
    return {"message": "GreenPulse Backend Running!"}


# Run server (works locally and on Render)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render provides PORT automatically
    app.run(host="0.0.0.0", port=port, debug=True)