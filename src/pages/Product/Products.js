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
  Tag,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { getCategories } from "../../services/category-service";
import {
  getProductsFromFireBase,
  storeProductFromFireBase,
  updateProductInFireBase,
  deleteProductFromFireBase,
} from "../../services/product-service";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/common";
import { getBrands } from "../../services/brand-service";

const { Option } = Select;

const Products = () => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    const data = await getProductsFromFireBase();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const fetchBrands = async () => {
    const data = await getBrands();
    setBrands(data);
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
        status: true,
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
        const file = fileList[0].originFileObj || fileList[0]; // Lấy file từ originFileObj hoặc file trực tiếp
        if (file) {
          console.log("Converting file to base64:", file);
          values.imageUrl = await fileToBase64(file);
        } else if (isEditing && editingProduct?.imageUrl) {
          values.imageUrl = editingProduct.imageUrl; // Giữ ảnh cũ khi chỉnh sửa
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

  const getBrandName = (brandId) => {
    const brand = brands.find((bra) => bra.id === brandId);
    return brand ? brand.brand_name : "Không xác định";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.category_name : "Không xác định";
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
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
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
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      render: (brandId) => getBrandName(brandId),
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status ? "green" : "red";
        const text = status ? "Còn hàng" : "Hết hàng";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/products/edit/${record.id}`}>
            <Button icon={<EditOutlined />} type="primary" ghost />
          </Link>
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.hidden ? "hiển thị" : "ẩn"
              } sản phẩm này?`}
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
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h2>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm sản phẩm"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Link to="/products/create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm sản phẩm
            </Button>
          </Link>
          <Button onClick={() => setShowHidden(!showHidden)}>
            {showHidden ? "Ẩn sản phẩm bị ẩn" : "Hiển thị sản phẩm bị ẩn"}
          </Button>
        </Space>
      </div>

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
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value={true}>Còn hàng</Option>
              <Option value={false}>Hết hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
