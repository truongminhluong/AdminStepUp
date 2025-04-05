import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Select,
  Upload,
  message,
} from "antd";
import { Tag } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { getCategories } from "../services/category-service";
import {
  getProductsFromFireBase,
  storeProductFromFireBase,
  updateProductInFireBase,
  deleteProductFromFireBase,
} from "../services/product-service";

const { Option } = Select;

const Products = () => {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const showDetailModal = (product) => {
    setDetailProduct(product);
    setIsDetailModalVisible(true);
  };

  const fetchProducts = async () => {
    const data = await getProductsFromFireBase();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const showModal = (product = null) => {
    setIsEditing(!!product);
    setEditingProduct(product);
    form.setFieldsValue(
      product || {
        name: "",
        price: "",
        category: "",
        size: "",
        quantity: "",
        status: "Available",
        color: [],
      }
    );
    if (product && product.imageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: product.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const validateImage = () => {
    if (!isEditing && !fileList.length) {
      message.error("Vui lòng chọn ảnh sản phẩm khi thêm mới!");
      return false;
    }
    return true;
  };

  const handleOk = async () => {
    if (!validateImage()) return;

    try {
      const values = await form.validateFields();

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj || fileList[0];
        if (file) {
          values.imageUrl = await fileToBase64(file);
        }
      } else if (isEditing && editingProduct?.imageUrl) {
        values.imageUrl = editingProduct.imageUrl;
      } else {
        values.imageUrl = "";
      }

      values.price = Number(values.price);
      values.quantity = Number(values.quantity);
      values.color = values.color || [];

      if (isEditing) {
        await updateProductInFireBase(editingProduct.id, values);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await storeProductFromFireBase(values);
        message.success("Thêm sản phẩm thành công");
      }

      fetchProducts();
      handleCancel();
    } catch (error) {
      message.error("Lỗi khi lưu sản phẩm");
      console.error("Lỗi khi lưu sản phẩm:", error);
    }
  };

  const handleToggleHidden = async (product) => {
    try {
      await updateProductInFireBase(product.id, {
        ...product,
        hidden: !product.hidden,
      });
      message.success(
        `Sản phẩm đã được ${product.hidden ? "hiển thị" : "ẩn"} thành công`
      );
      fetchProducts();
    } catch (error) {
      message.error("Không thể thay đổi trạng thái hiển thị sản phẩm");
      console.error(error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.category_name : "Không xác định";
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) =>
        url ? <img src={url} alt="product" style={{ width: 50 }} /> : "Không có ảnh",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    { title: "Giá", dataIndex: "price", key: "price" },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (categoryId) => getCategoryName(categoryId),
    },
    { title: "Kích thước", dataIndex: "size", key: "size" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Available" ? "green" : "red"}>
          {status === "Available" ? "Còn hàng" : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (colors) => (
        <div>
          {colors && colors.length > 0
            ? colors.map((color) => (
                <Tag key={color} color={color.toLowerCase()}>
                  {color}
                </Tag>
              ))
            : "Không có màu"}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetailModal(record)}>
            Xem chi tiết
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.hidden ? "hiển thị" : "ẩn"} sản phẩm này?`}
            onConfirm={() => handleToggleHidden(record)}
          >
            <Button
              icon={record.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              danger={!record.hidden}
            >
              {record.hidden ? "Hiển thị" : "Ẩn"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => deleteProductFromFireBase(record.id).then(fetchProducts)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    listType: "picture",
    maxCount: 1,
  };

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm sản phẩm"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm sản phẩm
        </Button>
        <Button onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? "Ẩn sản phẩm bị ẩn" : "Hiển thị sản phẩm bị ẩn"}
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={products.filter((p) => showHidden || !p.hidden)}
        rowKey="id"
      />

      {/* Modal Thêm / Chỉnh sửa */}
      <Modal
        title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="size"
            label="Kích thước"
            rules={[{ required: true, message: "Vui lòng nhập kích thước" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Available">Còn hàng</Option>
              <Option value="Out of Stock">Hết hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: "Vui lòng chọn màu sắc" }]}
          >
            <Select mode="multiple" placeholder="Chọn màu">
              <Option value="Red">Đỏ</Option>
              <Option value="Blue">Xanh dương</Option>
              <Option value="Black">Đen</Option>
              <Option value="White">Trắng</Option>
              <Option value="Green">Xanh lá</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailProduct && (
          <div>
            <p>
              <strong>Tên sản phẩm:</strong> {detailProduct.name}
            </p>
            <p>
              <strong>Giá:</strong> {detailProduct.price.toLocaleString()} VND
            </p>
            <p>
              <strong>Danh mục:</strong> {getCategoryName(detailProduct.category)}
            </p>
            <p>
              <strong>Kích thước:</strong> {detailProduct.size}
            </p>
            <p>
              <strong>Số lượng:</strong> {detailProduct.quantity}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <Tag color={detailProduct.status === "Available" ? "green" : "red"}>
                {detailProduct.status === "Available" ? "Còn hàng" : "Hết hàng"}
              </Tag>
            </p>
            <p>
              <strong>Màu sắc:</strong>{" "}
              {detailProduct.color && detailProduct.color.length > 0
                ? detailProduct.color.map((color) => (
                    <Tag key={color} color={color.toLowerCase()}>
                      {color}
                    </Tag>
                  ))
                : "Không có màu"}
            </p>
            {detailProduct.imageUrl && (
              <img
                src={detailProduct.imageUrl}
                alt="product"
                style={{ width: "100%" }}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
