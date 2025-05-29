import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Statistic, Row, Col, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#52c41a", "#ff4d4f", "#1890ff"];

const VoucherStats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { total, activeCount, expiredCount, totalUsed } = location.state || {};

  const pieData = [
    { name: "Đang hoạt động", value: activeCount },
    { name: "Hết hạn", value: expiredCount },
    { name: "Đã dùng", value: totalUsed },
  ];

  const barData = [
    { name: "Đang hoạt động", value: activeCount },
    { name: "Hết hạn", value: expiredCount },
    { name: "Đã dùng", value: totalUsed },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Tổng số voucher" value={total} /></Card></Col>
        <Col span={6}><Card><Statistic title="Đang hoạt động" value={activeCount} valueStyle={{ color: "#52c41a" }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Hết hạn" value={expiredCount} valueStyle={{ color: "#ff4d4f" }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng lượt dùng" value={totalUsed} valueStyle={{ color: "#1890ff" }} /></Card></Col>
      </Row>

      <Row gutter={32}>
        <Col span={12}>
          <Card title="Phân bố voucher (Biểu đồ tròn)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Phân bố voucher (Biểu đồ cột)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoucherStats;
