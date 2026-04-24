from pymongo import MongoClient
import mysql.connector
from datetime import datetime

# Connect to MongoDB (via mongos router)
mongo_client = MongoClient("mongodb://localhost:27017")
mongo_db = mongo_client["ecommerce"]

# Connect to MySQL
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="12345",  # change this
    database="ecommerce_warehouse"
)
mysql_cursor = mysql_conn.cursor(buffered=True)

print("Connected to both databases!")

'''
# ─── Step 1: Load Regions ────────────────────────────────────────
print("Loading regions...")

regions = ["Punjab", "Sindh", "KPK"]

for region in regions:
    mysql_cursor.execute("""
        INSERT IGNORE INTO dim_regions (region_name)
        VALUES (%s)
    """, (region,))

mysql_conn.commit()
print("  Regions done!")
'''


# ─── Step 1: Load Regions ────────────────────────────────────────
print("Loading regions...")

regions = ["Punjab", "Sindh", "KPK"]

# Clear and reload regions fresh every time
mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
mysql_cursor.execute("TRUNCATE TABLE fact_orders")
mysql_cursor.execute("TRUNCATE TABLE dim_customers")
mysql_cursor.execute("TRUNCATE TABLE dim_products")
mysql_cursor.execute("TRUNCATE TABLE dim_date")
mysql_cursor.execute("TRUNCATE TABLE dim_regions")
mysql_cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

for region in regions:
    mysql_cursor.execute("""
        INSERT INTO dim_regions (region_name)
        VALUES (%s)
    """, (region,))

mysql_conn.commit()
print("  Regions done!")

# ─── Step 2: Extract customers from MongoDB, Load into MySQL ─────
print("Loading customers...")

# Extract from MongoDB
customers = mongo_db.customers.find()

for customer in customers:
    # Get the region_id from dim_regions
    mysql_cursor.execute(
        "SELECT region_id FROM dim_regions WHERE region_name = %s",
        (customer["address"]["region"],)
    )
    region_row = mysql_cursor.fetchone()
    region_id = region_row[0] if region_row else None

    # Load into MySQL
    mysql_cursor.execute("""
        INSERT IGNORE INTO dim_customers
        (customer_id, name, email, phone, city, region_id, country)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        customer["_id"],
        customer["name"],
        customer["email"],
        customer["phone"],
        customer["address"]["city"],
        region_id,
        customer["address"]["country"]
    ))

mysql_conn.commit()
print(f"  Customers done!")


# ─── Step 3: Extract products from MongoDB, Load into MySQL ──────
print("Loading products...")

products = mongo_db.products.find()

for product in products:
    mysql_cursor.execute("""
        INSERT IGNORE INTO dim_products
        (product_id, name, category, sub_category, brand, price, supplier_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        product["_id"],
        product["name"],
        product["category"],
        product["sub_category"],
        product["brand"],
        product["price"],
        product["supplier_id"]
    ))

mysql_conn.commit()
print("  Products done!")


# ─── Step 4: Generate date dimension from order dates ────────────
print("Loading dates...")

orders = mongo_db.orders.find()

for order in orders:
    order_date = order["order_date"]
    
    # Generate a unique date_id from the date e.g 20240315
    date_id = int(order_date.strftime("%Y%m%d"))
    
    # Get quarter from month
    quarter = (order_date.month - 1) // 3 + 1

    mysql_cursor.execute("""
        INSERT IGNORE INTO dim_date
        (date_id, full_date, day, month, month_name, quarter, year)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        date_id,
        order_date.date(),
        order_date.day,
        order_date.month,
        order_date.strftime("%B"),  # full month name e.g "March"
        quarter,
        order_date.year
    ))

mysql_conn.commit()
print("  Dates done!")

# ─── Step 5: Extract orders from MongoDB, Load into fact_orders ──
print("Loading orders...")

orders = mongo_db.orders.find()

for order in orders:
    # Get region_id
    mysql_cursor.execute(
        "SELECT region_id FROM dim_regions WHERE region_name = %s",
        (order["region"],)
    )
    region_row = mysql_cursor.fetchone()
    region_id = region_row[0] if region_row else None

    # Get date_id
    date_id = int(order["order_date"].strftime("%Y%m%d"))

    # One row per item in the order
    for item in order["items"]:
        mysql_cursor.execute("""
            INSERT IGNORE INTO fact_orders
            (order_id, customer_id, product_id, region_id, date_id,
            quantity, unit_price, discount, subtotal,
            payment_method, payment_status, order_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            order["_id"],
            order["customer_id"],
            item["product_id"],
            region_id,
            date_id,
            item["quantity"],
            item["unit_price"],
            item["discount"],
            item["subtotal"],
            order["payment"]["method"],
            order["payment"]["status"],
            order["status"]
        ))

mysql_conn.commit()
print("  Orders done!")
print("\n========== ETL Complete! ==========")