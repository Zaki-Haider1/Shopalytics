from flask import Blueprint, request, jsonify
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

admin_routes = Blueprint("admin", __name__)

def get_db():
    """Create a fresh connection per request to avoid stale cursor issues."""
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "12345"),
        database=os.getenv("MYSQL_DB", "ecommerce_warehouse")
    )

@admin_routes.route("/dashboard")
def dashboard():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # 1. KPI Stats
    cursor.execute("SELECT SUM(subtotal) as total_revenue, COUNT(*) as total_orders FROM fact_orders")
    stats = cursor.fetchone()
    
    cursor.execute("SELECT COUNT(*) as total_users FROM dim_customers")
    user_count = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total_products FROM dim_products")
    product_count = cursor.fetchone()
    
    # 2. Revenue Performance (Line Chart)
    cursor.execute("""
        SELECT d.full_date as date, SUM(fo.subtotal) as total_revenue 
        FROM fact_orders fo 
        JOIN dim_date d ON fo.date_id = d.date_id 
        GROUP BY d.full_date 
        ORDER BY d.full_date ASC
    """)
    daily_metrics = cursor.fetchall()

    # 3. Product Performance (Leaderboard)
    cursor.execute("""
        SELECT p.name, SUM(fo.quantity) as total_sales, SUM(fo.subtotal) as total_revenue
        FROM fact_orders fo
        JOIN dim_products p ON fo.product_id = p.product_id
        GROUP BY p.name
        ORDER BY total_revenue DESC
        LIMIT 5
    """)
    product_performance = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "stats": {
            "total_revenue": float(stats['total_revenue'] or 0),
            "total_orders": stats['total_orders'] or 0,
            "total_users": user_count['total_users'] or 0,
            "total_products": product_count['total_products'] or 0,
            "total_profit": float(stats['total_revenue'] or 0) * 0.25 # Mock profit
        },
        "daily_metrics": daily_metrics,
        "product_performance": product_performance
    })

@admin_routes.route("/analytics")
def analytics():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # 1. Sales by Category
    cursor.execute("""
        SELECT p.category as name, SUM(fo.subtotal) as value
        FROM fact_orders fo
        JOIN dim_products p ON fo.product_id = p.product_id
        GROUP BY p.category
    """)
    category_sales = cursor.fetchall()

    # 2. Regional Revenue
    cursor.execute("""
        SELECT r.region_name, SUM(fo.subtotal) as revenue
        FROM fact_orders fo
        JOIN dim_regions r ON fo.region_id = r.region_id
        GROUP BY r.region_name
    """)
    region_revenue = cursor.fetchall()

    # 3. Customer Summary
    cursor.execute("""
        SELECT c.name, COUNT(fo.id) as total_orders, SUM(fo.subtotal) as total_spent
        FROM fact_orders fo
        JOIN dim_customers c ON fo.customer_id = c.customer_id
        GROUP BY c.name
        ORDER BY total_spent DESC
    """)
    customer_summary = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "category_sales": category_sales,
        "region_revenue": region_revenue,
        "customer_summary": customer_summary
    })

@admin_routes.route("/sync", methods=["POST"])
def sync_warehouse():
    """Triggers the ETL process manually."""
    import subprocess
    import sys
    try:
        # Run etl.py using the same python interpreter
        result = subprocess.run([sys.executable, "etl.py"], capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({"message": "Sync successful"}), 200
        else:
            return jsonify({"error": "Sync failed", "details": result.stderr}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_routes.route("/ai-query", methods=["POST"])
def ai_query():
    # Lazy Load Gemini to prevent startup crashes
    try:
        import google.generativeai as genai
    except ImportError:
        return jsonify({"error": "Google AI library not installed in container. Run docker-compose build."}), 500

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash") # Use standard 1.5 if 3 is invalid
    
    user_query = request.json.get("query")
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    schema_context = """
You are a SQL expert. Convert the user's question into a MySQL query.
Only return the SQL query, nothing else. No explanations, no markdown, no backticks.

STRICT RULES:
- Only return a valid MySQL query.
- Use SUM(subtotal) for revenue.
- Use GROUP BY when aggregating.

DATABASE SCHEMA:
dim_regions (region_id, region_name)
dim_customers (customer_id, name, email, phone, city, region_id, country)
dim_products (product_id, name, category, sub_category, brand, price, supplier_id)
dim_date (date_id, full_date, day, month, month_name, quarter, year)
fact_orders (id, order_id, customer_id, product_id, region_id, date_id, quantity, unit_price, discount, subtotal, payment_method, payment_status, order_status)
"""

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        prompt = f"{schema_context}\n\nQuestion: {user_query}\n\nSQL Query:"
        response = model.generate_content(prompt)
        sql_match = response.text.strip().replace("```sql", "").replace("```", "").strip()
        
        if sql_match.lower().startswith("sql"):
            sql_match = sql_match[3:].strip()
        
        # Run SQL
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql_match)
        query_results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Explain
        explain_prompt = f"User asked: '{user_query}'. SQL result: {query_results}. Give a short, helpful answer."
        explanation = model.generate_content(explain_prompt)

        return jsonify({
            "sql": sql_match,
            "results": query_results,
            "answer": explanation.text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

from db import products_collection
from bson import ObjectId

@admin_routes.route("/products", methods=["GET"])
def get_admin_products():
    """Fetch live inventory from MongoDB."""
    products = list(products_collection.find())
    for p in products:
        p["_id"] = str(p["_id"]) # Convert ObjectId for JSON
    return jsonify(products)

@admin_routes.route("/products", methods=["POST"])
def add_product():
    """Add a new product to MongoDB."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Auto-generate a readable product_id if not provided
    if "product_id" not in data:
        data["product_id"] = f"prod_{os.urandom(3).hex()}"
        
    products_collection.insert_one(data)
    return jsonify({"message": "Product added successfully", "product_id": data["product_id"]}), 201

@admin_routes.route("/products/<id>", methods=["DELETE"])
def delete_product(id):
    """Delete product from MongoDB by product_id, string _id, or ObjectId."""
    # 1. Try by product_id field
    if products_collection.delete_one({"product_id": id}).deleted_count > 0:
        return jsonify({"message": "Product deleted"}), 200
    
    # 2. Try by _id as a plain string
    if products_collection.delete_one({"_id": id}).deleted_count > 0:
        return jsonify({"message": "Product deleted"}), 200
    
    # 3. Try by MongoDB ObjectId
    try:
        from bson import ObjectId
        if products_collection.delete_one({"_id": ObjectId(id)}).deleted_count > 0:
            return jsonify({"message": "Product deleted"}), 200
    except:
        pass
            
    return jsonify({"error": "Product not found in database"}), 404