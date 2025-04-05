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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  deleteBrand,
  getBrands,
  storeBrand,
  updateBrand,
} from "../../services/brand-service";

const { Option } = Select;

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const data = await getBrands();
    setBrands(data);
  };

  const showModal = (brand = null) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
    setBrandLogo(brand?.logo || null);

    if (brand) {
      form.setFieldsValue(brand);
    } else {
      form.resetFields();
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
        logo: brandLogo,
      };

      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData);
      } else {
        await storeBrand(brandData);
      }
      handleCancel();
      fetchBrands();
    } catch (error) {
      toast.error("Lỗi khi lưu thương hiệu!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBrand(id);
      fetchBrands();
    } catch (error) {
      toast.error("Lỗi khi xóa thương hiệu!");
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
          <img
            src={logo}
            alt="Brand logo"
            style={{ width: 50, height: 50, objectFit: "contain" }}
          />
        ) : (
          "Không có logo"
        ),
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "brand_name",
      key: "brand_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <span style={{ color: "green" }}>Hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Tạm ngưng</span>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa thương hiệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Quản lý thương hiệu</h2>
        <Button
          type="primary"
          onClick={() => showModal()}
          style={{ marginBottom: 20 }}
        >
          Thêm thương hiệu
        </Button>
      </div>
      <Table columns={columns} dataSource={brands} rowKey="id" />

      <Modal
        title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ status: "active" }}
        >
          <Form.Item
            label="Tên thương hiệu"
            name="brand_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu!" },
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item label="Logo thương hiệu" >
            <div>
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Tải lên logo</Button>
              </Upload>
              {brandLogo && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={brandLogo}
                    alt="Logo preview"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm ngưng</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              {editingBrand ? "Cập nhật" : "Thêm thương hiệu"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Brand;
