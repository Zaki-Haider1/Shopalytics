const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const registerUser = async (formData) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return res.json();
};

export const loginUser = async (formData) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return res.json();
};

export const getAdminData = async () => {
  const res = await fetch(`${BASE_URL}/api/admin/dashboard`);
  return res.json();
};

export const getAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/api/admin/analytics`);
  return res.json();
};

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/api/store/products`);
  return res.json();
};

export const getProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/api/store/products/${id}`);
  return res.json();
};

export const placeOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/api/store/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  return res.json();
};

export const getOrders = async (userId) => {
  const url = userId ? `${BASE_URL}/api/store/orders?customer_id=${userId}` : `${BASE_URL}/api/store/orders`;
  const res = await fetch(url);
  return res.json();
};

export const updateProduct = async (id, product) => {
  const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
};

export const patchProductStock = async (id, change) => {
  const res = await fetch(`${BASE_URL}/api/admin/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock_change: change }),
  });
  return res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/api/store/categories`);
  return res.json();
};

export const getCart = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/store/cart/${userId}`);
  return res.json();
};

export const updateCart = async (userId, cart) => {
  const res = await fetch(`${BASE_URL}/api/store/cart/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart }),
  });
  return res.json();
};

export const getUserInfo = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/store/user-info/${userId}`);
  return res.json();
};