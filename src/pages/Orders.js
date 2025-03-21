import { useState, useEffect } from "react";
import { Table, Button, Modal, Select, Input, DatePicker, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getOrdersFromFirebase } from "../firebase/firebaseService"; // Đảm bảo đường dẫn đúng với file Firebase

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrdersFromFirebase();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "total",
      key: "total",
      render: (total) => (total ? total.toLocaleString() : "0"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Completed">Completed</Select.Option>
          <Select.Option value="Cancelled">Cancelled</Select.Option>
        </Select>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => showOrderDetails(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <Input placeholder="Tìm ID đơn hàng" prefix={<SearchOutlined />} />
        <DatePicker placeholder="Chọn ngày" />
        <Select placeholder="Lọc theo trạng thái" style={{ width: 150 }}>
          <Select.Option value="All">Tất cả</Select.Option>
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Completed">Completed</Select.Option>
          <Select.Option value="Cancelled">Cancelled</Select.Option>
        </Select>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table columns={columns} dataSource={filteredOrders} rowKey="id" />
      )}
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <p><strong>ID:</strong> {selectedOrder.id}</p>
            <p><strong>Khách hàng:</strong> {selectedOrder.customer}</p>
            <p><strong>Ngày đặt:</strong> {selectedOrder.date}</p>
            <p><strong>Tổng tiền:</strong> {selectedOrder.total ? selectedOrder.total.toLocaleString() : "0"} VNĐ</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
