import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const getCategories = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return categories;
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        return [];
    }
};


export const storeCategory = async (category) => {
    try {
        const docRef = await addDoc(collection(db, "categories"), category);

        return docRef.id
    } catch (error) {
        toast.error(error)
    }
}

export const deleteCategory = async (id) => {
    try {
        await deleteDoc(doc(db, "categories", id));
    } catch (error) {
        toast.error("Lỗi khi xóa danh mục!");
    }
};

export const updateCategory = async (id, updatedData) => {
    try {
        const categoryRef = doc(db, "categories", id);
        await updateDoc(categoryRef, updatedData);
    } catch (error) {
        toast.error("Lỗi khi cập nhật danh mục!");
    }
};