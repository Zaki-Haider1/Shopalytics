from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("../.env"):
    load_dotenv("../.env")
else:
    # If no .env found, we assume vars are already in the environment (e.g. via Docker)
    pass

from routes.auth import auth_routes
from routes.admin import admin_routes
from routes.store import store_routes

app = Flask(__name__)
CORS(app)

# register routes
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(admin_routes, url_prefix="/api/admin")
app.register_blueprint(store_routes, url_prefix="/api/store")

@app.route("/")
def index():
    return {
        "message": "Shopalytics Backend API is running",
        "frontend_url": "http://localhost:3000",
        "status": "online"
    }

@app.route("/ping")
def ping():
    return "server working"

if __name__ == "__main__":
    print(app.url_map)
    app.run(debug=True, host="0.0.0.0")