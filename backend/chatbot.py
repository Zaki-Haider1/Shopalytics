import google.generativeai as genai
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# ─── Configure Gemini ────────────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3-flash-preview")

# ─── Connect to MySQL ────────────────────────────────────────────
mysql_conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST", "localhost"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", "12345"),
    database=os.getenv("MYSQL_DB", "ecommerce_warehouse")
)
mysql_cursor = mysql_conn.cursor(buffered=True)

print("Chatbot ready!")


# ─── Database schema description for Gemini ──────────────────────
schema = """
You are a SQL expert. Convert the user's question into a MySQL query.
Only return the SQL query, nothing else. No explanations, no markdown, no backticks.

STRICT RULES:
- Only return a valid MySQL query.
- No explanations, no markdown.
- Use ONLY the tables and columns listed below.
- Always use proper JOINs when needed.
- Use SUM(subtotal) for revenue.
- Use GROUP BY when aggregating.


The database has these tables:

dim_regions:    region_id, region_name (Punjab, Sindh, KPK)
dim_customers:  customer_id, name, email, phone, city, region_id, country
dim_products:   product_id, name, category, sub_category, brand, price, supplier_id
dim_date:       date_id, full_date, day, month, month_name, quarter, year
fact_orders:    order_id, customer_id, product_id, region_id, date_id,
                quantity, unit_price, discount, subtotal,
                payment_method, payment_status, order_status
"""

# ─── Function to ask Gemini to generate SQL ───────────────────────
def generate_sql(user_question):
    prompt = schema + "\nUser question: " + user_question
    response = model.generate_content(prompt)
    return response.text.strip()

# ─── Function to run the SQL on MySQL ────────────────────────────
def run_query(sql):
    mysql_cursor.execute(sql)
    results = mysql_cursor.fetchall()
    columns = [desc[0] for desc in mysql_cursor.description]
    return columns, results

# ─── Main chat loop ───────────────────────────────────────────────
print("\nEcommerce Analytics Chatbot")
print("Ask anything about your data. Type 'exit' to quit.\n")

while True:
    question = input("You: ")
    if question.lower() == "exit":
        break
    
    sql = generate_sql(question)
    print(f"\nGenerated SQL: {sql}\n")
    
    try:
        columns, results = run_query(sql)
        print("Results:")
        print("  " + " | ".join(columns))
        print("  " + "-" * 40)
        for row in results:
            print("  " + " | ".join(str(val) for val in row))
    except Exception as e:
        print(f"Error running query: {e}")
    
    print()