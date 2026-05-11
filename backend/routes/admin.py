from flask import Blueprint, request, jsonify
import os
import mysql.connector
from dotenv import load_dotenv
from db import products_collection
from bson import ObjectId

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
    time_range = request.args.get("range", "7d") 
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        # Date Filter logic
        date_filter = ""
        if time_range == "7d":
            date_filter = "WHERE d.full_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
        elif time_range == "1m":
            date_filter = "WHERE d.full_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)"
        elif time_range == "4m":
            date_filter = "WHERE d.full_date >= DATE_SUB(CURDATE(), INTERVAL 4 MONTH)"
        elif time_range == "1y":
            date_filter = "WHERE d.full_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)"
        
        # 1. KPI Stats
        cursor.execute(f"""
            SELECT SUM(fo.subtotal) as total_revenue, COUNT(fo.id) as total_orders 
            FROM fact_orders fo
            JOIN dim_date d ON fo.date_id = d.date_id
            {date_filter}
        """)
        stats = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) as total_users FROM dim_customers")
        user_count = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_products FROM dim_products")
        product_count = cursor.fetchone()
        
        # 2. Revenue Performance (Line Chart)
        if time_range in ["1y", "all"]:
            query = f"""
                SELECT DATE_FORMAT(d.full_date, '%Y-%m-01') as date, SUM(fo.subtotal) as total_revenue 
                FROM fact_orders fo 
                JOIN dim_date d ON fo.date_id = d.date_id 
                {date_filter}
                GROUP BY date
                ORDER BY date ASC
            """
        else:
            query = f"""
                SELECT d.full_date as date, SUM(fo.subtotal) as total_revenue 
                FROM fact_orders fo 
                JOIN dim_date d ON fo.date_id = d.date_id 
                {date_filter}
                GROUP BY d.full_date 
                ORDER BY d.full_date ASC
            """
        cursor.execute(query)
        daily_metrics = cursor.fetchall()

        # Fill missing dates for better chart continuity
        from datetime import date, timedelta
        import calendar

        processed_metrics = []
        data_map = {str(m['date']): float(m['total_revenue'] or 0) for m in daily_metrics}

        if time_range in ["7d", "1m", "4m"]:
            days_limit = {"7d": 7, "1m": 30, "4m": 120}[time_range]
            end_date = date.today()
            start_date = end_date - timedelta(days=days_limit-1)
            
            current = start_date
            while current <= end_date:
                d_str = str(current)
                processed_metrics.append({
                    "date": d_str,
                    "total_revenue": data_map.get(d_str, 0.0)
                })
                current += timedelta(days=1)
        
        elif time_range == "1y":
            # Last 12 months
            end_date = date.today().replace(day=1)
            months = []
            for i in range(12):
                m = (end_date.month - i - 1) % 12 + 1
                y = end_date.year + (end_date.month - i - 1) // 12
                months.append(date(y, m, 1))
            months.sort()
            
            for m_date in months:
                d_str = str(m_date)
                processed_metrics.append({
                    "date": d_str,
                    "total_revenue": data_map.get(d_str, 0.0)
                })
        else:
            # For "all", just use the existing points as they might span years
            processed_metrics = [{
                "date": str(m['date']),
                "total_revenue": float(m['total_revenue'] or 0)
            } for m in daily_metrics]

        # 3. Product Performance (Leaderboard)
        cursor.execute(f"""
            SELECT p.name, SUM(fo.quantity) as total_sales, SUM(fo.subtotal) as total_revenue
            FROM fact_orders fo
            JOIN dim_products p ON fo.product_id = p.product_id
            JOIN dim_date d ON fo.date_id = d.date_id
            {date_filter}
            GROUP BY p.name
            ORDER BY total_revenue DESC
            LIMIT 5
        """)
        product_performance = cursor.fetchall()

        cursor.close()
        db.close()

        # Ensure all types are JSON serializable
        return jsonify({
            "stats": {
                "total_revenue": float(stats['total_revenue'] or 0),
                "total_orders": int(stats['total_orders'] or 0),
                "total_users": int(user_count['total_users'] or 0),
                "total_products": int(product_count['total_products'] or 0),
                "total_profit": float(stats['total_revenue'] or 0) * 0.25
            },
            "daily_metrics": processed_metrics,
            "product_performance": [{
                "name": p['name'],
                "total_sales": int(p['total_sales'] or 0),
                "total_revenue": float(p['total_revenue'] or 0)
            } for p in product_performance]
        })
    except Exception as e:
        if cursor: cursor.close()
        if db: db.close()
        print(f"Dashboard Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
        
        # Clean SQL
        sql_match = response.text.strip().replace("```sql", "").replace("```", "").strip()
        if sql_match.lower().startswith("sql"):
            sql_match = sql_match[3:].strip()
            
        print(f"DEBUG - Generated SQL: {sql_match}")
        
        # Run SQL
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql_match)
        query_results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Handle JSON serialization (MySQL returns Decimals/Dates that jsonify hates)
        from decimal import Decimal
        from datetime import date, datetime
        
        def serialize(obj):
            if isinstance(obj, Decimal): return float(obj)
            if isinstance(obj, (date, datetime)): return obj.isoformat()
            return obj

        cleaned_results = []
        for row in query_results:
            cleaned_row = {k: serialize(v) for k, v in row.items()}
            cleaned_results.append(cleaned_row)

        # Explain
        explain_prompt = f"User asked: '{user_query}'. SQL result: {cleaned_results}. Give a short, helpful answer based on this data."
        explanation = model.generate_content(explain_prompt)

        return jsonify({
            "sql": sql_match,
            "results": cleaned_results,
            "answer": explanation.text
        })

    except Exception as e:
        print(f"DEBUG - AI Query Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@admin_routes.route("/products", methods=["GET"])
def get_admin_products():
    """Fetch live inventory from MongoDB."""
    products = list(products_collection.find())
    for p in products:
        p["_id"] = str(p["_id"]) # Convert ObjectId for JSON
    return jsonify(products)

@admin_routes.route("/categories", methods=["GET"])
def get_categories():
    """Fetch unique product categories from MongoDB."""
    categories = products_collection.distinct("category")
    return jsonify(categories)

@admin_routes.route("/products", methods=["POST"])
def add_product():
    """Add a new product to MongoDB with the updated structure."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Required fields validation
    required_fields = ["name", "category", "price", "cost_price", "stock_quantity", "supplier_id"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Field '{field}' is required"}), 400

    # Defaults and auto-generated fields
    from datetime import datetime, timezone
    import random
    
    # Auto-generate a readable _id if not provided (e.g., prod_123)
    if "_id" not in data:
        data["_id"] = f"prod_{random.randint(100, 999)}"
        
    # Ensure it's unique (basic check)
    if products_collection.find_one({"_id": data["_id"]}):
        data["_id"] = f"prod_{random.randint(1000, 9999)}"

    # Default values
    data["description"] = data.get("description", "")
    data["ratings_avg"] = 0.0
    data["views_count"] = 0
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["images"] = data.get("images", [])

    # Ensure types
    try:
        data["price"] = float(data["price"])
        data["cost_price"] = float(data["cost_price"])
        data["stock_quantity"] = int(data["stock_quantity"])
    except ValueError:
        return jsonify({"error": "Invalid numeric values provided"}), 400
        
    products_collection.insert_one(data)
    return jsonify({"message": "Product added successfully", "_id": data["_id"]}), 201

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

@admin_routes.route("/products/<id>", methods=["PUT"])
def update_product(id):
    data = request.json
    if not data: return jsonify({"error": "No data"}), 400
    update_data = {**data}
    if "_id" in update_data: del update_data["_id"]
    try:
        if "price" in update_data: update_data["price"] = float(update_data["price"])
        if "cost_price" in update_data: update_data["cost_price"] = float(update_data["cost_price"])
        if "stock_quantity" in update_data: update_data["stock_quantity"] = int(update_data["stock_quantity"])
    except ValueError: return jsonify({"error": "Invalid numbers"}), 400
    
    query_options = [{"_id": id}, {"product_id": id}]
    try: query_options.append({"_id": ObjectId(id)})
    except: pass
    
    for query in query_options:
        result = products_collection.update_one(query, {"$set": update_data})
        if result.matched_count > 0:
            return jsonify({"message": "Updated"}), 200
    return jsonify({"error": "Not found"}), 404

@admin_routes.route("/products/<id>/stock", methods=["PATCH"])
def patch_stock(id):
    """Increment or decrement product stock quantity."""
    data = request.json
    change = data.get("stock_change", 0)
    
    query_options = [{"_id": id}, {"product_id": id}]
    try: query_options.append({"_id": ObjectId(id)})
    except: pass
    
    for query in query_options:
        result = products_collection.update_one(query, {"$inc": {"stock_quantity": change}})
        if result.matched_count > 0:
            return jsonify({"message": "Stock updated successfully"}), 200
            
    return jsonify({"error": "Product not found"}), 404