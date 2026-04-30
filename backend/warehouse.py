import mysql.connector

# 🔧 CONFIG
DB_NAME = "ecommerce_warehouse"
DB_USER = "root"
DB_PASSWORD = "12345"
DB_HOST = "localhost"

def create_database(cursor):
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cursor.execute(f"USE {DB_NAME}")

    
def create_tables(cursor):
    tables = [

    # CUSTOMERS
    """
    CREATE TABLE IF NOT EXISTS customers (
        customer_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        created_at DATETIME,
        last_active DATETIME
    )
    """,

    # CATEGORIES
    """
    CREATE TABLE IF NOT EXISTS categories (
        category_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255)
    )
    """,

    # PRODUCTS
    """
    CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        category_id VARCHAR(50),
        price DECIMAL(10,2),
        stock INT,
        created_at DATETIME,
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
    )
    """,

    # ORDERS
    """
    CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        total_amount DECIMAL(10,2),
        status VARCHAR(50),
        created_at DATETIME,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """,

    # ORDER ITEMS
    """
    CREATE TABLE IF NOT EXISTS order_items (
        order_item_id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50),
        product_id VARCHAR(50),
        quantity INT,
        price DECIMAL(10,2),

        cost_price DECIMAL(10,2),
        profit DECIMAL(10,2),

        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
    """,

    # CUSTOMER ACTIVITY
    """
    CREATE TABLE IF NOT EXISTS customer_activity (
        activity_id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        activity_type VARCHAR(50),
        product_id VARCHAR(50),
        created_at DATETIME,

        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """,

    # DAILY METRICS
    """
    CREATE TABLE IF NOT EXISTS daily_metrics (
        date DATE PRIMARY KEY,
        total_revenue DECIMAL(12,2),
        total_orders INT,
        total_customers INT,
        new_customers INT,
        total_profit DECIMAL(12,2)
    )
    """,

    # PRODUCT PERFORMANCE
    """
    CREATE TABLE IF NOT EXISTS product_performance (
        product_id VARCHAR(50),
        total_sales INT,
        total_revenue DECIMAL(12,2),

        avg_rating DECIMAL(3,2),
        total_reviews INT,

        last_updated DATETIME,

        PRIMARY KEY (product_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
    """,

    # CUSTOMER SUMMARY
    """
    CREATE TABLE IF NOT EXISTS customer_summary (
        customer_id VARCHAR(50) PRIMARY KEY,
        total_spent DECIMAL(12,2),
        total_orders INT,
        avg_order_value DECIMAL(10,2),
        last_order_date DATETIME,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """,

    # REVIEWS
    """
    CREATE TABLE IF NOT EXISTS reviews (
        review_id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50),
        customer_id VARCHAR(50),
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        review_date DATETIME,

        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """

    ]

    for table in tables:
        cursor.execute(table)

def main():
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )

    cursor = conn.cursor()

    print("Creating database...")
    create_database(cursor)

    print("Creating tables...")
    create_tables(cursor)

    conn.commit()
    cursor.close()
    conn.close()

    print("✅ Database setup complete.")

if __name__ == "__main__":
    main()