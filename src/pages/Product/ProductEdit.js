import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  Card,
  Tabs,
  Space,
  Row,
  Col,
  Tag,
  Divider,
  Collapse,
  InputNumber,
  Table,
  Switch,
  Typography,
  Alert,
  Popconfirm,
  Tooltip,
  Spin,
  Badge,
  Empty,
} from "antd";

import {
  UploadOutlined,
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  PictureOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import { getBrands } from "../../services/brand-service";
import {
  getProductDetail,
  updateProductInFireBase,
} from "../../services/product-service";
import { formatCurrency, generateRandomSKU } from "../../lib/common";
import AttributeSelectorModal from "./AttribbuteSelectModal";

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const ProductEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const [brands, setBrands] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [product, setProduct] = useState(null);

  const [attributeModalVisible, setAttributeModalVisible] = useState(false);
  const [currentAttributeType, setCurrentAttributeType] = useState(null);
  const [selectedSizeAttributes, setSelectedSizeAttributes] = useState([]);
  const [selectedColorAttributes, setSelectedColorAttributes] = useState([]);

  const [variants, setVariants] = useState([]);
  const [activeKey, setActiveKey] = useState("1");

  const [groupedVariants, setGroupedVariants] = useState([]);
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [variantView, setVariantView] = useState("grouped"); // 'grouped' or 'list'

  const navigate = useNavigate();

  useEffect(() => {
    fetchProductData();
    fetchBrands();
  }, [id]);

  useEffect(() => {
    if (
      hasVariants &&
      (selectedSizeAttributes.length > 0 || selectedColorAttributes.length > 0)
    ) {
      generateVariants();
    }
  }, [selectedSizeAttributes, selectedColorAttributes, hasVariants]);

  useEffect(() => {
    groupVariantsBySize();
  }, [variants]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const productData = await getProductDetail(id);

      if (!productData) {
        message.error("Không tìm thấy thông tin sản phẩm");
        navigate("/admin/products");
        return;
      }

      setProduct(productData);

      // Set basic form fields
      form.setFieldsValue({
        name: productData.name,
        sku: productData.sku,
        price: productData.price,
        brand: productData.brand,
        status: productData.status || "Available",
        quantity: productData.quantity || 0,
      });

      // Set image
      if (productData.imageUrl) {
        setOriginalImageUrl(productData.imageUrl);
        setFileList([
          {
            uid: "-1",
            name: "product-image.png",
            status: "done",
            url: productData.imageUrl,
          },
        ]);
      }

      // Handle variants
      if (productData.variants && productData.variants.length > 0) {
        setHasVariants(true);
        setVariants(productData.variants);

        // Set attributes
        if (productData.attributes) {
          if (productData.attributes.sizes) {
            setSelectedSizeAttributes(productData.attributes.sizes);
          }
          if (productData.attributes.colors) {
            setSelectedColorAttributes(productData.attributes.colors);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      message.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thương hiệu:", error);
    }
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
    if (!fileList.length && !originalImageUrl) {
      message.error("Vui lòng chọn ảnh sản phẩm!");
      return false;
    }
    return true;
  };

  const validateVariants = () => {
    if (hasVariants && variants.length === 0) {
      message.error("Vui lòng tạo ít nhất một biến thể cho sản phẩm!");
      return false;
    }

    if (
      hasVariants &&
      (selectedSizeAttributes.length === 0 ||
        selectedColorAttributes.length === 0)
    ) {
      message.error(
        "Vui lòng chọn ít nhất một giá trị kích thước và màu sắc từ cơ sở dữ liệu!"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateImage() || !validateVariants()) {
      return;
    }

    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        values.imageUrl = await fileToBase64(file);
      } else if (fileList.length > 0 && fileList[0].url) {
        values.imageUrl = originalImageUrl;
      } else {
        values.imageUrl = "";
      }

      values.price = Number(values.price);
      values.quantity = hasVariants
        ? variants.reduce((sum, variant) => sum + variant.quantity, 0)
        : Number(values.quantity);

      if (hasVariants && variants.length > 0) {
        values.variants = variants;

        values.attributes = {
          sizes: selectedSizeAttributes.map((attr) => ({
            id: attr.id,
            value: attr.value,
          })),
          colors: selectedColorAttributes.map((attr) => ({
            id: attr.id,
            value: attr.value,
            colorCode: attr.colorCode,
          })),
        };
      } else {
        values.variants = [];
        values.attributes = null;
      }

      await updateProductInFireBase(id, values);
      message.success("Cập nhật sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      message.error("Cập nhật sản phẩm thất bại");
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Bạn chỉ có thể tải lên file ảnh!");
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    listType: "picture-card",
    maxCount: 1,
  };

  const generateVariants = () => {
    if (
      selectedSizeAttributes.length === 0 ||
      selectedColorAttributes.length === 0
    ) {
      return;
    }

    const basePrice = form.getFieldValue("price") || 0;
    const sizes = selectedSizeAttributes.map((attr) => attr.value);
    const colors = selectedColorAttributes.map((attr) => ({
      value: attr.value,
      colorCode: attr.colorCode || "",
    }));

    const newVariants = [];
    sizes.forEach((size) => {
      colors.forEach((color) => {
        const existingVariant = variants.find(
          (v) => v.size === size && v.color === color.value
        );

        if (existingVariant) {
          newVariants.push(existingVariant);
        } else {
          newVariants.push({
            id: `${size}-${color.value}`,
            size,
            sku: generateRandomSKU(),
            color: color.value,
            colorCode: color.colorCode,
            price: basePrice,
            quantity: 1,
            isActive: true,
          });
        }
      });
    });

    setVariants(newVariants);
    if (newVariants.length > 0 && activeKey === "1") {
      message.info(
        "Biến thể đã được tạo. Bạn có thể xem tại tab 'Biến thể sản phẩm'"
      );
    }
  };

  const groupVariantsBySize = () => {
    if (!variants.length) {
      setGroupedVariants([]);
      return;
    }

    const sizes = [...new Set(variants.map((variant) => variant.size))];

    const grouped = sizes.map((size) => {
      const sizeVariants = variants.filter((variant) => variant.size === size);

      return {
        size,
        key: size,
        variants: sizeVariants,
        colorCount: sizeVariants.length,
        totalQuantity: sizeVariants.reduce((sum, v) => sum + v.quantity, 0),
        activeCount: sizeVariants.filter((v) => v.isActive).length,
      };
    });

    setGroupedVariants(grouped);
  };

  const handleVariantChange = (variantId, field, value) => {
    const newVariants = variants.map((item) => {
      if (item.id === variantId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setVariants(newVariants);
  };

  const openAttributeSelector = (type) => {
    setCurrentAttributeType(type);
    setAttributeModalVisible(true);
  };

  const handleAttributeSelected = (selectedAttributes) => {
    if (currentAttributeType === "size") {
      setSelectedSizeAttributes(selectedAttributes);
    } else if (currentAttributeType === "color") {
      setSelectedColorAttributes(selectedAttributes);
    }
  };

  const handleDeleteVariant = (variantId) => {
    const newVariants = variants.filter((item) => item.id !== variantId);
    setVariants(newVariants);
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Màu sắc",
        dataIndex: "color",
        key: "color",
        render: (color, record) => (
          <Tag
            color={record.colorCode || "purple"}
            style={{
              backgroundColor: record.colorCode,
              color: isLightColor(record.colorCode) ? "#000" : "#fff",
            }}
          >
            {color}
          </Tag>
        ),
      },
      {
        title: "Mã sản phẩm",
        dataIndex: "sku",
        key: "sku",
        render: (sku, record) => (
          <div style={{ display: "flex" }}>
            <Input
              style={{ flex: 1 }}
              value={sku}
              onChange={(e) =>
                handleVariantChange(record.id, "sku", e.target.value)
              }
              placeholder="Nhập mã sản phẩm"
            />
            <Tooltip title="Tạo mã ngẫu nhiên">
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  handleVariantChange(record.id, "sku", generateRandomSKU())
                }
                style={{ marginLeft: 8 }}
              />
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Giá (VND)",
        dataIndex: "price",
        key: "price",
        render: (price, record) => (
          <InputNumber
            min={0}
            value={price}
            onChange={(value) => handleVariantChange(record.id, "price", value)}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            style={{ width: "100%" }}
          />
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity, record) => (
          <InputNumber
            min={0}
            value={quantity}
            onChange={(value) =>
              handleVariantChange(record.id, "quantity", value)
            }
            style={{ width: "100%" }}
          />
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive, record) => (
          <Switch
            checked={isActive}
            onChange={(checked) =>
              handleVariantChange(record.id, "isActive", checked)
            }
          />
        ),
      },
      {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
          <Popconfirm
            title="Xóa biến thể"
            description="Bạn có chắc chắn muốn xóa biến thể này không?"
            onConfirm={() => handleDeleteVariant(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xóa biến thể"
            />
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.variants}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  const groupedVariantColumns = [
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      render: (size) => <Tag color="blue">{size}</Tag>,
    },
    {
      title: "Số lượng màu",
      dataIndex: "colorCount",
      key: "colorCount",
      render: (count) => <span>{count} màu</span>,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space>
          <Badge
            status={
              record.activeCount === record.colorCount
                ? "success"
                : record.activeCount > 0
                ? "warning"
                : "error"
            }
          />
          <span>
            {record.activeCount === record.colorCount
              ? "Tất cả hoạt động"
              : record.activeCount > 0
              ? `${record.activeCount}/${record.colorCount} hoạt động`
              : "Không hoạt động"}
          </span>
        </Space>
      ),
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (quantity) => <span>{quantity} sản phẩm</span>,
    },
  ];

  const variantListColumns = [
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      render: (size) => <Tag color="blue">{size}</Tag>,
      filters: selectedSizeAttributes.map((size) => ({
        text: size.value,
        value: size.value,
      })),
      onFilter: (value, record) => record.size === value,
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color, record) => (
        <Tag
          color={record.colorCode || "purple"}
          style={{
            backgroundColor: record.colorCode,
            color: isLightColor(record.colorCode) ? "#000" : "#fff",
          }}
        >
          {color}
        </Tag>
      ),
      filters: selectedColorAttributes.map((color) => ({
        text: color.value,
        value: color.value,
      })),
      onFilter: (value, record) => record.color === value,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "sku",
      key: "sku",
      render: (sku, record) => (
        <div style={{ display: "flex" }}>
          <Input
            style={{ width: "180px" }}
            value={sku}
            onChange={(e) =>
              handleVariantChange(record.id, "sku", e.target.value)
            }
            placeholder="Nhập mã sản phẩm"
          />
          <Tooltip title="Tạo mã ngẫu nhiên">
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                handleVariantChange(record.id, "sku", generateRandomSKU())
              }
              style={{ marginLeft: 8 }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price, record) => (
        <InputNumber
          min={0}
          value={price}
          onChange={(value) => handleVariantChange(record.id, "price", value)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          style={{ width: "150px" }}
        />
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity, record) => (
        <InputNumber
          min={0}
          value={quantity}
          onChange={(value) =>
            handleVariantChange(record.id, "quantity", value)
          }
          style={{ width: "100px" }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) =>
            handleVariantChange(record.id, "isActive", checked)
          }
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Xóa biến thể"
          description="Bạn có chắc chắn muốn xóa biến thể này không?"
          onConfirm={() => handleDeleteVariant(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Xóa biến thể"
          />
        </Popconfirm>
      ),
    },
  ];

  const updateAllVariantPrices = (value) => {
    if (value === undefined || value === null) return;

    const newVariants = variants.map((variant) => ({
      ...variant,
      price: value,
    }));

    setVariants(newVariants);
    message.success("Đã cập nhật giá cho tất cả biến thể");
  };

  const applyPriceDifferenceBySize = (sizePriceDiffs) => {
    const basePrice = form.getFieldValue("price") || 0;

    const newVariants = variants.map((variant) => {
      const sizeObj = sizePriceDiffs.find((item) => item.size === variant.size);
      let newPrice = basePrice;

      if (sizeObj && sizeObj.percentage) {
        const modifier = 1 + sizeObj.percentage / 100;
        newPrice = Math.round(basePrice * modifier);
      }

      return {
        ...variant,
        price: newPrice,
      };
    });

    setVariants(newVariants);
    message.success("Đã áp dụng điều chỉnh giá theo kích thước");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Chỉnh sửa sản phẩm: {product?.name}
        </h2>

        <Alert
          message="Đang chỉnh sửa sản phẩm"
          description={`Mã sản phẩm: ${product?.sku || "N/A"}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          tabBarStyle={{ marginBottom: 24, fontWeight: 500 }}
          type="card"
        >
          <TabPane
            tab={
              <span>
                <InfoCircleOutlined className="mr-2" />
                Thông tin cơ bản
              </span>
            }
            key="1"
          >
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              style={{ padding: "8px 0" }}
            >
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Thông tin sản phẩm</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
              >
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="name"
                      label="Tên sản phẩm"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên sản phẩm",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Mã sản phẩm"
                      required
                      style={{ marginBottom: 0 }}
                    >
                      <div style={{ display: "flex", gap: 8 }}>
                        <Form.Item
                          name="sku"
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mã sản phẩm",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập mã sản phẩm" size="large" />
                        </Form.Item>

                        <Button
                          icon={<ReloadOutlined />}
                          size="large"
                          onClick={() =>
                            form.setFieldsValue({
                              sku: generateRandomSKU(),
                            })
                          }
                          title="Tạo mã mới"
                        />
                      </div>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="price"
                      label="Giá bán (VND)"
                      rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    >
                      <InputNumber
                        addonAfter="₫"
                        style={{ width: "100%" }}
                        min={0}
                        formatter={(value) => formatCurrency(value)}
                        parser={(value) => value.replace(/[^\d]/g, "")}
                        size="large"
                        placeholder="100,000"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="brand"
                      label="Thương hiệu"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thương hiệu",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn thương hiệu"
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        optionLabelProp="label"
                      >
                        {brands.map((brand) => (
                          <Option
                            key={brand.id}
                            value={brand.id}
                            label={brand.brand_name}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <img
                                src={brand.logo}
                                alt={brand.brand_name}
                                style={{
                                  width: 28,
                                  height: 28,
                                  marginRight: 12,
                                }}
                              />
                              <span>{brand.brand_name}</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="status" label="Trạng thái">
                      <Select size="large">
                        <Option value="Available">
                          <Tag color="success">Còn hàng</Tag>
                        </Option>
                        <Option value="Out of Stock">
                          <Tag color="error">Hết hàng</Tag>
                        </Option>
                        <Option value="Coming Soon">
                          <Tag color="processing">Sắp ra mắt</Tag>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space>
                    <TagsOutlined />
                    <span>Quản lý kho hàng</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
              >
                <Row gutter={24}>
                  <Col span={hasVariants ? 12 : 8}>
                    <Form.Item
                      name="quantity"
                      label="Số lượng"
                      rules={[
                        {
                          required: !hasVariants,
                          message: "Vui lòng nhập số lượng",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        disabled={hasVariants}
                        placeholder={
                          hasVariants ? "Xem tab biến thể" : "Nhập số lượng"
                        }
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={hasVariants ? 12 : 16}>
                    <Form.Item
                      label="Sản phẩm biến thể"
                      tooltip="Bật nếu sản phẩm có nhiều biến thể kích thước và màu sắc khác nhau"
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Switch
                          checked={hasVariants}
                          onChange={(checked) => {
                            setHasVariants(checked);
                            if (!checked) {
                              // If variants are disabled, clear variants
                              setVariants([]);
                            }
                          }}
                          style={{ marginRight: 8 }}
                        />
                        <Text>{hasVariants ? "Đã bật" : "Đã tắt"}</Text>
                        {hasVariants && (
                          // Continue from the Button component in line ~616
                          <Button
                            type="link"
                            onClick={() => setActiveKey("2")}
                            style={{ marginLeft: 16 }}
                          >
                            Quản lý biến thể
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space>
                    <PictureOutlined />
                    <span>Hình ảnh sản phẩm</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
              >
                <Form.Item
                  label="Ảnh sản phẩm"
                  name="image"
                  rules={[
                    {
                      required: !fileList.length && !originalImageUrl,
                      message: "Vui lòng chọn ảnh sản phẩm",
                    },
                  ]}
                >
                  <Upload {...uploadProps}>
                    {fileList.length >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Card>

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={submitting}
                  style={{ marginRight: 16, minWidth: 120 }}
                >
                  Lưu sản phẩm
                </Button>
                <Button
                  size="large"
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/products")}
                  style={{ minWidth: 120 }}
                >
                  Quay lại
                </Button>
              </div>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TagsOutlined className="mr-2" />
                Biến thể sản phẩm
              </span>
            }
            key="2"
            disabled={!hasVariants}
          >
            {hasVariants ? (
              <div className="mb-8">
                <Card
                  title="Quản lý thuộc tính biến thể"
                  style={{ marginBottom: 24 }}
                >
                  <div className="mb-6">
                    <Alert
                      message="Quản lý biến thể sản phẩm"
                      description="Để tạo biến thể cho sản phẩm, bạn cần chọn các thuộc tính kích thước và màu sắc từ cơ sở dữ liệu."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  </div>

                  <Row gutter={24}>
                    <Col span={12}>
                      <div className="border rounded p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <Title level={5} style={{ margin: 0 }}>
                              Kích thước
                            </Title>
                            <Text type="secondary">
                              Chọn các kích thước áp dụng cho sản phẩm này
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            onClick={() => openAttributeSelector("size")}
                            icon={<PlusOutlined />}
                          >
                            Chọn kích thước
                          </Button>
                        </div>

                        {selectedSizeAttributes.length === 0 ? (
                          <Empty description="Chưa có thuộc tính kích thước nào được chọn" />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedSizeAttributes.map((attr) => (
                              <Tag
                                color="blue"
                                key={attr.id}
                                style={{ fontSize: "14px", padding: "4px 8px" }}
                              >
                                {attr.value}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="border rounded p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <Title level={5} style={{ margin: 0 }}>
                              Màu sắc
                            </Title>
                            <Text type="secondary">
                              Chọn các màu sắc áp dụng cho sản phẩm này
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            onClick={() => openAttributeSelector("color")}
                            icon={<PlusOutlined />}
                          >
                            Chọn màu sắc
                          </Button>
                        </div>

                        {selectedColorAttributes.length === 0 ? (
                          <Empty description="Chưa có thuộc tính màu sắc nào được chọn" />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedColorAttributes.map((attr) => (
                              <Tag
                                color={attr.colorCode || "purple"}
                                key={attr.id}
                                style={{
                                  fontSize: "14px",
                                  padding: "4px 8px",
                                  backgroundColor: attr.colorCode,
                                  color: isLightColor(attr.colorCode)
                                    ? "#000"
                                    : "#fff",
                                }}
                              >
                                {attr.value}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>

                <Card
                  title={
                    <div className="flex justify-between items-center">
                      <span>Danh sách biến thể ({variants.length})</span>
                      <Space>
                        <Button
                          onClick={() => setVariantView("grouped")}
                          type={
                            variantView === "grouped" ? "primary" : "default"
                          }
                          icon={<DatabaseOutlined />}
                        >
                          Nhóm theo kích thước
                        </Button>
                        <Button
                          onClick={() => setVariantView("list")}
                          type={variantView === "list" ? "primary" : "default"}
                          icon={<TagsOutlined />}
                        >
                          Danh sách đầy đủ
                        </Button>
                      </Space>
                    </div>
                  }
                  extra={
                    <Space>
                      <Tooltip title="Áp dụng giá cơ bản cho tất cả biến thể">
                        <Button
                          onClick={() =>
                            updateAllVariantPrices(form.getFieldValue("price"))
                          }
                          disabled={variants.length === 0}
                        >
                          Đồng bộ giá
                        </Button>
                      </Tooltip>
                    </Space>
                  }
                >
                  {variants.length === 0 && (
                    <Alert
                      message="Chưa có biến thể"
                      description={
                        selectedSizeAttributes.length === 0 ||
                        selectedColorAttributes.length === 0 ? (
                          "Hãy chọn các thuộc tính kích thước và màu sắc để tạo biến thể"
                        ) : (
                          <div>
                            <p>
                              Bạn đã chọn thuộc tính nhưng chưa tạo biến thể.
                              Nhấn vào nút bên dưới để tạo biến thể.
                            </p>
                            <Button
                              type="primary"
                              onClick={generateVariants}
                              style={{ marginTop: 8 }}
                            >
                              Tạo biến thể
                            </Button>
                          </div>
                        )
                      }
                      type="warning"
                      showIcon
                    />
                  )}

                  {variants.length > 0 && variantView === "grouped" && (
                    <Table
                      columns={groupedVariantColumns}
                      dataSource={groupedVariants}
                      expandable={{
                        expandedRowRender: expandedRowRender,
                      }}
                      pagination={false}
                      rowKey="size"
                    />
                  )}

                  {variants.length > 0 && variantView === "list" && (
                    <Table
                      columns={variantListColumns}
                      dataSource={variants}
                      pagination={
                        variants.length > 10
                          ? { pageSize: 10, showSizeChanger: true }
                          : false
                      }
                      rowKey="id"
                      scroll={{ x: 1000 }}
                    />
                  )}
                </Card>

                {variants.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Collapse>
                      <Panel
                        header="Công cụ điều chỉnh giá theo kích thước"
                        key="1"
                      >
                        <div>
                          <Text>
                            Điều chỉnh giá theo kích thước (% so với giá cơ bản)
                          </Text>
                          <div style={{ marginTop: 16 }}>
                            {selectedSizeAttributes.map((size) => (
                              <div
                                key={size.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                <Tag color="blue" style={{ width: 80 }}>
                                  {size.value}
                                </Tag>
                                <div style={{ marginLeft: 8, width: 150 }}>
                                  <InputNumber
                                    defaultValue={0}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace("%", "")}
                                    min={-50}
                                    max={100}
                                  />
                                </div>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 8 }}
                                >
                                  {`${
                                    form.getFieldValue("price")
                                      ? formatCurrency(
                                          form.getFieldValue("price")
                                        )
                                      : "0"
                                  }đ`}
                                </Text>
                              </div>
                            ))}
                            <div style={{ marginTop: 16 }}>
                              <Button
                                type="primary"
                                onClick={() => {
                                  // Example size price differences for demonstration
                                  const sizePriceDiffs =
                                    selectedSizeAttributes.map(
                                      (size, index) => ({
                                        size: size.value,
                                        percentage: index * 5, // Just an example
                                      })
                                    );
                                  applyPriceDifferenceBySize(sizePriceDiffs);
                                }}
                              >
                                Áp dụng
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                )}
              </div>
            ) : (
              <Empty
                description="Vui lòng bật tính năng sản phẩm biến thể ở tab Thông tin cơ bản"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
        </Tabs>
      </div>

      <AttributeSelectorModal
        visible={attributeModalVisible}
        onCancel={() => setAttributeModalVisible(false)}
        onSelect={handleAttributeSelected}
        attributeType={currentAttributeType}
        selectedValues={
          currentAttributeType === "size"
            ? selectedSizeAttributes
            : selectedColorAttributes
        }
      />
    </>
  );
};

// Helper function to determine if color is light
const isLightColor = (color) => {
  // Default to dark text for empty or undefined colors
  if (!color) return false;

  // Convert hex to RGB
  let r, g, b;
  if (color.startsWith("#")) {
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith("rgb")) {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    r = parseInt(rgb[0]);
    g = parseInt(rgb[1]);
    b = parseInt(rgb[2]);
  } else {
    // For named colors or other formats, default to dark text
    return false;
  }

  // Calculate luminance - standard formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5; // If luminance > 0.5, use dark text
};

export default ProductEdit;
