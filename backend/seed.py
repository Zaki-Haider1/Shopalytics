"""
seed.py — Populate MongoDB with rich e-commerce + analytics-ready data

Run after MongoDB cluster is up.

Install:
    pip install pymongo faker
"""

from pymongo import MongoClient
from faker import Faker
from datetime import datetime, timedelta
import random

# ─── CONFIG ─────────────────────────────────────────────────────────
MONGO_URI = "mongodb://localhost:27017"
DB_NAME   = "ecommerce"

NUM_CUSTOMERS = 300
NUM_PRODUCTS  = 120
NUM_SUPPLIERS = 25
NUM_ORDERS    = 700
NUM_REVIEWS   = 500

fake = Faker("en_PK")

REGIONS = ["Punjab", "Sindh", "KPK"]
CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports"]

# ─── CONNECT ────────────────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

collections = [
    "customers", "products", "suppliers", "orders", "reviews",
    "user_events", "sessions", "inventory_logs", "shipments", "payments"
]

for col in collections:
    db[col].drop()

print("🧹 Cleared existing collections.")

# ─── SUPPLIERS ──────────────────────────────────────────────────────
suppliers = []
for i in range(NUM_SUPPLIERS):
    suppliers.append({
        "_id": f"sup_{i+1:03d}",
        "name": fake.company(),
        "contact_email": fake.company_email(),
        "region": random.choice(REGIONS),
        "rating": round(random.uniform(3.0, 5.0), 1),
        "delivery_time_avg": random.randint(2, 7)
    })
db.suppliers.insert_many(suppliers)

# ─── PRODUCTS ───────────────────────────────────────────────────────
product_names = {
    "Electronics": ["Headphones", "Smart Watch", "Keyboard", "Mouse"],
    "Clothing": ["Kurta", "Jeans", "Jacket", "T-Shirt"],
    "Books": ["Python Guide", "Physics Book", "Novel"],
    "Home & Kitchen": ["Blender", "Kettle", "Cookware"],
    "Sports": ["Cricket Bat", "Football", "Yoga Mat"]
}

products = []
for i in range(NUM_PRODUCTS):
    category = random.choice(CATEGORIES)
    price = round(random.uniform(500, 50000), 2)

    products.append({
        "_id": f"prod_{i+1:03d}",
        "name": random.choice(product_names[category]) + f" {fake.bothify('??-###')}",
        "category": category,
        "price": price,
        "cost_price": round(price * random.uniform(0.5, 0.8), 2),
        "stock_quantity": random.randint(0, 500),
        "supplier_id": random.choice(suppliers)["_id"],
        "ratings_avg": round(random.uniform(2.5, 5.0), 1),
        "views_count": random.randint(0, 5000),
        "created_at": fake.date_time_between(start_date="-2y", end_date="now")
    })
db.products.insert_many(products)

# ─── CUSTOMERS ──────────────────────────────────────────────────────
customers = []

for i in range(NUM_CUSTOMERS):
    created = fake.date_time_between(start_date="-3y", end_date="now")

    customers.append({
        "_id": f"cust_{i+1:03d}",

        # 🔹 From frontend form
        "name": fake.name(),
        "email": fake.email(),
        "password": fake.password(length=10),  # simulate hashed later
        "phone": f"03{random.randint(100000000, 999999999)}",
        "address": fake.street_address(),
        "city": fake.city(),
        "region": random.choice(REGIONS),

        # 🔹 Extra system fields (analytics / backend)
        "loyalty_tier": random.choice(["bronze", "silver", "gold", "platinum"]),
        "created_at": created,
        "last_login": fake.date_time_between(start_date=created, end_date="now"),
        "is_active": random.choice([True, True, True, False])
    })

db.customers.insert_many(customers)

# ─── ORDERS ─────────────────────────────────────────────────────────
orders = []
for i in range(NUM_ORDERS):
    customer = random.choice(customers)
    num_items = random.randint(1, 4)
    selected_products = random.sample(products, num_items)

    items = []
    total = 0

    for p in selected_products:
        qty = random.randint(1, 3)
        discount = round(p["price"] * random.uniform(0, 0.15), 2)
        subtotal = (p["price"] - discount) * qty
        total += subtotal

        items.append({
            "product_id": p["_id"],
            "quantity": qty,
            "unit_price": p["price"],
            "discount": discount,
            "subtotal": subtotal
        })

    order_date = fake.date_time_between(start_date="-1y", end_date="now")

    orders.append({
        "_id": f"ord_{i+1:04d}",
        "customer_id": customer["_id"],
        "order_date": order_date,
        "status": random.choice(["pending", "delivered", "cancelled"]),
        "items": items,
        "total_amount": round(total, 2),
        "payment_method": random.choice(["card", "easypaisa", "cash"]),
        "coupon_used": random.choice([None, "SALE10", "NEWUSER"]),
    })

db.orders.insert_many(orders)

# ─── REVIEWS ────────────────────────────────────────────────────────
reviews = []
for i in range(NUM_REVIEWS):
    product = random.choice(products)
    customer = random.choice(customers)

    reviews.append({
        "_id": f"rev_{i+1:04d}",
        "product_id": product["_id"],
        "customer_id": customer["_id"],
        "rating": random.randint(1, 5),
        "comment": fake.sentence(),
        "review_date": fake.date_time_between(start_date="-1y", end_date="now")
    })

db.reviews.insert_many(reviews)

# ─── USER EVENTS ────────────────────────────────────────────────────
events = []
event_types = ["view", "click", "add_to_cart", "purchase"]

for i in range(3000):
    user = random.choice(customers)
    product = random.choice(products)

    events.append({
        "_id": f"evt_{i+1:05d}",
        "user_id": user["_id"],
        "event_type": random.choice(event_types),
        "product_id": product["_id"],
        "timestamp": fake.date_time_between(start_date="-6m", end_date="now"),
        "device": random.choice(["mobile", "desktop"]),
        "session_id": f"sess_{random.randint(1, 800):04d}"
    })

db.user_events.insert_many(events)

# ─── SESSIONS ───────────────────────────────────────────────────────
sessions = []
for i in range(800):
    user = random.choice(customers)
    start = fake.date_time_between(start_date="-6m", end_date="now")
    duration = random.randint(60, 2000)

    sessions.append({
        "_id": f"sess_{i+1:04d}",
        "user_id": user["_id"],
        "start_time": start,
        "end_time": start + timedelta(seconds=duration),
        "duration_seconds": duration,
        "pages_visited": random.randint(1, 10),
        "device": random.choice(["mobile", "desktop"]),
        "region": user["region"]
    })

db.sessions.insert_many(sessions)

# ─── INVENTORY LOGS ─────────────────────────────────────────────────
inventory_logs = []
for i in range(1000):
    p = random.choice(products)

    inventory_logs.append({
        "_id": f"inv_{i+1:05d}",
        "product_id": p["_id"],
        "change": random.randint(-5, 20),
        "reason": random.choice(["order", "restock", "return"]),
        "timestamp": fake.date_time_between(start_date="-6m", end_date="now")
    })

db.inventory_logs.insert_many(inventory_logs)

# ─── SHIPMENTS ──────────────────────────────────────────────────────
shipments = []
for i, order in enumerate(orders):
    shipped = order["order_date"] + timedelta(days=1)
    delivered = shipped + timedelta(days=random.randint(1, 7))

    shipments.append({
        "_id": f"ship_{i+1:04d}",
        "order_id": order["_id"],
        "status": random.choice(["in_transit", "delivered", "delayed"]),
        "carrier": random.choice(["TCS", "Leopards", "Pakistan Post"]),
        "shipped_at": shipped,
        "delivered_at": delivered,
        "delay_days": max(0, (delivered - shipped).days - 3)
    })

db.shipments.insert_many(shipments)

# ─── PAYMENTS ───────────────────────────────────────────────────────
payments = []
for i, order in enumerate(orders):
    payments.append({
        "_id": f"pay_{i+1:04d}",
        "order_id": order["_id"],
        "method": order["payment_method"],
        "status": random.choice(["paid", "pending", "failed"]),
        "amount": order["total_amount"],
        "timestamp": order["order_date"]
    })

db.payments.insert_many(payments)

# ─── DONE ───────────────────────────────────────────────────────────
print("\n✅ Seeding Complete!")
for col in collections:
    print(f"{col}: {db[col].count_documents({})}")