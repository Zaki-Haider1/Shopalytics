import mysql.connector
from pymongo import MongoClient
import pandas as pd
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = "ecommerce"

MYSQL_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "12345"),
    "database": os.getenv("MYSQL_DB", "ecommerce_warehouse")
}

# ─────────────────────────────────────────────
# CONNECT
# ─────────────────────────────────────────────
mongo_client = MongoClient(MONGO_URI)
mdb = mongo_client[MONGO_DB]

sql_conn = mysql.connector.connect(**MYSQL_CONFIG)
cursor = sql_conn.cursor()

# ─────────────────────────────────────────────
# EXTRACT
# ─────────────────────────────────────────────
suppliers = pd.DataFrame(list(mdb.suppliers.find()))
products = pd.DataFrame(list(mdb.products.find()))
customers = pd.DataFrame(list(mdb.customers.find()))
orders = pd.DataFrame(list(mdb.orders.find()))
reviews = pd.DataFrame(list(mdb.reviews.find()))
events = pd.DataFrame(list(mdb.user_events.find()))

# ─────────────────────────────────────────────
# SAFE DATETIME
# ─────────────────────────────────────────────
for df in [customers, orders, reviews, events, products]:
    for col in df.columns:
        if "date" in col or "time" in col or col in ["created_at", "timestamp", "order_date", "review_date"]:
            df[col] = pd.to_datetime(df[col], errors="coerce")

# ─────────────────────────────────────────────
# TRANSFORM
# ─────────────────────────────────────────────

# ── PRODUCTS

categories_df = pd.DataFrame(products["category"].unique(), columns=["name"])
categories_df["category_id"] = [
    f"cat_{i+1}" for i in range(len(categories_df))
]

category_map = dict(zip(categories_df["name"], categories_df["category_id"]))

products["category_id"] = products["category"].map(category_map)

products_df = products.rename(columns={
    "_id": "product_id",
    "stock_quantity": "stock"
})[[
    "product_id",
    "name",
    "category_id",  
    "price",
    "cost_price",
    "stock",
    "supplier_id",
    "ratings_avg",
    "views_count",
    "created_at"
]]

# ── CUSTOMERS
customers_df = customers.rename(columns={
    "_id": "customer_id"
})[[
    "customer_id", "name", "email", "created_at",
    "last_login"
]]

# ── ORDERS
orders_df = orders.rename(columns={
    "_id": "order_id"
})[[
    "order_id", "customer_id", "order_date",
    "status", "total_amount", "payment_method", "coupon_used"
]]

# ─────────────────────────────────────────────
# ORDER ITEMS (FLATTEN NESTED ARRAY)
# ─────────────────────────────────────────────
order_items_list = []

product_cost_map = products.set_index("_id")["cost_price"].to_dict()

for _, order in orders.iterrows():
    for item in order.get("items", []):
        cost_price = product_cost_map.get(item["product_id"], 0)

        profit = (item["unit_price"] - cost_price) * item["quantity"]

        order_items_list.append({
            "order_item_id": f"{order['_id']}_{item['product_id']}",
            "order_id": order["_id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "price": item["unit_price"],
            "discount": item.get("discount", 0),
            "subtotal": item.get("subtotal", item["unit_price"] * item["quantity"]),
            "cost_price": cost_price,
            "profit": profit
        })

order_items_df = pd.DataFrame(order_items_list)

# ─────────────────────────────────────────────
# REVIEWS
# ─────────────────────────────────────────────
reviews_df = reviews.rename(columns={
    "_id": "review_id"
})[[
    "review_id", "product_id", "customer_id",
    "rating", "comment", "review_date"
]]

# ─────────────────────────────────────────────
# USER EVENTS
# ─────────────────────────────────────────────
events_df = events.rename(columns={
    "_id": "event_id",
    "user_id": "customer_id",
    "event_type": "activity_type",
    "timestamp": "created_at"
})[[
    "event_id", "customer_id", "activity_type",
    "product_id", "created_at", "device", "session_id"
]]

# ─────────────────────────────────────────────
# DAILY METRICS
# ─────────────────────────────────────────────
orders["date"] = pd.to_datetime(orders["order_date"]).dt.date

daily_metrics = orders.groupby("date").agg(
    total_revenue=("total_amount", "sum"),
    total_orders=("_id", "count")
).reset_index()

# profit
profit_df = order_items_df.merge(
    orders[["_id", "order_date"]],
    left_on="order_id",
    right_on="_id"
)

profit_df["date"] = pd.to_datetime(profit_df["order_date"]).dt.date

profit_daily = profit_df.groupby("date").agg(
    total_profit=("profit", "sum")
).reset_index()

daily_metrics = daily_metrics.merge(profit_daily, on="date", how="left")
daily_metrics["total_profit"] = daily_metrics["total_profit"].fillna(0)

# customers per day
customers["date"] = pd.to_datetime(customers["created_at"]).dt.date

new_customers = customers.groupby("date").size().reset_index(name="new_customers")

daily_metrics = daily_metrics.merge(new_customers, on="date", how="left").fillna(0)

daily_metrics = daily_metrics.sort_values("date")
daily_metrics["total_customers"] = daily_metrics["new_customers"].cumsum()

# ─────────────────────────────────────────────
# PRODUCT PERFORMANCE
# ─────────────────────────────────────────────
product_sales = order_items_df.groupby("product_id").agg(
    total_sales=("quantity", "sum"),
    total_revenue=("subtotal", "sum")
).reset_index()

product_reviews = reviews_df.groupby("product_id").agg(
    avg_rating=("rating", "mean"),
    total_reviews=("rating", "count")
).reset_index()

product_perf = product_sales.merge(product_reviews, on="product_id", how="left")

product_perf["avg_rating"] = product_perf["avg_rating"].fillna(0)
product_perf["total_reviews"] = product_perf["total_reviews"].fillna(0).astype(int)
product_perf["last_updated"] = datetime.now()

# ─────────────────────────────────────────────
# CUSTOMER SUMMARY
# ─────────────────────────────────────────────
customer_summary = orders.groupby("customer_id").agg(
    total_spent=("total_amount", "sum"),
    total_orders=("_id", "count") 
)

customer_summary["avg_order_value"] = (
    customer_summary["total_spent"] / customer_summary["total_orders"]
)

last_order = orders.groupby("customer_id")["order_date"].max().reset_index()
last_order.rename(columns={"order_date": "last_order_date"}, inplace=True)

customer_summary = customer_summary.merge(last_order, on="customer_id")

# ─────────────────────────────────────────────
# LOAD HELPER
# ─────────────────────────────────────────────
def insert_df(table, df):
    if df.empty:
        return

    df = df.where(pd.notnull(df), None)

    cursor.execute(f"DELETE FROM {table}")

    cols = ", ".join(df.columns)
    vals = ", ".join(["%s"] * len(df.columns))
    query = f"INSERT INTO {table} ({cols}) VALUES ({vals})"

    for _, row in df.iterrows():
        cursor.execute(query, tuple(row))

# ─────────────────────────────────────────────
# LOAD
# ─────────────────────────────────────────────
insert_df("products", products_df)
insert_df("customers", customers_df)
insert_df("orders", orders_df)
insert_df("order_items", order_items_df)
insert_df("reviews", reviews_df)
insert_df("customer_activity", events_df)

insert_df("daily_metrics", daily_metrics)
insert_df("product_performance", product_perf)
insert_df("customer_summary", customer_summary)

sql_conn.commit()

print("✅ ETL pipeline fully aligned with MongoDB + SQL schema")