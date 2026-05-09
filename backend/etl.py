import mysql.connector
from pymongo import MongoClient
import pandas as pd
from datetime import datetime
import os
from dotenv import load_dotenv

# Load from multiple locations to be safe
load_dotenv(".env")
load_dotenv("../.env")

# ─────────────────────────────
# CONFIG
# ─────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGODB_DB = os.getenv("MONGODB_DB", "ecommerce")

MYSQL_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "12345"),
    "database": os.getenv("MYSQL_DB", "ecommerce_warehouse")
}

# ─────────────────────────────
# CONNECT
# ─────────────────────────────
try:
    mongo_client = MongoClient(MONGO_URI)
    mdb = mongo_client[MONGODB_DB]
    sql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = sql_conn.cursor()
    print("Connected to MongoDB and MySQL")
except Exception as e:
    print(f"Connection Error: {e}")
    exit(1)

# ─────────────────────────────
# EXTRACT
# ─────────────────────────────
def get_df(collection):
    df = pd.DataFrame(list(mdb[collection].find()))
    # Convert NaN to None for MySQL compatibility
    if not df.empty:
        df = df.replace({pd.NA: None, float('nan'): None})
    return df

customers = get_df("customers")
products = get_df("products")
orders = get_df("orders")

# Check if data exists
if customers.empty or products.empty:
    print("Warning: MongoDB collections are empty. Run seed.py first.")
    exit(0)

# ─────────────────────────────
# TRANSFORM & LOAD DIMENSIONS
# ─────────────────────────────

# 1. dim_regions
if "region" in customers.columns:
    regions = customers["region"].unique()
else:
    regions = ["Default"]

for r in regions:
    cursor.execute("INSERT IGNORE INTO dim_regions (region_name) VALUES (%s)", (r,))
sql_conn.commit()

cursor.execute("SELECT region_id, region_name FROM dim_regions")
region_map = {name: rid for (rid, name) in cursor.fetchall()}

# 2. dim_customers
for _, row in customers.iterrows():
    reg_name = row.get("region", "Default")
    cursor.execute("""
        INSERT INTO dim_customers (customer_id, name, email, phone, city, region_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email)
    """, (row["_id"], row["name"], row["email"], row.get("phone", "N/A"), row.get("city", "N/A"), region_map.get(reg_name, 1)))

# 3. dim_products
for _, row in products.iterrows():
    cursor.execute("""
        INSERT INTO dim_products (product_id, name, category, sub_category, brand, price, supplier_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price)
    """, (row["_id"], row["name"], row["category"], row.get("sub_category", ""), row.get("brand", ""), row["price"], row.get("supplier_id", "")))

# 4. dim_date (Generate from orders)
order_dates = pd.to_datetime(orders["order_date"])
for dt in order_dates.unique():
    ts = pd.Timestamp(dt)
    date_id = int(ts.strftime("%Y%m%d"))
    cursor.execute("""
        INSERT IGNORE INTO dim_date (date_id, full_date, day, month, month_name, quarter, year)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (date_id, ts.date(), ts.day, ts.month, ts.strftime("%B"), ts.quarter, ts.year))

sql_conn.commit()

# ─────────────────────────────
# TRANSFORM & LOAD FACT
# ─────────────────────────────
cursor.execute("DELETE FROM fact_orders") # Clear for fresh reload

for _, order in orders.iterrows():
    o_date = pd.to_datetime(order["order_date"])
    date_id = int(o_date.strftime("%Y%m%d"))
    
    # Ensure customer exists in dim_customers (handle Guests)
    customer_id = order["customer_id"]
    cursor.execute("SELECT customer_id FROM dim_customers WHERE customer_id = %s", (customer_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dim_customers (customer_id, name, email, city, region_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (customer_id, "Guest Customer", "guest@example.com", "Unknown", 1))
    
    # Get region_id for this customer
    cust = customers[customers["_id"] == customer_id]
    reg_id = 1 # Default
    if not cust.empty:
        reg_name = cust.iloc[0].get("region", "Default")
        reg_id = region_map.get(reg_name, 1)

    for item in order.get("items", []):
        cursor.execute("""
            INSERT INTO fact_orders (
                order_id, customer_id, product_id, region_id, date_id,
                quantity, unit_price, discount, subtotal, 
                payment_method, payment_status, order_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(order["_id"]), order["customer_id"], item["product_id"], reg_id, date_id,
            item["quantity"], item["unit_price"], item.get("discount", 0), item["subtotal"],
            order.get("payment_method", "cash"), order.get("payment_status", "pending"), order["status"]
        ))

sql_conn.commit()
print("ETL pipeline successfully populated Star Schema")