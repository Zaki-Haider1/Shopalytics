from flask import Blueprint, jsonify, request
from db import products_collection, orders_collection, users_collection
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
            
        return jsonify({
            "success": True,
            "products": products
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

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
        return jsonify({
            "success": True,
            "product": product
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ─── GET CUSTOMER ORDERS ──────────────────────────────────────────
@store_routes.route("/orders", methods=["GET"])
def get_orders():
    try:
        customer_id = request.args.get("customer_id")
        query = {}
        if customer_id:
            query["customer_id"] = customer_id
            
        # Fetch orders based on query
        orders = list(orders_collection.find(query).sort("order_date", -1).limit(50))
        
        for o in orders:
            o["_id"] = str(o["_id"])
            if "order_date" in o:
                o["order_date"] = o["order_date"].strftime("%Y-%m-%d %H:%M")
                
        return jsonify({
            "success": True,
            "orders": orders
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ─── PLACE ORDER (CHECKOUT) ───────────────────────────────────────
@store_routes.route("/checkout", methods=["POST"])
def place_order():
    try:
        data = request.json
        
        # Expected data: { "customer_id": "...", "items": [...], "total_amount": 0, "shipping_info": {...}, "payment_method": "..." }
        order = {
            "customer_id": data.get("customer_id", "guest"),
            "order_date": datetime.datetime.utcnow(),
            "status": "pending",
            "items": data.get("items", []),
            "total_amount": data.get("total_amount", 0),
            "payment_method": data.get("payment_method", "cash"),
            "shipping_address": data.get("shipping_address", "N/A"),
            "customer_details": data.get("customer_details", {}) # Name, email, phone etc.
        }
        
        # Insert into MongoDB
        result = orders_collection.insert_one(order)
        
        return jsonify({
            "success": True,
            "message": "Order placed successfully!",
            "order_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Checkout Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ─── GET USER INFO FOR CHECKOUT ──────────────────────────────────
@store_routes.route("/user-info/<user_id>", methods=["GET"])
def get_user_info(user_id):
    try:
        user = users_collection.find_one({"_id": user_id})
        if not user:
            try:
                user = users_collection.find_one({"_id": ObjectId(user_id)})
            except:
                pass
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        return jsonify({
            "success": True,
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": user.get("phone"),
                "address": user.get("address"),
                "city": user.get("city"),
                "region": user.get("region")
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@store_routes.route("/categories", methods=["GET"])
def get_categories():
    try:
        categories = products_collection.distinct("category")
        return jsonify({
            "success": True,
            "categories": categories
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ─── GET CUSTOMER CART ────────────────────────────────────────────
@store_routes.route("/cart/<user_id>", methods=["GET"])
def get_cart(user_id):
    try:
        user = users_collection.find_one({"_id": user_id})
        if not user:
            # Try as ObjectId if not found as string
            try:
                user = users_collection.find_one({"_id": ObjectId(user_id)})
            except:
                pass
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        return jsonify({
            "success": True,
            "cart": user.get("cart", [])
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ─── UPDATE CUSTOMER CART ─────────────────────────────────────────
@store_routes.route("/cart/<user_id>", methods=["POST"])
def update_cart(user_id):
    try:
        data = request.json
        cart = data.get("cart", [])
        
        # Update user's cart in MongoDB
        result = users_collection.update_one(
            {"_id": user_id},
            {"$set": {"cart": cart}}
        )
        
        # If not matched, try as ObjectId
        if result.matched_count == 0:
            try:
                result = users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"cart": cart}}
                )
            except:
                pass
                
        if result.matched_count == 0:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        return jsonify({
            "success": True,
            "message": "Cart updated successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500