from flask import Blueprint, jsonify, request
import mysql.connector
import os

admin_routes = Blueprint("admin", __name__)

db = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST", "localhost"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", "12345"),
    database=os.getenv("MYSQL_DB", "ecommerce_warehouse")
)

cursor = db.cursor(dictionary=True)

# ─────────────────────────────
# DASHBOARD
# ─────────────────────────────
@admin_routes.route("/dashboard")
def dashboard():

    cursor.execute("SELECT SUM(total_amount) as revenue FROM orders")
    revenue = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as orders FROM orders")
    orders = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as users FROM users")
    users = cursor.fetchone()

    cursor.execute("""
        SELECT SUM(
            (oi.price - p.price) * oi.quantity
        ) as profit
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
    """)
    profit = cursor.fetchone()

    cursor.execute("SELECT * FROM daily_metrics")
    daily_metrics = cursor.fetchall()

    cursor.execute("SELECT * FROM product_performance")
    product_perf = cursor.fetchall()

    return jsonify({
        "stats": {
            "total_revenue": revenue["revenue"] or 0,
            "total_orders": orders["orders"],
            "total_users": users["users"],
            "total_profit": profit["profit"] or 0
        },
        "daily_metrics": daily_metrics,
        "product_performance": product_perf
    })


# ─────────────────────────────
# ANALYTICS
# ─────────────────────────────
@admin_routes.route("/analytics")
def analytics():

    cursor.execute("""
        SELECT user_id, total_spent, total_orders
        FROM customer_summary
        ORDER BY total_spent DESC
    """)
    customers = cursor.fetchall()

    cursor.execute("SELECT AVG(total_amount) as avg_order FROM orders")
    avg = cursor.fetchone()

    return jsonify({
        "customer_summary": customers,
        "avg_order_value": avg["avg_order"] or 0,
        "top_customer": customers[0]["user_id"] if customers else None,
        "conversion_rate": 12.5
    })


# ─────────────────────────────
# PRODUCTS
# ─────────────────────────────
@admin_routes.route("/products")
def products():

    cursor.execute("SELECT * FROM products")
    return jsonify(cursor.fetchall())


@admin_routes.route("/products/update", methods=["PUT"])
def update_product():

    data = request.json

    query = f"""
        UPDATE products
        SET {data['field']} = %s
        WHERE product_id = %s
    """

    cursor.execute(query, (data["value"], data["product_id"]))
    db.commit()

    return jsonify({"status": "updated"})