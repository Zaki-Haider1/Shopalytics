Write-Host "========================================"
Write-Host "  MongoDB Sharded Cluster Init Script"
Write-Host "========================================"

# ─── Step 1: Config Server ─────────────────────────────
Write-Host ""
Write-Host "[1/4] Initializing config server replica set..."

docker exec configsvr mongosh --eval @'
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "configsvr:27017" }
  ]
})
'@

Write-Host "Waiting 5s for config server to elect primary..."
Start-Sleep -Seconds 5


# ─── Step 2: Shards ────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Initializing shard replica sets..."

docker exec shard1 mongosh --eval @'
rs.initiate({
  _id: "shard1ReplSet",
  members: [{ _id: 0, host: "shard1:27017" }]
})
'@

docker exec shard2 mongosh --eval @'
rs.initiate({
  _id: "shard2ReplSet",
  members: [{ _id: 0, host: "shard2:27017" }]
})
'@

docker exec shard3 mongosh --eval @'
rs.initiate({
  _id: "shard3ReplSet",
  members: [{ _id: 0, host: "shard3:27017" }]
})
'@

Write-Host "Waiting 8s for shards to elect primaries..."
Start-Sleep -Seconds 8


# ─── Step 3: Add Shards ────────────────────────────────
Write-Host ""
Write-Host "[3/4] Adding shards to mongos..."

docker exec mongos mongosh --eval @'
sh.addShard("shard1ReplSet/shard1:27017")
sh.addShard("shard2ReplSet/shard2:27017")
sh.addShard("shard3ReplSet/shard3:27017")
'@

Start-Sleep -Seconds 3


# ─── Step 4: Enable Sharding ───────────────────────────
Write-Host ""
Write-Host "[4/4] Enabling sharding on ecommerce DB..."

docker exec mongos mongosh --eval @'
sh.enableSharding("ecommerce")

db = db.getSiblingDB("ecommerce")

db.orders.createIndex({ region: 1 })
db.customers.createIndex({ "address.region": 1 })
db.products.createIndex({ category: 1 })
db.reviews.createIndex({ product_id: 1 })
db.suppliers.createIndex({ region: 1 })

sh.shardCollection("ecommerce.orders",    { region: 1 })
sh.shardCollection("ecommerce.customers", { "address.region": 1 })
sh.shardCollection("ecommerce.products",  { category: 1 })
sh.shardCollection("ecommerce.reviews",   { product_id: 1 })
sh.shardCollection("ecommerce.suppliers", { region: 1 })
'@


# ─── Done ─────────────────────────────────────────────
Write-Host ""
Write-Host "========================================"
Write-Host "  Cluster ready!"
Write-Host "  Connect your app to: localhost:27017"
Write-Host "  Run: python seed.py to load data"
Write-Host "========================================"