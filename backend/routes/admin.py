from flask import Blueprint, jsonify, request
import mysql.connector
import os

admin_routes = Blueprint("admin", __name__)

def get_db():
    """Create a fresh connection per request to avoid stale cursor issues."""
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "12345"),
        database=os.getenv("MYSQL_DB", "ecommerce_warehouse")
    )

# ─────────────────────────────
# SYNC DATA (ETL)
# ─────────────────────────────
@admin_routes.route("/sync", methods=["POST"])
def sync_data():
    import subprocess
    import sys
    try:
        # Use the same python executable running the server
        result = subprocess.run([sys.executable, "etl.py"], capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({"message": "Warehouse synchronized successfully!", "output": result.stdout}), 200
        else:
            error_msg = f"ETL Error: {result.stderr}"
            print(error_msg)
            return jsonify({"error": "ETL failed", "details": result.stderr}), 500
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Sync Exception: {error_trace}")
        return jsonify({"error": str(e), "trace": error_trace}), 500

# ─────────────────────────────
# DASHBOARD
# ─────────────────────────────
@admin_routes.route("/dashboard")
def dashboard():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Total revenue from fact_orders
    cursor.execute("SELECT COALESCE(SUM(subtotal), 0) as revenue FROM fact_orders")
    revenue = cursor.fetchone()

    # Total unique orders
    cursor.execute("SELECT COUNT(DISTINCT order_id) as orders FROM fact_orders")
    orders = cursor.fetchone()

    # Total customers
    cursor.execute("SELECT COUNT(*) as users FROM dim_customers")
    users = cursor.fetchone()

    # Estimated profit (subtotal minus 40% estimated cost — no cost column in schema)
    cursor.execute("SELECT COALESCE(SUM(subtotal * 0.4), 0) as profit FROM fact_orders WHERE order_status = 'delivered'")
    profit = cursor.fetchone()

    # Daily revenue + order trend (from dim_date join)
    cursor.execute("""
        SELECT
            d.full_date   AS date,
            SUM(fo.subtotal)              AS total_revenue,
            COUNT(DISTINCT fo.order_id)  AS total_orders
        FROM fact_orders fo
        JOIN dim_date d ON fo.date_id = d.date_id
        GROUP BY d.full_date
        ORDER BY d.full_date
    """)
    daily_metrics = cursor.fetchall()

    # Top product revenue
    cursor.execute("""
        SELECT
            fo.product_id,
            p.name,
            SUM(fo.subtotal)   AS total_revenue,
            SUM(fo.quantity)   AS total_sales
        FROM fact_orders fo
        JOIN dim_products p ON fo.product_id = p.product_id
        GROUP BY fo.product_id, p.name
        ORDER BY total_revenue DESC
        LIMIT 20
    """)
    product_perf = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "stats": {
            "total_revenue": float(revenue["revenue"] or 0),
            "total_orders":  orders["orders"],
            "total_users":   users["users"],
            "total_profit":  float(profit["profit"] or 0)
        },
        "daily_metrics":      daily_metrics,
        "product_performance": product_perf
    })


# ─────────────────────────────
# ANALYTICS
# ─────────────────────────────
@admin_routes.route("/analytics")
def analytics():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Customer spending summary
    cursor.execute("""
        SELECT
            c.customer_id,
            c.name,
            SUM(fo.subtotal)              AS total_spent,
            COUNT(DISTINCT fo.order_id)  AS total_orders
        FROM fact_orders fo
        JOIN dim_customers c ON fo.customer_id = c.customer_id
        GROUP BY c.customer_id, c.name
        ORDER BY total_spent DESC
        LIMIT 50
    """)
    customers = cursor.fetchall()

    # Average order value (per order_id)
    cursor.execute("""
        SELECT AVG(order_total) as avg_order
        FROM (
            SELECT order_id, SUM(subtotal) as order_total
            FROM fact_orders
            GROUP BY order_id
        ) t
    """)
    avg = cursor.fetchone()

    # Revenue by region
    cursor.execute("""
        SELECT
            r.region_name,
            SUM(fo.subtotal) AS revenue
        FROM fact_orders fo
        JOIN dim_regions r ON fo.region_id = r.region_id
        GROUP BY r.region_name
    """)
    region_revenue = cursor.fetchall()

    # Revenue by category
    cursor.execute("""
        SELECT
            p.category as name,
            SUM(fo.subtotal) AS value
        FROM fact_orders fo
        JOIN dim_products p ON fo.product_id = p.product_id
        GROUP BY p.category
    """)
    category_sales = cursor.fetchall()

    cursor.close()
    db.close()

    top_customer = customers[0]["name"] if customers else "N/A"

    return jsonify({
        "customer_summary":  customers,
        "avg_order_value":   float(avg["avg_order"] or 0),
        "top_customer":      top_customer,
        "region_revenue":    region_revenue,
        "category_sales":    category_sales
    })


# ─────────────────────────────
# PRODUCTS
# ─────────────────────────────
# ─────────────────────────────
# AI WAREHOUSING (GEMINI)
# ─────────────────────────────
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

@admin_routes.route("/ai-query", methods=["POST"])
def ai_query():
    user_query = request.json.get("query")
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    schema_context = """
    You are an expert data analyst for an E-commerce warehouse. 
    The database is MySQL and has the following Star Schema:
    - fact_orders (order_id, customer_id, product_id, region_id, date_id, quantity, unit_price, subtotal, order_status)
    - dim_products (product_id, name, category, brand, price)
    - dim_customers (customer_id, name, city, region_id)
    - dim_regions (region_id, region_name)
    - dim_date (date_id, full_date, month_name, year)

    Task: 
    1. Generate ONLY a valid SQL query to answer the user's question. 
    2. The query must be compatible with MySQL.
    3. Output the SQL query inside triple backticks like this: ```sql ... ```
    """

    try:
        # Step 1: Generate SQL
        response = model.generate_content(f"{schema_context}\n\nUser Question: {user_query}")
        raw_text = response.text
        
        # Robust SQL extraction
        if "```sql" in raw_text:
            sql_match = raw_text.split("```sql")[1].split("```")[0].strip()
        elif "```" in raw_text:
            sql_match = raw_text.split("```")[1].split("```")[0].strip()
        else:
            sql_match = raw_text.strip()
            
        # Remove any lingering "sql" prefix if it exists
        if sql_match.lower().startswith("sql"):
            sql_match = sql_match[3:].strip()
        
        print(f"AI Generated SQL: {sql_match}")
        
        # Step 2: Run SQL
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql_match)
        query_results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Step 3: Explain Results
        explain_prompt = f"User asked: '{user_query}'. Result: {query_results}. Explain this answer simply."
        explanation = model.generate_content(explain_prompt)

        return jsonify({
            "sql": sql_match,
            "results": query_results,
            "answer": explanation.text
        })

    except Exception as e:
        print(f"AI Query Error: {e}")
        return jsonify({"error": "AI could not process this query", "details": str(e)}), 500

@admin_routes.route("/products")
def products():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM dim_products")
    result = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(result)


@admin_routes.route("/products/update", methods=["PUT"])
def update_product():
    data = request.json

    # Whitelist allowed fields to prevent SQL injection
    allowed_fields = {"name", "price", "category", "sub_category", "brand"}
    field = data.get("field")

    if field not in allowed_fields:
        return jsonify({"error": f"Field '{field}' is not editable"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = f"UPDATE dim_products SET {field} = %s WHERE product_id = %s"
    cursor.execute(query, (data["value"], data["product_id"]))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"status": "updated"})