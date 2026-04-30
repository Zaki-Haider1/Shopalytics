const BASE_URL = "http://localhost:5000";

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
  const res = await fetch(`${BASE_URL}/api/admin/products`);
  return res.json();
};

export const updateProduct = async (product) => {
  const res = await fetch(`${BASE_URL}/api/admin/products/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
};
