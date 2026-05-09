from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env if it exists (mainly for local development)
if os.path.exists("../.env"):
    load_dotenv("../.env")
elif os.path.exists(".env"):
    load_dotenv(".env")

# ─── Connection ─────────────────────────────────────────────
# Connect to mongos router (NOT shards)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGODB_DB = os.getenv("MONGODB_DB", "ecommerce")

client = MongoClient(MONGO_URI)

# Main database (keep consistent everywhere)
db = client[MONGODB_DB]

# ─── Collections ────────────────────────────────────────────

# Users (customers)
users_collection = db["users"]

# Future collections (prepare now so structure stays consistent)
products_collection = db["products"]
orders_collection = db["orders"]
suppliers_collection = db["suppliers"]
reviews_collection = db["reviews"]

# ─── Optional: Helper to get any collection dynamically ─────
def get_collection(name):
    return db[name]