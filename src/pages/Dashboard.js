import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Tag,
  Table,
  Avatar,
  Divider,
  Badge,
  Space,
  Dropdown,
  Menu,
  Empty,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  BellOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const revenueData = [
    { month: "T1", revenue: 5000, users: 300 },
    { month: "T2", revenue: 8000, users: 450 },
    { month: "T3", revenue: 12000, users: 500 },
    { month: "T4", revenue: 9000, users: 480 },
    { month: "T5", revenue: 15000, users: 520 },
    { month: "T6", revenue: 18000, users: 620 },
  ];

  const recentOrders = [
    {
      id: "ORD-0087",
      customer: "Trần Văn B",
      avatar: "T",
      total: 1250000,
      status: "Completed",
      date: "01/04/2025",
      items: 3,
    },
    {
      id: "ORD-0086",
      customer: "Nguyễn Thị C",
      avatar: "N",
      total: 850000,
      status: "Processing",
      date: "31/03/2025",
      items: 2,
    },
    {
      id: "ORD-0085",
      customer: "Lê Minh D",
      avatar: "L",
      total: 2100000,
      status: "Shipped",
      date: "30/03/2025",
      items: 5,
    },
    {
      id: "ORD-0084",
      customer: "Phạm Hoàng E",
      avatar: "P",
      total: 740000,
      status: "Completed",
      date: "29/03/2025",
      items: 1,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#52c41a";
      case "Processing":
        return "#1890ff";
      case "Shipped":
        return "#fa8c16";
      default:
        return "#d9d9d9";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }}>
            {record.avatar}
          </Avatar>
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "items",
      key: "items",
      render: (value) => (
        <Badge count={value} style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => (
        <Text strong style={{ color: "#1890ff" }}>
          {value.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = getStatusColor(status);
        return (
          <Tag
            color={color}
            style={{ borderRadius: "12px", padding: "2px 12px" }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text type="secondary">{date}</Text>
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      render: () => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="1">Xem chi tiết</Menu.Item>
              <Menu.Item key="2">Chỉnh sửa</Menu.Item>
              <Menu.Item key="3" danger>
                Hủy đơn
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div className="p-4 bg-white rounded shadow-md">
        <Space size="large">
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            Tổng quan
          </Title>
        </Space>
      </div>

      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Text type="secondary">Người dùng</Text>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={2} style={{ margin: 0 }}>
                      1,200
                    </Title>
                  </Col>
                  <Col>
                    <Avatar
                      size={48}
                      style={{ backgroundColor: "rgba(24, 144, 255, 0.1)" }}
                      icon={<UserOutlined style={{ color: "#1890ff" }} />}
                    />
                  </Col>
                </Row>
                <Space>
                  <Tag color="green" style={{ borderRadius: "12px" }}>
                    <ArrowUpOutlined /> 12%
                  </Tag>
                  <Text type="secondary">so với tháng trước</Text>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Text type="secondary">Đơn hàng</Text>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={2} style={{ margin: 0 }}>
                      320
                    </Title>
                  </Col>
                  <Col>
                    <Avatar
                      size={48}
                      style={{ backgroundColor: "rgba(82, 196, 26, 0.1)" }}
                      icon={
                        <ShoppingCartOutlined style={{ color: "#52c41a" }} />
                      }
                    />
                  </Col>
                </Row>
                <Space>
                  <Tag color="green" style={{ borderRadius: "12px" }}>
                    <ArrowUpOutlined /> 5%
                  </Tag>
                  <Text type="secondary">so với tháng trước</Text>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Text type="secondary">Doanh thu</Text>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={2} style={{ margin: 0 }}>
                      56M
                    </Title>
                  </Col>
                  <Col>
                    <Avatar
                      size={48}
                      style={{ backgroundColor: "rgba(245, 34, 45, 0.1)" }}
                      icon={<DollarOutlined style={{ color: "#f5222d" }} />}
                    />
                  </Col>
                </Row>
                <Space>
                  <Tag color="green" style={{ borderRadius: "12px" }}>
                    <ArrowUpOutlined /> 8%
                  </Tag>
                  <Text type="secondary">so với tháng trước</Text>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Text type="secondary">Tỷ lệ chuyển đổi</Text>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={2} style={{ margin: 0 }}>
                      8.5%
                    </Title>
                  </Col>
                  <Col>
                    <Avatar
                      size={48}
                      style={{ backgroundColor: "rgba(250, 140, 22, 0.1)" }}
                      icon={<RiseOutlined style={{ color: "#fa8c16" }} />}
                    />
                  </Col>
                </Row>
                <Space>
                  <Tag color="green" style={{ borderRadius: "12px" }}>
                    <ArrowUpOutlined /> 2%
                  </Tag>
                  <Text type="secondary">so với tháng trước</Text>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong style={{ fontSize: "16px" }}>
                      Biểu đồ doanh thu
                    </Text>
                  </Col>
                  <Col>
                    <Button type="primary" ghost size="small">
                      Xem chi tiết
                    </Button>
                  </Col>
                </Row>
              }
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: "0 20px 20px" }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#1890ff"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value) => [
                      `${value.toLocaleString("vi-VN")} ₫`,
                      "Doanh thu",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    fill="url(#colorRevenue)"
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <Divider style={{ margin: "16px 0" }} />

              <Row gutter={16}>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Tháng này</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      18,000,000 ₫
                    </Title>
                    <Text type="success">
                      <ArrowUpOutlined /> 20% so với tháng trước
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Quý này</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      42,000,000 ₫
                    </Title>
                    <Text type="success">
                      <ArrowUpOutlined /> 15% so với quý trước
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Dự báo quý sau</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      50,000,000 ₫
                    </Title>
                    <Text type="success">
                      <ArrowUpOutlined /> 19% tăng trưởng
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title={
                <Text strong style={{ fontSize: "16px" }}>
                  Thống kê người dùng
                </Text>
              }
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                height: "100%",
              }}
              bodyStyle={{ padding: "0 20px 20px" }}
            >
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#52c41a"
                    strokeWidth={3}
                    dot={{
                      stroke: "#52c41a",
                      strokeWidth: 2,
                      r: 4,
                      fill: "white",
                    }}
                    activeDot={{
                      r: 6,
                      stroke: "#52c41a",
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <Divider style={{ margin: "16px 0" }} />

              <Row gutter={16}>
                <Col span={12}>
                  <Card
                    bordered={false}
                    style={{ backgroundColor: "rgba(24, 144, 255, 0.1)" }}
                    bodyStyle={{ padding: "12px" }}
                  >
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Mới đăng ký</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        +120
                      </Title>
                      <Text type="success">
                        <ArrowUpOutlined /> 15%
                      </Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    bordered={false}
                    style={{ backgroundColor: "rgba(82, 196, 26, 0.1)" }}
                    bodyStyle={{ padding: "12px" }}
                  >
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Hoạt động</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        85%
                      </Title>
                      <Text type="success">
                        <ArrowUpOutlined /> 5%
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong style={{ fontSize: "16px" }}>
                      Đơn hàng gần đây
                    </Text>
                  </Col>
                  <Col>
                    <Button type="primary" ghost size="small">
                      Xem tất cả
                    </Button>
                  </Col>
                </Row>
              }
              bordered={false}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: "0 20px 20px" }}
            >
              <Table
                dataSource={recentOrders}
                columns={columns}
                pagination={false}
                rowKey="id"
                style={{ marginTop: "8px" }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;
