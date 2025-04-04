import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Avatar,
  Typography,
  Dropdown,
  Space,
  Divider,
  Tag,
  Table,
} from "antd";
import {
  BarChartOutlined,
  LogoutOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await auth.signOut();
      logout();
      localStorage.clear();
      navigate("/login");
    }
  };

  const revenueData = [
    { month: "T1", revenue: 5000 },
    { month: "T2", revenue: 8000 },
    { month: "T3", revenue: 12000 },
    { month: "T4", revenue: 9000 },
    { month: "T5", revenue: 15000 },
    { month: "T6", revenue: 18000 },
  ];

  const recentOrders = [
    {
      id: "1",
      customer: "Trần Văn B",
      total: 1250000,
      status: "Completed",
      date: "01/04/2025",
    },
    {
      id: "2",
      customer: "Nguyễn Thị C",
      total: 850000,
      status: "Processing",
      date: "31/03/2025",
    },
    {
      id: "3",
      customer: "Lê Minh D",
      total: 2100000,
      status: "Shipped",
      date: "30/03/2025",
    },
    {
      id: "4",
      customer: "Phạm Hoàng E",
      total: 740000,
      status: "Completed",
      date: "29/03/2025",
    },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Khách hàng", dataIndex: "customer", key: "customer" },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => `${value.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        if (status === "Processing") {
          color = "blue";
        } else if (status === "Shipped") {
          color = "orange";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Ngày", dataIndex: "date", key: "date" },
  ];

  const userMenu = (
    <Menu
      items={[
        {
          key: "1",
          label: "Thông tin tài khoản",
          icon: <UserOutlined />,
        },
        {
          key: "2",
          label: "Cài đặt",
          icon: <SettingOutlined />,
        },
        {
          type: "divider",
        },
        {
          key: "3",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <>
      <Header
        style={{
          padding: "0 20px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Tổng quan
        </Title>
        <Space size="large">
          <Button shape="circle" icon={<BellOutlined />} />
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar
                  src={
                    user?.avatar ??
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  }
                />
                {!collapsed && (
                  <>
                    <Text strong>{user?.email}</Text>
                    <DownOutlined />
                  </>
                )}
              </Space>
            </a>
          </Dropdown>
        </Space>
      </Header>

      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          minHeight: 280,
        }}
      >
        {selectedTab === "dashboard" && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={24} md={8}>
                <Card bordered={false} style={{ height: "100%" }}>
                  <Statistic
                    title="Người dùng"
                    value={1200}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#3f8600" }}
                  />
                  <Text type="secondary">Tăng 12% so với tháng trước</Text>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card bordered={false} style={{ height: "100%" }}>
                  <Statistic
                    title="Đơn hàng"
                    value={320}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <Text type="secondary">Tăng 5% so với tháng trước</Text>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card bordered={false} style={{ height: "100%" }}>
                  <Statistic
                    title="Doanh thu"
                    value={56000000}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#cf1322" }}
                    formatter={(value) =>
                      `${value.toLocaleString("vi-VN")} VNĐ`
                    }
                  />
                  <Text type="secondary">Tăng 8% so với tháng trước</Text>
                </Card>
              </Col>
            </Row>

            <Card
              title="Biểu đồ doanh thu"
              bordered={false}
              extra={<Button type="link">Xem chi tiết</Button>}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => [
                      `${value.toLocaleString("vi-VN")} VNĐ`,
                      "Doanh thu",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#1890ff" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card
              title="Đơn hàng gần đây"
              bordered={false}
              style={{ marginTop: 16 }}
              extra={<Button type="link">Xem tất cả</Button>}
            >
              <Table
                dataSource={recentOrders}
                columns={columns}
                pagination={false}
                rowKey="id"
              />
            </Card>
          </>
        )}
      </Content>
    </>
  );
};

export default Dashboard;
