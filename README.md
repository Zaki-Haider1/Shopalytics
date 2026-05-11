# 🛒 Shopalytics

Shopalytics is a high-performance, full-stack E-commerce platform designed with scalability and data analytics at its core. Built for a 4th-semester project, it features a distributed architecture using a **MongoDB Sharded Cluster**, a **Flask** backend, and a modern **React** frontend.

## 🚀 Key Features

- **Scalable Architecture**: Utilizes MongoDB Sharding (3 Shards + Config Server) for high-volume data handling.
- **Analytics Dashboard**: Integrated data warehouse using MySQL and Pandas for advanced business intelligence.
- **AI Chatbot**: Powered by Google Gemini to assist users and provide product recommendations.
- **Modern UI**: Smooth animations with Framer Motion and a responsive design using CSS.
- **Admin Panel**: Comprehensive management for products, orders, and sales analytics.
- **Full Auth System**: Secure authentication using Bcrypt hashing.

## 🛠️ Tech Stack

- **Frontend**: [React.js](https://reactjs.org/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Backend**: [Flask](https://flask.palletsprojects.com/), [PyMongo](https://pymongo.readthedocs.io/), [Pandas](https://pandas.pydata.org/)
- **Databases**: 
  - **Primary (NoSQL)**: MongoDB (Sharded Cluster)
  - **Analytics (SQL)**: MySQL (Warehouse)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **Containerization**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

---

## ⚙️ Installation & Setup

### Prerequisites
- Docker & Docker Desktop
- Node.js (for local frontend dev)
- Python 3.9+ (for local backend dev)

### 1. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env

MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DB=ecommerce_warehouse

MONGO_URI=mongodb://localhost:27017/
MONGODB_DB=ecommerce

GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3-flash-preview (for free gemin api key, otherwise use whichever model you prefer)

```

### 2. Launching with Docker
The easiest way to get started is using Docker Compose:
```bash
docker-compose up -d --build
```

### 3. Initialize the MongoDB Cluster
After the containers are running, you **must** initialize the sharded cluster:
```bash
# On Windows (PowerShell)
./init-cluster.ps1

# On Linux/macOS
chmod +x init-cluster.sh
./init-cluster.sh
```

### 4. Seed the Database
Populate the database with sample products and data:
```bash
cd backend
python seed.py
```

---

## 🔑 Admin Access

To access the administrative features and the analytics dashboard:

1. Go to the **Register** page.
2. Register a new account using the email: **`admin@shopalytics.com`**.
3. Use any password you like.
4. **Login** with this account.
5. You will now have access to the **Admin Dashboard** route.

---

## 📁 Project Structure

```text
├── backend/
│   ├── routes/          # API Endpoints (Admin, Auth, Store)
│   ├── app.py           # Main Entry Point
│   ├── chatbot.py       # AI Implementation
│   ├── etl.py           # Data Processing for Warehouse
│   └── warehouse.py     # MySQL Interaction
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI Components
│   │   ├── pages/       # Route-level components
│   │   └── services/    # API calling logic
├── docker-compose.yaml  # Infrastructure definition
└── init-cluster.sh      # DB Sharding Automation
```

## 📈 Analytics & BI
Shopalytics isn't just a store; it's a data engine. The project implements an ETL (Extract, Transform, Load) pipeline that moves transactional data from MongoDB into a MySQL-based Warehouse, where it is analyzed using Pandas to generate the insights seen in the Admin Dashboard.

## 📄 License
This project was developed for educational purposes as part of the 4th-semester curriculum.
