import {collection, getDocs, query, where, orderBy, limit, Timestamp} from "firebase/firestore";
import {db} from "../firebase/firebaseConfig";

export const getDashboardStats = async () => {
    try {
        const completedOrdersQuery = query(
            collection(db, "orders"),
            where("status", "==", "Hoàn tất")
        );

        const [orders, users, products] = await Promise.all([
            getDocs(completedOrdersQuery),
            getDocs(collection(db, "users")),
            getDocs(collection(db, "products"))
        ]);

        const ordersData = orders.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const usersData = users.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const productsData = products.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const totalOrders = ordersData.length;
        const completedOrders = ordersData.filter(order => order.status === "Hoàn tất").length;
        const pendingOrders = ordersData.filter(order => order.status === "Chờ xử lý").length;
        const processingOrders = ordersData.filter(order => order.status === "Đang xử lý").length;
        const shippingOrders = ordersData.filter(order => order.status === "Đang giao hàng").length;
        const cancelledOrders = ordersData.filter(order => order.status === "Đã hủy").length;

        const totalRevenue = ordersData
            .filter(order => order.status === "Hoàn tất")
            .reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

        const totalUsers = usersData.length;
        const activeUsers = usersData.filter(user => {
            const lastLogin = new Date(user.lastLoginAt || user.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastLogin > thirtyDaysAgo;
        }).length;

        const totalProducts = productsData.length;
        const inStockProducts = productsData.filter(product => product.stock > 0).length;

        return {
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders,
                processing: processingOrders,
                shipping: shippingOrders,
                cancelled: cancelledOrders
            },
            revenue: {
                total: totalRevenue,
                average: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers
            },
            products: {
                total: totalProducts,
                inStock: inStockProducts,
                outOfStock: totalProducts - inStockProducts
            }
        };
    } catch (error) {
        console.error("Lỗi khi lấy thống kê dashboard:", error);
        throw error;
    }
};

export const getRevenueByDateRange = async (startDate, endDate) => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("status", "==", "Hoàn tất"));

        const querySnapshot = await getDocs(q);
        const allOrders = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const startDateTime = new Date(startDate + 'T00:00:00');
        const endDateTime = new Date(endDate + 'T23:59:59');

        const filteredOrders = allOrders.filter(order => {
            let orderDate;

            if (order.createdAt) {
                if (order.createdAt.toDate) {
                    orderDate = order.createdAt.toDate();
                } else if (typeof order.createdAt === 'string') {
                    orderDate = new Date(order.createdAt);
                } else if (order.createdAt.seconds) {
                    orderDate = new Date(order.createdAt.seconds * 1000);
                } else {
                    orderDate = new Date(order.createdAt);
                }
            } else {
                return false;
            }

            const orderTime = orderDate.getTime();
            const isInRange = orderTime >= startDateTime.getTime() && orderTime <= endDateTime.getTime();

            return isInRange;
        });

        const revenueByMonth = {};

        filteredOrders.forEach(order => {
            let orderDate;
            if (order.createdAt.toDate) {
                orderDate = order.createdAt.toDate();
            } else if (typeof order.createdAt === 'string') {
                orderDate = new Date(order.createdAt);
            } else if (order.createdAt.seconds) {
                orderDate = new Date(order.createdAt.seconds * 1000);
            } else {
                orderDate = new Date(order.createdAt);
            }

            const monthKey = `${String(orderDate.getMonth() + 1).padStart(2, '0')}/${String(orderDate.getFullYear()).slice(-2)}`;

            if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = {
                    date: monthKey,
                    revenue: 0,
                    orders: 0
                };
            }

            const orderTotal = order.totalPrice || order.totalAmount || 0;
            revenueByMonth[monthKey].revenue += orderTotal;
            revenueByMonth[monthKey].orders += 1;
        });


        const result = [];
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const monthsInRange = new Set();

        const currentDate = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
        const endMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), 1);

        while (currentDate <= endMonth) {
            const monthKey = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;
            monthsInRange.add(monthKey);

            result.push(revenueByMonth[monthKey] || {
                date: monthKey,
                revenue: 0,
                orders: 0
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        result.sort((a, b) => {
            const [monthA, yearA] = a.date.split('/');
            const [monthB, yearB] = b.date.split('/');
            const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1);
            const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1);
            return dateA - dateB;
        });

        console.log("Final result (by month):", result);
        return result;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu theo thời gian:", error);
        throw error;
    }
};

export const getRecentOrders = async () => {
    try {
        const ordersRef = collection(db, "orders");
        const querySnapshot = await getDocs(ordersRef);
        const allOrders = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const recentOrders = allOrders
            .sort((a, b) => {
                let dateA, dateB;

                if (a.createdAt && a.createdAt.toDate) {
                    dateA = a.createdAt.toDate();
                } else if (a.createdAt) {
                    dateA = new Date(a.createdAt);
                } else {
                    dateA = new Date(0);
                }

                if (b.createdAt && b.createdAt.toDate) {
                    dateB = b.createdAt.toDate();
                } else if (b.createdAt) {
                    dateB = new Date(b.createdAt);
                } else {
                    dateB = new Date(0);
                }

                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5);

        return recentOrders;
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng gần đây:", error);
        throw error;
    }
};

export const getTopSellingProducts = async (limitCount = 5) => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("status", "==", "Hoàn tất"));

        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const productSales = {};

        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productId = item.product_id || item.id || item.name;
                    console.log(item)
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            productId,
                            productName: item.name || item.product_name || 'Sản phẩm không xác định',
                            totalSold: 0,
                            totalRevenue: 0,
                            image: item.product_image || ''
                        };
                    }
                    productSales[productId].totalSold += item.quantity || 1;
                    productSales[productId].totalRevenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });

        return Object.values(productSales)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, limitCount);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
        throw error;
    }
};

export const getMonthlyStats = async (year = new Date().getFullYear()) => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("status", "==", "Hoàn tất"));
        const querySnapshot = await getDocs(q);

        const allOrders = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        const yearOrders = allOrders.filter(order => {
            if (!order.createdAt) return false;

            let orderDate;
            if (order.createdAt.toDate) {
                orderDate = order.createdAt.toDate();
            } else if (typeof order.createdAt === 'string') {
                orderDate = new Date(order.createdAt);
            } else {
                orderDate = new Date(order.createdAt);
            }

            return orderDate.getFullYear() === year;
        });

        const monthlyData = Array.from({length: 12}, (_, index) => ({
            month: `T${index + 1}`,
            revenue: 0,
            orders: 0,
            completedOrders: 0
        }));

        yearOrders.forEach(order => {
            let orderDate;
            if (order.createdAt.toDate) {
                orderDate = order.createdAt.toDate();
            } else if (typeof order.createdAt === 'string') {
                orderDate = new Date(order.createdAt);
            } else {
                orderDate = new Date(order.createdAt);
            }

            const monthIndex = orderDate.getMonth();

            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].orders += 1;

                if (order.status === "Hoàn tất") {
                    monthlyData[monthIndex].revenue += order.totalPrice || 0;
                    monthlyData[monthIndex].completedOrders += 1;
                }
            }
        });

        return monthlyData;
    } catch (error) {
        console.error("Lỗi khi lấy thống kê theo tháng:", error);
        throw error;
    }
};