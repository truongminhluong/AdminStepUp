import React, { useState } from 'react';
import { Row, Col, Modal } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as PieResponsiveContainer } from 'recharts';

// Dữ liệu cho biểu đồ cột
const barChartData = [
  { month: 'Jan', value: 400, details: 'Chi tiết bán hàng tháng 1: 400 sản phẩm' },
  { month: 'Feb', value: 300, details: 'Chi tiết bán hàng tháng 2: 300 sản phẩm' },
  { month: 'Mar', value: 500, details: 'Chi tiết bán hàng tháng 3: 500 sản phẩm' },
  { month: 'Apr', value: 400, details: 'Chi tiết bán hàng tháng 4: 400 sản phẩm' },
  { month: 'May', value: 600, details: 'Chi tiết bán hàng tháng 5: 600 sản phẩm' },
  { month: 'Jun', value: 700, details: 'Chi tiết bán hàng tháng 6: 700 sản phẩm' },
  { month: 'Jul', value: 800, details: 'Chi tiết bán hàng tháng 7: 800 sản phẩm' },
  { month: 'Aug', value: 700, details: 'Chi tiết bán hàng tháng 8: 700 sản phẩm' },
  { month: 'Sep', value: 600, details: 'Chi tiết bán hàng tháng 9: 600 sản phẩm' },
  { month: 'Oct', value: 500, details: 'Chi tiết bán hàng tháng 10: 500 sản phẩm' },
  { month: 'Nov', value: 400, details: 'Chi tiết bán hàng tháng 11: 400 sản phẩm' },
  { month: 'Dec', value: 300, details: 'Chi tiết bán hàng tháng 12: 300 sản phẩm' },
];

// Dữ liệu cho biểu đồ tròn
const pieChartData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
];

// Màu sắc cho biểu đồ tròn
const COLORS = ['#0088FE', '#00C49F'];

const Statistics = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Hàm xử lý sự kiện click vào tháng
  const handleBarClick = (data) => {
    setSelectedMonth(data);
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} onClick={({ activeLabel }) => {
              const selected = barChartData.find(item => item.month === activeLabel);
              setSelectedMonth(selected); // Cập nhật dữ liệu chi tiết tháng khi click
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col span={12}>
          <PieResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </PieResponsiveContainer>
        </Col>
      </Row>

      {/* Hiển thị Modal khi chọn tháng */}
      <Modal
        title={`Chi tiết bán hàng tháng ${selectedMonth?.month}`}
        visible={!!selectedMonth}
        onCancel={() => setSelectedMonth(null)}
        footer={null}
      >
        {selectedMonth ? (
          <>
            <p>{selectedMonth.details}</p>
            <p>Số lượng bán: {selectedMonth.value} sản phẩm</p>
          </>
        ) : (
          <p>Chưa chọn tháng</p>
        )}
      </Modal>
    </div>
  );
};

export default Statistics;
