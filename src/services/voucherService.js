// services/voucherService.js
import { db } from "../firebase/firebaseConfig"; // Giả sử bạn đang dùng Firebase Firestore

export const fetchVoucherStats = async () => {
  try {
    const snapshot = await db.collection("vouchers").get(); // Giả sử bạn đang lấy dữ liệu từ Firestore
    return snapshot.docs.map(doc => doc.data()); // Chuyển đổi các dữ liệu thành mảng
  } catch (error) {
    console.error("Error fetching voucher stats:", error);
    throw error;
  }
};
