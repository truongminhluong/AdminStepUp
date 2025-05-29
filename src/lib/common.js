// ✅ Lưu vào localStorage (nếu là object sẽ được stringify)
export const setLocalStorage = (key, value) => {
  try {
    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, storedValue);
  } catch (error) {
    console.error("setLocalStorage error:", error);
  }
};

// ✅ Lấy từ localStorage, tự động parse nếu là JSON, trả raw string nếu không
export const getLocalStorage = (key) => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    return JSON.parse(item);
  } catch (error) {
    return item; // Có thể là chuỗi thuần như token JWT
  }
};

// ✅ Xóa khỏi localStorage
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("removeLocalStorage error:", error);
  }
};

// ✅ Format giá theo VND
export const formatCurrency = (value) => {
  if (typeof value === "string") value = parseFloat(value);
  if (isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// ✅ Tạo mã SKU ngẫu nhiên
export const generateRandomSKU = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sku = "SKU-";
  for (let i = 0; i < 6; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};

// ✅ Cấu hình toolbar cho trình soạn thảo Quill
export const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image", "clean"],
  ],
};

// ✅ Các định dạng hỗ trợ cho Quill
export const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "align",
  "link",
  "image",
];

// ✅ Format ngày theo định dạng tiếng Việt
export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
