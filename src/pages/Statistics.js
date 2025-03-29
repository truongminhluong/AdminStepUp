import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig"; // Đảm bảo đường dẫn đúng
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalOrders: 0,
    soldOrders: 0,
    soldProducts: 0,
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      const querySnapshot = await getDocs(collection(db, "sales"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setSalesData(data);
    };

    const fetchUserStats = async () => {
      const querySnapshot = await getDocs(collection(db, "userStats"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setUserStats(data);
    };

    const fetchTopSellingProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "topSellingProducts"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setTopSellingProducts(data);
    };

    const fetchSummary = async () => {
      const querySnapshot = await getDocs(collection(db, "summary"));
      if (!querySnapshot.empty) {
        setSummary(querySnapshot.docs[0].data());
      }
    };

    fetchSalesData();
    fetchUserStats();
    fetchTopSellingProducts();
    fetchSummary();
  }, []);

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-5">Thống kê</h1>

      {/* Thống kê tổng quan */}
      <div className="flex flex-wrap justify-between gap-4 mb-10">
        {[
          { label: "TỔNG TÀI KHOẢN", value: summary.totalUsers },
          { label: "TỔNG ĐƠN HÀNG", value: summary.totalOrders },
          { label: "ĐƠN HÀNG ĐÃ BÁN", value: summary.soldOrders },
          { label: "SẢN PHẨM ĐÃ BÁN", value: summary.soldProducts },
        ].map((item, index) => (
          <div
            key={index}
            className="flex-1 min-w-[150px] p-4 bg-gray-800 rounded-lg text-center"
          >
            <p className="text-sm">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Biểu đồ cột thống kê số sản phẩm đã bán */}
      <div className="mb-10 bg-gray-800 p-5 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Thống kê lượng sản phẩm đã bán trong 12 tháng
        </h2>
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
            <Pie
              data={userStats}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {userStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng thống kê sản phẩm bán chạy */}
      <div className="bg-gray-800 p-5 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Thống kê sản phẩm bán chạy
        </h2>
        <table className="w-full text-white border border-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">ID</th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">Tên Sản Phẩm</th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">
                Số Lượng Đã Bán
              </th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">Loại</th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">Giá Nhập</th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">Giá Bán</th>
              <th className="p-4 px-8 border border-gray-600 min-w-[120px]">Ghi Chú</th>
            </tr>
          </thead>

          <tbody>
            {topSellingProducts.map((product, index) => (
              <tr key={index} className="text-center">
                <td className="p-4 px-6 border border-gray-600">{product.id}</td>
                <td className="p-4 px-6 border border-gray-600">{product.name}</td>
                <td className="p-4 px-6 border border-gray-600">
                  {product.quantity}
                </td>
                <td className="p-4 px-6 border border-gray-600">
                  {product.category}
                </td>
                <td className="p-4 px-6 border border-gray-600">
                  {product.priceIn}
                </td>
                <td className="p-4 px-6 border border-gray-600">
                  {product.priceOut}
                </td>
                <td className="p-4 px-6 border border-gray-600">{product.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
