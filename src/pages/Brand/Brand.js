import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Upload,
  Image,
  Card,
  Typography,
  Divider,
  Space,
  Badge,
  message,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  deleteBrand,
  getBrands,
  storeBrand,
  updateBrand,
} from "../../services/brand-service";

const { Option } = Select;
const { Title, Text } = Typography;

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      toast.error("Không thể tải danh sách thương hiệu!");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (brand = null) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
    setBrandLogo(brand?.logo || null);

    if (brand) {
      form.setFieldsValue({
        ...brand,
        status: brand.status === true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setBrandLogo(null);
    form.resetFields();
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file) => {
    try {
      // Kiểm tra loại file
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        toast.error("Chỉ chấp nhận file hình ảnh!");
        return false;
      }

      // Kiểm tra kích thước file (giới hạn 2MB)
      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        toast.error("Kích thước file không được vượt quá 2MB!");
        return false;
      }

      const base64 = await convertToBase64(file);
      setBrandLogo(base64);
      return false;
    } catch (error) {
      toast.error("Lỗi khi tải lên file!");
      return false;
    }
  };

  const onFinish = async (values) => {
    try {
      const brandData = {
        ...values,
        status: Boolean(values.status),
        logo: brandLogo,
      };

      if (!brandLogo) {
        toast.warning("Vui lòng tải lên logo thương hiệu!");
        return;
      }

      setLoading(true);
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData);
        message.success(
          "Cập nhật thành công"
        );
      } else {
        await storeBrand(brandData);
        message.success(
          "Thêm thành công"
        );
      }
      handleCancel();
      fetchBrands();
    } catch (error) {
      message.error(
        editingBrand
          ? "Lỗi khi cập nhật thương hiệu!"
          : "Lỗi khi thêm thương hiệu!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteBrand(id);
      toast.success("Xóa thương hiệu thành công!");
      fetchBrands();
    } catch (error) {
      toast.error("Lỗi khi xóa thương hiệu!");
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (logo) =>
        logo ? (
          <Image
            src={logo}
            alt="Brand logo"
            style={{ width: 60, height: 60, objectFit: "contain" }}
            preview={{ maskClassName: "custom-mask", mask: <EditOutlined /> }}
          />
        ) : (
          <div className="text-center text-gray-400">Không có logo</div>
        ),
      width: 100,
      align: "center",
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "brand_name",
      key: "brand_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="error" text="Tạm ngưng" />
        ),
      width: 150,
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            ghost
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa thương hiệu"
            description="Bạn có chắc chắn muốn xóa thương hiệu này không?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 200,
      align: "center",
    },
  ];

  return (
    <Card className="shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} style={{ margin: 0 }}>
          Quản lý thương hiệu
        </Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm thương hiệu
        </Button>
      </div>

      <Divider />

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} thương hiệu`,
        }}
        bordered
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          <div className="text-center">
            <Title level={4} style={{ margin: 0 }}>
              {editingBrand ? "Cập nhật thương hiệu" : "Thêm mới thương hiệu"}
            </Title>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        <Divider />

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ status: true }}
          requiredMark="optional"
        >
          <Form.Item
            label={<Text strong>Tên thương hiệu</Text>}
            name="brand_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu!" },
              {
                max: 100,
                message: "Tên thương hiệu không được vượt quá 100 ký tự!",
              },
            ]}
          >
            <Input
              placeholder="Nhập tên thương hiệu"
              size="large"
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Logo thương hiệu</Text>}
            required
            tooltip="Yêu cầu: Định dạng ảnh (JPG, PNG, SVG), kích thước tối đa 2MB"
          >
            <div className="flex flex-col items-center p-6 border border-dashed rounded-lg">
              {brandLogo ? (
                <div className="flex flex-col items-center">
                  <img
                    src={brandLogo}
                    alt="Logo preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                    }}
                    className="mb-4"
                  />
                  <Space>
                    <Button onClick={() => setBrandLogo(null)} danger>
                      Xóa ảnh
                    </Button>
                    <Upload
                      beforeUpload={handleFileUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Đổi ảnh khác</Button>
                    </Upload>
                  </Space>
                </div>
              ) : (
                <Upload
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  accept="image/*"
                  className="flex flex-col items-center"
                >
                  <div className="flex flex-col items-center cursor-pointer p-6">
                    <UploadOutlined
                      style={{ fontSize: 36, color: "#1890ff" }}
                    />
                    <Text className="mt-3">Nhấp hoặc kéo thả file vào đây</Text>
                    <Text type="secondary" className="mt-1">
                      Hỗ trợ: JPG, PNG, SVG
                    </Text>
                  </div>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label={<Text strong>Trạng thái</Text>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái" size="large">
              <Option value={true}>
                <Badge status="success" text="Hoạt động" />
              </Option>
              <Option value={false}>
                <Badge status="error" text="Tạm ngưng" />
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
              >
                {editingBrand ? "Cập nhật" : "Thêm thương hiệu"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Brand;
