import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Button } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";


export default function HomePage() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("home");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const customersSnapshot = await getDocs(collection(db, "customers"));

      let totalRevenue = 0;
      const orders = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        totalRevenue += data.total;
        return { key: doc.id, ...data };
      });

      setStats({
        revenue: totalRevenue,
        orders: ordersSnapshot.size,
        customers: customersSnapshot.size,
      });

      setRecentOrders(orders.slice(0, 5));
    };

    fetchData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      }
      setLoading(false); // ✅ Chỉ set loading sau khi kiểm tra xong
    });

    return () => unsubscribe();
  }, [navigate]);
  if (loading) return null; // ✅ Ngăn chặn giao diện hiển thị trước khi xác thực xong
  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      try {
        await auth.signOut();
        localStorage.removeItem("isLoggedIn");
        navigate("/login", { replace: true }); // Thêm { replace: true } để ngăn quay lại trang trước đó
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
    }
  };

  return (   
     <div className="p-4">
    <div className="flex justify-between items-center"  style={{ background: "#fff", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px" }}>
        <h1 className="text-xl font-bold" style={{alignContent:"center",margin: "20px"}}>Trang chủ</h1>
        <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>

      <Row gutter={16} className="mt-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.revenue}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.orders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.customers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <h2 className="text-lg font-semibold mt-6 mb-4">Đơn hàng gần đây</h2>
      <Table
        dataSource={recentOrders}
        columns={[
          { title: "Mã đơn hàng", dataIndex: "orderId", key: "orderId" },
          { title: "Khách hàng", dataIndex: "customer", key: "customer" },
          { title: "Tổng tiền", dataIndex: "total", key: "total" },
          { title: "Trạng thái", dataIndex: "status", key: "status" },
        ]}
      />
    </div>
  );
  return <div>Trang chủ</div>;
}
