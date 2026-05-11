from flask import Blueprint, request, jsonify
from db import users_collection
import bcrypt
from datetime import datetime

ADMIN_EMAIL = "admin@shopalytics.com"

auth_routes = Blueprint("auth", __name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.json

    # basic validation
    required_fields = ["name", "email", "password", "phone", "address", "city", "region"]
    for field in required_fields:
        if field not in data or data[field] == "":
            return jsonify({"success": False, "message": f"{field} is required"}), 400

    # check duplicate email
    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"success": False, "message": "Email already exists"}), 400

    # Generate custom ID: cust_XXX
    count = users_collection.count_documents({})
    new_id = f"cust_{count + 1:03d}"

    # create user
    user = {
        "_id": new_id,
        "name": data["name"],
        "email": data["email"],
        "password": hash_password(data["password"]),  # hashed
        "phone": data["phone"],
        "address": data["address"],
        "city": data["city"],
        "region": data["region"],
        "created_at": datetime.utcnow(),
        "last_login": None
    }

    users_collection.insert_one(user)

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "user_id": new_id
    }), 201


@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password required"
        }), 400

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    if not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return jsonify({
            "success": False,
            "message": "Invalid password"
        }), 401

    # Update last_login
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    # Backend driven redirect
    redirect_path = "/admin" if email == ADMIN_EMAIL else "/"

    return jsonify({
        "success": True,
        "message": "Login successful",
        "redirect": redirect_path,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "customer")
        }
    }), 200