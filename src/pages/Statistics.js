import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const salesData = [
    { month: "T1", sales: 4 },
    { month: "T2", sales: 22 },
    { month: "T3", sales: 5 },
    { month: "T4", sales: 5 },
    { month: "T5", sales: 6 },
    { month: "T6", sales: 6 },
    { month: "T7", sales: 8 },
    { month: "T8", sales: 8 },
    { month: "T9", sales: 9 },
    { month: "T10", sales: 9 },
    { month: "T11", sales: 10 },
    { month: "T12", sales: 6 },
];

const userStats = [
    { name: "Dưới 25 tuổi", value: 71.4, color: "#0043ff" },
    { name: "Trên 25 tuổi", value: 28.6, color: "#ff3d3d" },
];

const topSellingProducts = [
    { id: 1, name: "Giày LV", quantity: 3, category: "LV", priceIn: "220,000 đ", priceOut: "298,000 đ", note: "Giày đi là thối chân" },
    { id: 2, name: "Giày GC", quantity: 3, category: "GC", priceIn: "250,000 đ", priceOut: "299,999 đ", note: "Giày đi 1 tuần là bay đế" },
];

const Dashboard = () => {
    return (
        <div className="p-5 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-5">Thống kê</h1>

            {/* Thống kê tổng quan */}
            <div className="flex flex-wrap justify-between gap-4 mb-10">
                {[
                    { label: "TỔNG TÀI KHOẢN", value: 7 },
                    { label: "TỔNG ĐƠN HÀNG", value: 14 },
                    { label: "ĐƠN HÀNG ĐÃ BÁN", value: 3 },
                    { label: "SẢN PHẨM ĐÃ BÁN", value: 6 },
                ].map((item, index) => (
                    <div key={index} className="flex-1 min-w-[150px] p-4 bg-gray-800 rounded-lg text-center">
                        <p className="text-sm">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Biểu đồ cột thống kê số sản phẩm đã bán */}
            <div className="mb-10 bg-gray-800 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Thống kê lượng sản phẩm đã bán trong 12 tháng</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                        <XAxis dataKey="month" stroke="black" />
                        <YAxis stroke="black" />
                        <Tooltip cursor={{ fill: "#c3c3c3" }} />
                        <Bar dataKey="sales" fill="#1e90ff" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ tròn thống kê người dùng */}
            <div className="mb-10 bg-gray-800 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Thống kê người dùng</h2>
                <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
<Pie data={userStats} dataKey="value" nameKey="name" outerRadius={80} label>
                            {userStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bảng thống kê sản phẩm bán chạy */}
            <div className="bg-gray-800 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Thống kê sản phẩm bán chạy</h2>
                <table className="w-full text-white border border-gray-700">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="p-2 border border-gray-600">ID</th>
                            <th className="p-2 border border-gray-600">Tên Sản Phẩm</th>
                            <th className="p-2 border border-gray-600">Số Lượng Đã Bán</th>
                            <th className="p-2 border border-gray-600">Loại</th>
                            <th className="p-2 border border-gray-600">Giá Nhập</th>
                            <th className="p-2 border border-gray-600">Giá Bán</th>
                            <th className="p-2 border border-gray-600">Ghi Chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topSellingProducts.map((product) => (
                            <tr key={product.id} className="text-center">
                                <td className="p-2 border border-gray-600">{product.id}</td>
                                <td className="p-2 border border-gray-600">{product.name}</td>
                                <td className="p-2 border border-gray-600">{product.quantity}</td>
                                <td className="p-2 border border-gray-600">{product.category}</td>
                                <td className="p-2 border border-gray-600">{product.priceIn}</td>
                                <td className="p-2 border border-gray-600">{product.priceOut}</td>
                                <td className="p-2 border border-gray-600">{product.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
