import React, { useState } from "react";
import { Layout, Menu, Card, Row, Col, Statistic, Button } from "antd";
import { BarChartOutlined, LogoutOutlined, DollarOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { UserOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  
  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await auth.signOut();
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    }
  };
  const revenueData = [
    { month: "Jan", revenue: 5000 },
    { month: "Feb", revenue: 8000 },
    { month: "Mar", revenue: 12000 },
    { month: "Apr", revenue: 9000 },
    { month: "May", revenue: 15000 },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      
      {/* Main content */}
      <Layout>
        <Header style={{ background: "#fff", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Dashboard</h2>
          <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
        </Header>
        <Content style={{ margin: "10px", paddingLeft:"100px",paddingRight:"100px" }}>
          {selectedTab === "dashboard" && (
            <>
              <Row gutter={16}>
                <Col span={8}><Card><Statistic title="Users" value={1200} prefix={<UserOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Orders" value={320} prefix={<ShoppingCartOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Revenue" value={56000} prefix={<DollarOutlined />} /></Card></Col>
              </Row>
              <Card title="Revenue Overview" style={{ marginTop: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
