#!/bin/bash
# init-cluster.sh
# Run this ONCE after "docker compose up -d" to wire everything together.
# Wait ~15 seconds after starting containers before running this.

echo "========================================"
echo "  MongoDB Sharded Cluster Init Script"
echo "========================================"

# ─── Step 1: Initialize the Config Server replica set ─────────────
echo ""
echo "[1/4] Initializing config server replica set..."
docker exec configsvr mongosh --eval '
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [{ _id: 0, host: "configsvr:27017" }]
})
'
echo "      Waiting 5s for config server to elect primary..."
sleep 5

# ─── Step 2: Initialize each shard as its own replica set ─────────
echo ""
echo "[2/4] Initializing shard 1 replica set (Punjab)..."
docker exec shard1 mongosh --eval '
rs.initiate({
  _id: "shard1ReplSet",
  members: [{ _id: 0, host: "shard1:27017" }]
})
'

echo "      Initializing shard 2 replica set (Sindh)..."
docker exec shard2 mongosh --eval '
rs.initiate({
  _id: "shard2ReplSet",
  members: [{ _id: 0, host: "shard2:27017" }]
})
'

echo "      Initializing shard 3 replica set (KPK)..."
docker exec shard3 mongosh --eval '
rs.initiate({
  _id: "shard3ReplSet",
  members: [{ _id: 0, host: "shard3:27017" }]
})
'

echo "      Waiting 8s for shards to elect primaries..."
sleep 8

# ─── Step 3: Register shards with the mongos router ───────────────
echo ""
echo "[3/4] Adding shards to the cluster via mongos..."
docker exec mongos mongosh --eval '
sh.addShard("shard1ReplSet/shard1:27017")
sh.addShard("shard2ReplSet/shard2:27017")
sh.addShard("shard3ReplSet/shard3:27017")
'
sleep 3

# ─── Step 4: Enable sharding on the database and collections ──────
echo ""
echo "[4/4] Enabling sharding on ecommerce database and collections..."
docker exec mongos mongosh --eval '
// Enable sharding on the database
sh.enableSharding("ecommerce")

// Create indexes required before sharding each collection
db = db.getSiblingDB("ecommerce")
db.orders.createIndex({ "region": 1 })
db.customers.createIndex({ "address.region": 1 })
db.products.createIndex({ "category": 1 })
db.reviews.createIndex({ "product_id": 1 })
db.suppliers.createIndex({ "region": 1 })

// Shard each collection by its shard key
sh.shardCollection("ecommerce.orders",    { "region": 1 })
sh.shardCollection("ecommerce.customers", { "address.region": 1 })
sh.shardCollection("ecommerce.products",  { "category": 1 })
sh.shardCollection("ecommerce.reviews",   { "product_id": 1 })
sh.shardCollection("ecommerce.suppliers", { "region": 1 })
'

# ─── Done ──────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Cluster ready!"
echo "  Connect your app to: localhost:27017"
echo "  Run: python seed.py  to load data"
echo "========================================"
