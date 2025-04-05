import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const getBrands = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "brands"));
        const brands = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return brands;
    } catch (error) {
        console.error("Lỗi khi lấy thương hiệu:", error);
        return [];
    }
};


export const storeBrand = async (Brand) => {
    try {
        const docRef = await addDoc(collection(db, "brands"), Brand);

        if (docRef.id) {
            toast.success('Thao tác thành công')
        }

        return
    } catch (error) {
        toast.error(error)
    }
}

export const deleteBrand = async (id) => {
    try {
        await deleteDoc(doc(db, "brands", id));
        toast.success("Thao tác thành công");
    } catch (error) {
        toast.error("Lỗi khi xóa thương hiệu");
    }
};

export const updateBrand = async (id, updatedData) => {
    try {
        const BrandRef = doc(db, "brands", id);
        await updateDoc(BrandRef, updatedData);
        toast.success("Thao tác thành công");
    } catch (error) {
        toast.error("Lỗi khi cập nhật thương hiệu");
    }
};