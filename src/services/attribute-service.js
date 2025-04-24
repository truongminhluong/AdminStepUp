import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const getAttributes = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "attributes"));
        const attributes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return attributes;
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        return [];
    }
};


export const storeAttribute = async (category) => {
    try {
        const docRef = await addDoc(collection(db, "attributes"), category);
        return docRef.id;
    } catch (error) {
        toast.error(error)
    }
}

export const deleteAttribute = async (id) => {
    try {
        await deleteDoc(doc(db, "attributes", id));
    } catch (error) {
        toast.error("Lỗi khi xóa danh mục!");
    }
};

export const updateAttribute = async (id, updatedData) => {
    try {
        const categoryRef = doc(db, "attributes", id);
        await updateDoc(categoryRef, updatedData);
    } catch (error) {
        toast.error("Lỗi khi cập nhật danh mục!");
    }
};