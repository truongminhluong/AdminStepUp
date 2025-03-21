import { db } from "./firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";

export const getOrdersFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng từ Firebase:", error);
    return [];
  }
};


