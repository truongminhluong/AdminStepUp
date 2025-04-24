import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const getProductsFromFireBase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductDetail = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data(),
      };
    } else {
      console.log("Không tìm thấy sản phẩm!");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

export const storeProductFromFireBase = async (product) => {
  try {
    const docRef = await addDoc(collection(db, "products"), product, {});
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const deleteProductFromFireBase = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const updateProductInFireBase = async (id, product) => {
    try {
      // Remove undefined values from product object
      const cleanProduct = Object.entries(product).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
  
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, cleanProduct);
      console.log("Document updated with ID: ", id);
      return true;
    } catch (error) {
      console.error("Error updating document: ", error);
      throw error; // Re-throw the error so it can be handled by the calling function
    }
  };
