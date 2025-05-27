import {collection, doc, getDoc, getDocs, updateDoc, arrayUnion} from "firebase/firestore";
import {db} from "../firebase/firebaseConfig";

const ORDER_STATUSES = [
    "Chờ xử lý ",
    "Đang xử lý",
    "Đang giao hàng",
    "Hoàn tất",
    "Đã hủy"
];

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

export const getOrderById = async (orderId) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            return {id: orderSnap.id, ...orderSnap.data()};
        } else {
            throw new Error("Đơn hàng không tồn tại");
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng từ Firebase:", error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, newStatus) => {
    if (!ORDER_STATUSES.includes(newStatus)) {
        throw new Error("Trạng thái không hợp lệ");
    }

    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error("Đơn hàng không tồn tại");
        }

        const currentStatus = orderSnap.data().status;
        const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
        const newIndex = ORDER_STATUSES.indexOf(newStatus);

        // Không cho phép thay đổi trạng thái nếu đơn đã hoàn tất hoặc đã hủy
        if (["Hoàn tất", "Đã hủy"].includes(currentStatus)) {
            throw new Error(`Không thể thay đổi trạng thái đơn hàng đã "${currentStatus}"`);
        }

        // Không cho phép hủy nếu đơn đang ở trạng thái từ "Đang giao hàng" trở đi
        if (
            newStatus === "Đã hủy" &&
            currentIndex >= ORDER_STATUSES.indexOf("Đang giao hàng")
        ) {
            throw new Error(`Không thể hủy đơn hàng đang ở trạng thái "${currentStatus}"`);
        }

        // Chỉ cho phép chuyển sang trạng thái tiếp theo
        const isValidTransition = newIndex === currentIndex + 1;

        if (!isValidTransition) {
            throw new Error(`Không thể chuyển từ "${currentStatus}" sang "${newStatus}"`);
        }

        await updateDoc(orderRef, {
            status: newStatus,
            statusHistory: arrayUnion({
                status: newStatus,
                changedAt: new Date().toISOString(),
            })
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        throw error;
    }
};

export const updateOrderCustomerInfo = async (id, values) =>{
    try {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, {
            customerName: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            note: values.note,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating customer info:', error);
        throw new Error('Không thể cập nhật thông tin khách hàng');
    }
}

