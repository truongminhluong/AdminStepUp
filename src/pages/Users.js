import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  message,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Typography,
  Space,
  Divider,
  Popconfirm,
  Avatar,
  Tag,
  Tooltip,
  Spin,
  Badge,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  MailOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const { Title, Text } = Typography;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
        localStorage.setItem("users", JSON.stringify(userList));
        setLoading(false);
      },
      (error) => {
        message.error(`Lỗi khi tải dữ liệu: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddOrUpdateUser = async (values) => {
    try {
      setLoading(true);
      if (selectedUser) {
        const userRef = doc(db, "users", selectedUser.id);
        await updateDoc(userRef, values);
        message.success({
          content: "Cập nhật người dùng thành công!",
        });
      } else {
        await addDoc(collection(db, "users"), values);
        message.success({
          content: "Thêm người dùng mới thành công!",
        });
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error({
        content: `Có lỗi xảy ra: ${error.message}`,
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", id));
      message.success({
        content: "Xóa người dùng thành công!",
      });
    } catch (error) {
      message.error({
        content: `Lỗi khi xóa người dùng: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const showAddEditModal = (user = null) => {
    setSelectedUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const getColorFromName = (name) => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#87d068",
      "#1890ff",
      "#722ed1",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getRoleTag = (role) => {
    switch (role) {
      case "admin":
        return (
          <Tag color="red" icon={<TeamOutlined />}>
            Admin
          </Tag>
        );
      case "moderator":
        return (
          <Tag color="blue" icon={<TeamOutlined />}>
            Moderator
          </Tag>
        );
      case "user":
        return (
          <Tag color="green" icon={<UserOutlined />}>
            User
          </Tag>
        );
      default:
        return <Tag color="default">{role}</Tag>;
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Avatar",
      dataIndex: "name",
      key: "avatar",
      width: 80,
      align: "center",
      render: (name) => (
        <Avatar
          style={{ backgroundColor: getColorFromName(name) }}
          size="large"
        >
          {getInitials(name)}
        </Avatar>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Moderator", value: "moderator" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => getRoleTag(role),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showAddEditModal(record)}
              ghost
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này không?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TeamOutlined
            style={{ fontSize: 24, marginRight: 8, color: "#1890ff" }}
          />
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Người dùng
          </Title>
          <Badge
            count={users.length}
            style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
            overflowCount={999}
          />
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => showAddEditModal()}
        >
          Thêm người dùng
        </Button>
      </div>

      <Divider />

      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          allowClear
          size="large"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          pageSizeOptions: ["8", "16", "32"],
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
        locale={{
          emptyText: (
            <Empty
              description="Không có người dùng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        bordered
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          <div className="flex items-center">
            {selectedUser ? (
              <>
                <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <span>Chỉnh sửa Người dùng</span>
              </>
            ) : (
              <>
                <PlusOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <span>Thêm Người dùng mới</span>
              </>
            )}
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdateUser}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label={<Text strong>Họ tên</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
            ]}
            tooltip={{
              title: "Nhập họ và tên đầy đủ của người dùng",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Nhập họ tên người dùng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<Text strong>Email</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
            tooltip={{
              title: "Email sẽ được sử dụng làm tên đăng nhập",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
              type="email"
              placeholder="Nhập địa chỉ email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={<Text strong>Vai trò</Text>}
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            tooltip={{
              title:
                "Vai trò quyết định quyền hạn của người dùng trong hệ thống",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Select placeholder="Chọn vai trò cho người dùng" size="large">
              <Option value="admin">
                <Tag color="red" icon={<TeamOutlined />}>
                  Admin
                </Tag>
                <Text style={{ marginLeft: 8 }}>
                  Toàn quyền quản trị hệ thống
                </Text>
              </Option>
              <Option value="moderator">
                <Tag color="blue" icon={<TeamOutlined />}>
                  Moderator
                </Tag>
                <Text style={{ marginLeft: 8 }}>Quyền hạn trung gian</Text>
              </Option>
              <Option value="user">
                <Tag color="green" icon={<UserOutlined />}>
                  User
                </Tag>
                <Text style={{ marginLeft: 8 }}>Người dùng thông thường</Text>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <div className="flex justify-end space-x-2">
              <Button size="large" onClick={() => setIsModalVisible(false)}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {selectedUser ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Users;
