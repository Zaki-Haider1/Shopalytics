import os
import mysql.connector
from pymongo import MongoClient
from dotenv import load_dotenv
import subprocess
import sys

load_dotenv(".env")
load_dotenv("../.env")

# CONFIG
# Using 127.0.0.1 for local connection to Docker mapped ports
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
MONGODB_DB = os.getenv("MONGODB_DB", "ecommerce")
MYSQL_CONFIG = {
    "host": "127.0.0.1", # Local connection to Docker
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "12345"),
}
DB_NAME = os.getenv("MYSQL_DB", "ecommerce_warehouse")

def nuke_databases():
    print("Nuking existing databases...")
    
    # Nuke MongoDB
    try:
        m_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        m_client.drop_database(MONGODB_DB)
        print("MongoDB 'ecommerce' dropped.")
    except Exception as e:
        print(f"MongoDB Drop failed: {e}")

    # Nuke MySQL
    try:
        s_conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = s_conn.cursor()
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"MySQL '{DB_NAME}' reset.")
        s_conn.close()
    except Exception as e:
        print(f"MySQL Drop failed: {e}")

def run_script(script_name):
    print(f"Running {script_name}...")
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"SUCCESS: {script_name} finished successfully.")
    else:
        print(f"FAILURE: {script_name} failed!")
        print(result.stderr)
        sys.exit(1)

if __name__ == "__main__":
    print("--- MASTER RESET STARTED ---")
    nuke_databases()
    run_script("warehouse.py")
    run_script("seed.py")
    run_script("etl.py")
    print("\nALL SYSTEMS RESET! Your project is now in a clean, consistent state.")
    print("You can now open the Admin Dashboard and everything will be perfectly synced.")
