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

  // Hàm chuyển file thành Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof Blob)) {
        reject(new Error("File không hợp lệ!"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Hàm kiểm tra ảnh
  const validateImage = () => {
    console.log("Validating image, fileList:", fileList);
    if (!isEditing && !fileList.length) {
      console.log("No image selected for new product");
      message.error("Vui lòng chọn ảnh sản phẩm khi thêm mới!");
      return false;
    }
    return true;
  };

  const handleOk = async () => {
    console.log("handleOk called, fileList:", fileList);

    // Kiểm tra ảnh trước
    if (!validateImage()) {
      return;
    }

    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      // Xử lý ảnh
      if (fileList.length > 0) {
        if (fileList[0].originFileObj) {
          // Nếu có file mới được upload thì chuyển sang base64
          console.log(
            "Converting new file to base64:",
            fileList[0].originFileObj
          );
          values.imageUrl = await fileToBase64(fileList[0].originFileObj);
        } else if (isEditing && editingProduct?.imageUrl) {
          // Nếu đang edit và không có file mới, giữ ảnh cũ
          values.imageUrl = editingProduct.imageUrl;
        } else {
          values.imageUrl = "";
        }
      } else if (isEditing && editingProduct?.imageUrl) {
        values.imageUrl = editingProduct.imageUrl;
      } else {
        values.imageUrl = "";
      }

      // Chuyển price và quantity thành số
      values.price = Number(values.price);
      values.quantity = Number(values.quantity);

      console.log("Values to save:", values);

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
      message.error("Lưu sản phẩm thất bại");
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
        url ? (
          <img src={url} alt="product" style={{ width: 50 }} />
        ) : (
          "Không có ảnh"
        ),
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
      render: (status) => {
        const color = status === "Available" ? "green" : "red";
        const text = status === "Available" ? "Còn hàng" : "Hết hàng";
        return <span style={{ color, fontWeight: "bold" }}>{text}</span>;
      },
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
          >
            Xem chi tiết
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${
              record.hidden ? "hiển thị" : "ẩn"
            } sản phẩm này?`}
            onConfirm={() => handleToggleHidden(record)}
          >
            <Button
              icon={record.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              danger={!record.hidden}
            >
              {record.hidden ? "Hiển thị" : "Ẩn"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() =>
              deleteProductFromFireBase(record.id).then(fetchProducts)
            }
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      console.log("File selected:", file);
      setFileList([file]); // Gán file trực tiếp, không cần thêm originFileObj thủ công
      return false; // Ngăn upload tự động
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
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

          <Form.Item label="Ảnh sản phẩm">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
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
      <p><strong>Tên sản phẩm:</strong> {detailProduct.name}</p>
      <p><strong>Giá:</strong> {detailProduct.price.toLocaleString()} VND</p>
      <p><strong>Danh mục:</strong> {getCategoryName(detailProduct.category)}</p>
      <p><strong>Kích thước:</strong> {detailProduct.size}</p>
      <p><strong>Số lượng:</strong> {detailProduct.quantity}</p>
      <p><strong>Trạng thái:</strong> {detailProduct.status === "Available" ? "Còn hàng" : "Hết hàng"}</p>
      {detailProduct.imageUrl && <img src={detailProduct.imageUrl} alt="product" style={{ width: "100%" }} />}
    </div>
  )}
</Modal>

    </div>
  );
};

export default Products;
