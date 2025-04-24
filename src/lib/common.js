export const setLocalStorage = (key, value) => {
  // Nếu là object hoặc array -> stringify, còn lại (chuỗi, số, boolean) -> lưu trực tiếp
  if (typeof value === "object") {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
};

export const getLocalStorage = (key) => {
  const item = localStorage.getItem(key);

  // Thử parse JSON, nếu fail thì trả lại chuỗi ban đầu
  try {
    return JSON.parse(item);
  } catch (e) {
    return item;
  }
};

export const removeLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const formatCurrency = (value) => {
  if (typeof value === "string") value = parseFloat(value);
  if (isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const generateRandomSKU = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sku = "SKU-";
  for (let i = 0; i < 6; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};
