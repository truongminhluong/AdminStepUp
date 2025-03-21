import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
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
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, product);
        console.log("Document updated with ID: ", id);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
};