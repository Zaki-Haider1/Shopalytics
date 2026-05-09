from flask import Blueprint, jsonify, request
from db import products_collection, orders_collection
from bson import ObjectId
import datetime

store_routes = Blueprint("store", __name__)

# ─── GET ALL PRODUCTS (FROM MONGODB) ──────────────────────────────
@store_routes.route("/products", methods=["GET"])
def get_products():
    try:
        # Fetch all products from MongoDB
        products = list(products_collection.find())
        
        # Convert ObjectId to string for JSON serialization
        for p in products:
            p["_id"] = str(p["_id"])
            
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── GET SINGLE PRODUCT ───────────────────────────────────────────
@store_routes.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        # Try finding by string ID first (for legacy/seeded data)
        product = products_collection.find_one({"_id": product_id})
        
        # If not found, try as a MongoDB ObjectId (for new form-added data)
        if not product:
            try:
                product = products_collection.find_one({"_id": ObjectId(product_id)})
            except:
                pass
                
        if not product:
            return jsonify({"error": "Product not found"}), 404
            
        product["_id"] = str(product["_id"])
        return jsonify(product), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── GET CUSTOMER ORDERS ──────────────────────────────────────────
@store_routes.route("/orders", methods=["GET"])
def get_orders():
    try:
        # For now, fetch all orders (in a real app, you'd filter by user_id)
        # Sorting by date descending to show newest first
        orders = list(orders_collection.find().sort("order_date", -1).limit(20))
        
        for o in orders:
            o["_id"] = str(o["_id"])
            if "order_date" in o:
                o["order_date"] = o["order_date"].strftime("%Y-%m-%d %H:%M")
                
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── PLACE ORDER (CHECKOUT) ───────────────────────────────────────
@store_routes.route("/checkout", methods=["POST"])
def place_order():
    try:
        data = request.json
        
        # Expected data: { "customer_id": "...", "items": [...], "total_amount": 0 }
        order = {
            "customer_id": data.get("customer_id", "guest"), # Default to guest if not logged in
            "order_date": datetime.datetime.utcnow(),
            "status": "pending",
            "items": data.get("items", []),
            "total_amount": data.get("total_amount", 0),
            "payment_method": "cash_on_delivery", # Simplified as requested
            "shipping_address": data.get("address", "N/A")
        }
        
        # Insert into MongoDB
        result = orders_collection.insert_one(order)
        
        return jsonify({
            "message": "Order placed successfully!",
            "order_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Checkout Error: {e}")
        return jsonify({"error": str(e)}), 500
