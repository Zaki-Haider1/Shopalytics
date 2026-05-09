import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# 🔧 CONFIG
DB_NAME = os.getenv("MYSQL_DB", "ecommerce_warehouse")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "12345")
DB_HOST = os.getenv("MYSQL_HOST", "localhost")

def create_database(cursor):
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cursor.execute(f"USE {DB_NAME}")

    
def create_tables(cursor):
    tables = [

    # REGIONS
    """
    CREATE TABLE IF NOT EXISTS dim_regions (
        region_id INT AUTO_INCREMENT PRIMARY KEY,
        region_name VARCHAR(100) UNIQUE
    )
    """,

    # CUSTOMERS
    """
    CREATE TABLE IF NOT EXISTS dim_customers (
        customer_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        city VARCHAR(100),
        region_id INT,
        country VARCHAR(100) DEFAULT 'Pakistan',
        FOREIGN KEY (region_id) REFERENCES dim_regions(region_id)
    )
    """,

    # PRODUCTS
    """
    CREATE TABLE IF NOT EXISTS dim_products (
        product_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(100),
        sub_category VARCHAR(100),
        brand VARCHAR(100),
        price DECIMAL(10,2),
        supplier_id VARCHAR(255)
    )
    """,

    # DATE
    """
    CREATE TABLE IF NOT EXISTS dim_date (
        date_id INT PRIMARY KEY,
        full_date DATE,
        day INT,
        month INT,
        month_name VARCHAR(20),
        quarter INT,
        year INT
    )
    """,

    # FACT ORDERS
    """
    CREATE TABLE IF NOT EXISTS fact_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255),
        customer_id VARCHAR(255),
        product_id VARCHAR(255),
        region_id INT,
        date_id INT,
        quantity INT,
        unit_price DECIMAL(10,2),
        discount DECIMAL(10,2),
        subtotal DECIMAL(10,2),
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        order_status VARCHAR(50),
        FOREIGN KEY (customer_id) REFERENCES dim_customers(customer_id),
        FOREIGN KEY (product_id) REFERENCES dim_products(product_id),
        FOREIGN KEY (region_id) REFERENCES dim_regions(region_id),
        FOREIGN KEY (date_id) REFERENCES dim_date(date_id)
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

    print("Database setup complete.")

if __name__ == "__main__":
    main()