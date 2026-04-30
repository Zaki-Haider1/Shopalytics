from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

from routes.auth import auth_routes
from routes.admin import admin_routes

app = Flask(__name__)
CORS(app)

# register routes
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(admin_routes, url_prefix="/api/admin")

@app.route("/ping")
def ping():
    return "server working"

if __name__ == "__main__":
    print(app.url_map)
    app.run(debug=True)