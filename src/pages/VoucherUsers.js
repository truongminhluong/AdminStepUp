import React, { useEffect, useState } from "react";
import { Table, message, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

const VoucherUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { code, usedBy } = location.state || { code: "", usedBy: [] };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usedBy.length > 0) {
      fetchUsers(usedBy);
    }
  }, [usedBy]);

  const fetchUsers = async (userIds) => {
    setLoading(true);
    try {
      // Lấy thông tin user từ bảng users dựa trên danh sách userIds
      // Firestore không hỗ trợ truy vấn "where id in [..]" với quá nhiều phần tử,
      // nên bạn có thể giới hạn số lượng hoặc gọi nhiều lần.
      // Dưới đây giả sử userIds nhỏ, < 10:
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("id", "in", userIds));
      const querySnapshot = await getDocs(q);

      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userData);
    } catch (error) {
      message.error("Lấy dữ liệu người dùng thất bại.");
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "ID người dùng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  return (
    <div>
      <h2>Người dùng đã sử dụng voucher: {code}</h2>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default VoucherUsers;
