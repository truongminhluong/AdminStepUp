import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Card,
  Typography,
  Space,
  Divider,
  Badge,
  Tag,
  Tooltip,
  Empty,
  Skeleton,
  Alert,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  MenuOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  deleteCategory,
  getCategories,
  storeCategory,
  updateCategory,
} from "../services/category-service";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error({
        content: "Không thể tải danh sách danh mục!",
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const showModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);

    if (category) {
      form.setFieldsValue({
        ...category,
        status: Boolean(category.status),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await storeCategory(values);
        message.success("Thêm danh mục mới thành công!");
      }

      handleCancel();
      fetchCategories();
    } catch (error) {
      message.error(`Lỗi khi lưu danh mục: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteCategory(id);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      toast.error(`Lỗi khi xóa danh mục: ${error.message}`);
      setLoading(false);
    }
  };

  // Lọc dữ liệu dựa trên searchText
  const filteredCategories = categories.filter((category) =>
    category.category_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: (
        <Space>
          <MenuOutlined style={{ color: "#1890ff" }} />
          <span>Tên danh mục</span>
        </Space>
      ),
      dataIndex: "category_name",
      key: "category_name",
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Tạm ngưng", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) =>
        status ? (
          <Badge status="success" text={<Tag color="success">Hoạt động</Tag>} />
        ) : (
          <Badge status="error" text={<Tag color="error">Tạm ngưng</Tag>} />
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              ghost
              size="middle"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này không?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="middle" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <MenuOutlined
            style={{ fontSize: 24, marginRight: 12, color: "#1890ff" }}
          />
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Danh mục
          </Title>
          <Badge
            count={categories.length}
            style={{ backgroundColor: "#52c41a", marginLeft: 12 }}
            overflowCount={999}
          />
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm danh mục
        </Button>
      </div>

      <Divider />

      {categories.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
            size="large"
          />
        </div>
      )}

      {loading && categories.length === 0 ? (
        <div className="p-6">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p>Chưa có danh mục nào</p>
                    <Button type="primary" onClick={() => showModal()}>
                      Thêm danh mục mới
                    </Button>
                  </div>
                }
              />
            ),
          }}
          bordered
          scroll={{ x: 800 }}
        />
      )}

      <Modal
        title={
          <div className="flex items-center">
            {editingCategory ? (
              <>
                <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <span>Chỉnh sửa danh mục</span>
              </>
            ) : (
              <>
                <PlusOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <span>Thêm danh mục mới</span>
              </>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        centered
        width={500}
      >
        <Divider />

        {editingCategory && (
          <Alert
            message={`Đang chỉnh sửa: ${editingCategory.category_name}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ status: true }}
          requiredMark="optional"
        >
          <Form.Item
            label={<Text strong>Tên danh mục</Text>}
            name="category_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục!" },
              { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự!" },
              {
                max: 100,
                message: "Tên danh mục không được vượt quá 100 ký tự!",
              },
            ]}
            tooltip={{
              title: "Tên danh mục sẽ hiển thị cho khách hàng",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input
              placeholder="Nhập tên danh mục"
              size="large"
              prefix={<MenuOutlined style={{ color: "#bfbfbf" }} />}
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Trạng thái</Text>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            tooltip={{
              title:
                "Trạng thái xác định danh mục có hiển thị cho khách hàng hay không",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              optionLabelProp="label"
            >
              <Option value={true} label="Hoạt động">
                <div className="flex items-center">
                  <Badge status="success" />
                  <span style={{ marginLeft: 8 }}>Hoạt động</span>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (Hiển thị cho khách hàng)
                  </Text>
                </div>
              </Option>
              <Option value={false} label="Tạm ngưng">
                <div className="flex items-center">
                  <Badge status="error" />
                  <span style={{ marginLeft: 8 }}>Tạm ngưng</span>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (Ẩn khỏi khách hàng)
                  </Text>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <div className="flex justify-end space-x-2">
              <Button size="large" onClick={handleCancel}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                icon={
                  editingCategory ? <CheckCircleOutlined /> : <PlusOutlined />
                }
              >
                {editingCategory ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Category;
