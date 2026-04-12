"""
seed.py — Populate the MongoDB sharded e-commerce cluster with realistic data.
Run after init-cluster.sh has finished.

Install deps first:
    pip install pymongo faker
"""

from pymongo import MongoClient
from faker import Faker
from datetime import datetime, timedelta
import random
import uuid

# ─── Config ────────────────────────────────────────────────────────
MONGO_URI = "mongodb://localhost:27017"   # connects to mongos router
DB_NAME   = "ecommerce"

NUM_CUSTOMERS = 300
NUM_PRODUCTS  = 100
NUM_SUPPLIERS = 20
NUM_ORDERS    = 600
NUM_REVIEWS   = 400

# Shard key values — data will automatically distribute across shards
REGIONS = ["Punjab", "Sindh", "KPK"]

PRODUCT_CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports"]

fake = Faker("en_PK")   # Pakistani locale for realistic names/addresses

# ─── Connect ────────────────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db     = client[DB_NAME]

# Clear existing data (safe to re-run)
for col in ["customers", "products", "suppliers", "orders", "reviews"]:
    db[col].drop()
print("Cleared existing collections.")

# ─── Suppliers ──────────────────────────────────────────────────────
print(f"Seeding {NUM_SUPPLIERS} suppliers...")
suppliers = []
for i in range(NUM_SUPPLIERS):
    region = random.choice(REGIONS)
    suppliers.append({
        "_id": f"sup_{i+1:03d}",
        "name": fake.company(),
        "contact_email": fake.company_email(),
        "region": region,
        "country": "PK",
        "product_categories": random.sample(PRODUCT_CATEGORIES, k=random.randint(1, 3))
    })
db.suppliers.insert_many(suppliers)

# ─── Products ───────────────────────────────────────────────────────
print(f"Seeding {NUM_PRODUCTS} products...")
product_names = {
    "Electronics":    ["Wireless Headphones", "Smart Watch", "USB Hub", "Webcam", "Power Bank",
                       "Bluetooth Speaker", "Laptop Stand", "Mechanical Keyboard"],
    "Clothing":       ["Shalwar Kameez", "Kurta", "Polo Shirt", "Jeans", "Jacket",
                       "Sneakers", "Sandals", "Cap"],
    "Books":          ["Urdu Novel", "Physics Textbook", "Python Programming", "History of Pakistan",
                       "Self Help Guide", "Engineering Math"],
    "Home & Kitchen": ["Pressure Cooker", "Rice Cooker", "Blender", "Kettle",
                       "Dinner Set", "Storage Box", "Curtains"],
    "Sports":         ["Cricket Bat", "Football", "Badminton Racket", "Gym Gloves",
                       "Yoga Mat", "Jump Rope", "Water Bottle"],
}
products = []
for i in range(NUM_PRODUCTS):
    category    = random.choice(PRODUCT_CATEGORIES)
    name_pool   = product_names[category]
    supplier    = random.choice(suppliers)
    products.append({
        "_id":            f"prod_{i+1:03d}",
        "name":           random.choice(name_pool) + f" {fake.bothify('??-###')}",
        "category":       category,           # <── shard key
        "sub_category":   fake.word().capitalize(),
        "brand":          fake.company().split()[0],
        "price":          round(random.uniform(200, 50000), 2),
        "stock_quantity": random.randint(0, 500),
        "supplier_id":    supplier["_id"],
        "ratings_avg":    round(random.uniform(2.5, 5.0), 1),
        "created_at":     fake.date_time_between(start_date="-2y", end_date="now")
    })
db.products.insert_many(products)

# ─── Customers ──────────────────────────────────────────────────────
print(f"Seeding {NUM_CUSTOMERS} customers...")
customers = []
for i in range(NUM_CUSTOMERS):
    region = random.choice(REGIONS)
    customers.append({
        "_id":          f"cust_{i+1:03d}",
        "name":         fake.name(),
        "email":        fake.email(),
        "phone":        f"+92-{random.randint(300,349)}-{random.randint(1000000,9999999)}",
        "address": {
            "street":  fake.street_address(),
            "city":    fake.city(),
            "region":  region,             # <── shard key (nested)
            "country": "PK"
        },
        "loyalty_tier": random.choice(["bronze", "silver", "gold", "platinum"]),
        "created_at":   fake.date_time_between(start_date="-3y", end_date="now")
    })
db.customers.insert_many(customers)

# ─── Orders ─────────────────────────────────────────────────────────
print(f"Seeding {NUM_ORDERS} orders...")
statuses       = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
payment_methods = ["credit_card", "easypaisa", "jazzcash", "bank_transfer", "cash_on_delivery"]

orders = []
for i in range(NUM_ORDERS):
    customer      = random.choice(customers)
    region        = customer["address"]["region"]
    num_items     = random.randint(1, 5)
    order_products = random.sample(products, k=num_items)
    order_date    = fake.date_time_between(start_date="-1y", end_date="now")

    items = []
    total = 0
    for p in order_products:
        qty      = random.randint(1, 4)
        discount = round(p["price"] * random.uniform(0, 0.15), 2)
        subtotal = round((p["price"] - discount) * qty, 2)
        total   += subtotal
        items.append({
            "product_id":   p["_id"],
            "product_name": p["name"],
            "quantity":     qty,
            "unit_price":   p["price"],
            "discount":     discount,
            "subtotal":     subtotal
        })

    orders.append({
        "_id":        f"ord_{i+1:04d}",
        "customer_id": customer["_id"],
        "region":      region,             # <── shard key
        "order_date":  order_date,
        "status":      random.choice(statuses),
        "items":       items,
        "payment": {
            "method": random.choice(payment_methods),
            "status": random.choice(["paid", "pending", "failed"]),
            "total_amount": round(total, 2)
        },
        "shipping": {
            "address":           customer["address"]["street"] + ", " + customer["address"]["city"],
            "estimated_delivery": order_date + timedelta(days=random.randint(2, 7)),
            "actual_delivery":    order_date + timedelta(days=random.randint(1, 10))
                                  if random.random() > 0.3 else None
        }
    })
db.orders.insert_many(orders)

# ─── Reviews ────────────────────────────────────────────────────────
print(f"Seeding {NUM_REVIEWS} reviews...")
reviews = []
used    = set()
for i in range(NUM_REVIEWS):
    product  = random.choice(products)
    customer = random.choice(customers)
    key      = (product["_id"], customer["_id"])
    if key in used:
        continue
    used.add(key)
    reviews.append({
        "_id":              f"rev_{i+1:04d}",
        "product_id":       product["_id"],     # <── shard key
        "customer_id":      customer["_id"],
        "rating":           random.randint(1, 5),
        "comment":          fake.sentence(nb_words=random.randint(8, 20)),
        "review_date":      fake.date_time_between(start_date="-1y", end_date="now"),
        "verified_purchase": random.choice([True, False])
    })
db.reviews.insert_many(reviews)

# ─── Summary ────────────────────────────────────────────────────────
print("\n========== Seeding Complete ==========")
print(f"  customers : {db.customers.count_documents({})}")
print(f"  products  : {db.products.count_documents({})}")
print(f"  suppliers : {db.suppliers.count_documents({})}")
print(f"  orders    : {db.orders.count_documents({})}")
print(f"  reviews   : {db.reviews.count_documents({})}")
print("\nVerify shard distribution:")
print("  docker exec mongos mongosh --eval 'sh.status()'")
