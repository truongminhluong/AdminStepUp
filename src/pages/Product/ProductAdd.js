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
} from "antd";

import {
  UploadOutlined,
  PlusOutlined,
  AppstoreAddOutlined,
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
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { getBrands } from "../../services/brand-service";
import { storeProductFromFireBase } from "../../services/product-service";
import {
  formatCurrency,
  formats,
  generateRandomSKU,
  modules,
} from "../../lib/common";
import AttributeSelectorModal from "./AttribbuteSelectModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const ProductAdd = () => {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);

  const [attributeModalVisible, setAttributeModalVisible] = useState(false);
  const [currentAttributeType, setCurrentAttributeType] = useState(null);
  const [selectedSizeAttributes, setSelectedSizeAttributes] = useState([]);
  const [selectedColorAttributes, setSelectedColorAttributes] = useState([]);
  const [description, setDescription] = useState("");

  const [variants, setVariants] = useState([]);
  const [activeKey, setActiveKey] = useState("1");

  const [groupedVariants, setGroupedVariants] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

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
    if (!fileList.length) {
      message.error("Vui lòng chọn ảnh sản phẩm khi thêm mới!");
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

    if (hasVariants) {
      for (const variant of variants) {
        if (!variant.imageFile) {
          message.error(
            `Vui lòng tải lên ảnh cho biến thể ${variant.size} - ${variant.color}!`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    form.setFieldsValue({ description: value });
  };

  const handleSubmit = async () => {
    if (!validateImage() || !validateVariants()) {
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log(values);

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj || fileList[0];
        if (file) {
          values.imageUrl = await fileToBase64(file);
        } else {
          values.imageUrl = "";
        }
      } else {
        values.imageUrl = "";
      }

      values.description = description;
      values.price = Number(values.price);
      values.quantity = hasVariants
        ? variants.reduce((sum, variant) => sum + variant.quantity, 0)
        : Number(values.quantity);

      if (hasVariants && variants.length > 0) {
        values.variants = [...variants];
        for (let i = 0; i < values.variants.length; i++) {
          const variant = values.variants[i];

          if (variant.imageFile) {
            const fileObj =
              variant.imageFile.originFileObj || variant.imageFile;

            if (fileObj instanceof File || fileObj instanceof Blob) {
              try {
                values.variants[i].imageUrl = await fileToBase64(fileObj);
              } catch (error) {
                console.error(
                  `Lỗi khi chuyển đổi ảnh biến thể ${variant.id} sang base64:`,
                  error
                );
                values.variants[i].imageUrl = ""; 
              }
            } else if (variant.imageFile.url) {
              values.variants[i].imageUrl = variant.imageFile.url;
            }
          }
        }

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
      }

      await storeProductFromFireBase(values);
      message.success("Thêm sản phẩm thành công");
      console.log(values);

      form.resetFields();
      setFileList([]);
      setVariants([]);
      setHasVariants(false);
      setSelectedSizeAttributes([]);
      setSelectedColorAttributes([]);

      navigate("/products");
    } catch (error) {
      message.error("Lưu sản phẩm thất bại");
      console.error("Lỗi khi lưu sản phẩm:", error);
    } finally {
      setLoading(false);
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
            imageFile: null,
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
        title: "Ảnh biến thể",
        key: "variantImage",
        render: (_, record) => (
          <Upload
            listType="picture-card"
            maxCount={1}
            fileList={record.imageFile ? [record.imageFile] : []}
            beforeUpload={(file) => {
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
              handleVariantChange(record.id, "imageFile", file);

              file.url = URL.createObjectURL(file);

              return false;
            }}
            onRemove={() => handleVariantChange(record.id, "imageFile", null)}
          >
            {!record.imageFile && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        ),
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
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (quantity) => <span>{quantity} sản phẩm</span>,
    },
  ];

  return (
    <>
      <div className="p-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Thêm sản phẩm</h2>

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
              initialValues={{ status: "true" }}
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
                    <Form.Item
                      name="status"
                      label="Trạng thái"
                      initialValue={true}
                    >
                      <Select size="large">
                        <Option value={true}>
                          <Tag color="success">Còn hàng</Tag>
                        </Option>
                        <Option value={false}>
                          <Tag color="error">Hết hàng</Tag>
                        </Option>
                        {/* <Option value="ComingSoon">
                          <Tag color="processing">Sắp ra mắt</Tag>
                        </Option> */}
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
                          <Button
                            type="link"
                            onClick={() => setActiveKey("2")}
                            style={{ marginLeft: 16 }}
                          >
                            Quản lý biến thể <EditOutlined />
                          </Button>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                {hasVariants && (
                  <Alert
                    message="Hướng dẫn tạo biến thể"
                    description="Để tạo biến thể, hãy chuyển sang tab 'Biến thể sản phẩm' và chọn các giá trị kích thước và màu sắc từ cơ sở dữ liệu."
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                    action={
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setActiveKey("2")}
                      >
                        Đi đến biến thể
                      </Button>
                    }
                  />
                )}
              </Card>

              <Card
                title={
                  <Space>
                    <PictureOutlined />
                    <span>Ảnh sản phẩm</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
              >
                <Form.Item
                  label="Ảnh đại diện sản phẩm"
                  required
                  rules={[
                    { required: true, message: "Vui lòng chọn ảnh sản phẩm" },
                  ]}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Upload listType="picture-card" {...uploadProps}>
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                    <Text type="secondary" style={{ marginTop: 8 }}>
                      Hỗ trợ: JPG, PNG, JPEG (tối đa 2MB)
                    </Text>
                  </div>
                </Form.Item>
              </Card>

              <Card
                title={
                  <Space>
                    <DatabaseOutlined />
                    <span>Mô tả sản phẩm</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
              >
                <Form.Item
                  label="Mô tả chi tiết"
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mô tả sản phẩm",
                    },
                  ]}
                >
                  <div
                    className="rich-text-editor-container"
                    style={{ minHeight: "200px" }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={handleDescriptionChange}
                      modules={modules}
                      formats={formats}
                      style={{ height: "200px" }}
                      placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    />
                  </div>
                  <div style={{ marginTop: "40px" }}></div>
                </Form.Item>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "16px 0",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginTop: "16px",
                }}
              >
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<PlusOutlined />}
                    style={{ minWidth: "150px" }}
                  >
                    Lưu sản phẩm
                  </Button>

                  {hasVariants && (
                    <Button
                      type="default"
                      size="large"
                      onClick={() => setActiveKey("2")}
                      icon={<EditOutlined />}
                    >
                      Quản lý biến thể
                    </Button>
                  )}

                  <Button
                    size="large"
                    danger
                    onClick={() => navigate("/admin/products")}
                    icon={<DeleteOutlined />}
                  >
                    Hủy
                  </Button>
                </Space>
              </div>
            </Form>
          </TabPane>

          {hasVariants && (
            <TabPane
              tab={
                <span>
                  <TagsOutlined className="mr-2" />
                  Biến thể sản phẩm
                </span>
              }
              key="2"
            >
              <Card
                title={
                  <Space>
                    <TagsOutlined />
                    <span>Quản lý biến thể sản phẩm</span>
                  </Space>
                }
                type="inner"
                style={{ marginBottom: "24px" }}
                headStyle={{ backgroundColor: "#f5f5f5" }}
                extra={
                  <Space>
                    <Button
                      type="primary"
                      onClick={generateVariants}
                      icon={<CopyOutlined />}
                      disabled={
                        !selectedSizeAttributes.length ||
                        !selectedColorAttributes.length
                      }
                    >
                      Tạo lại biến thể
                    </Button>
                    <Button onClick={() => setActiveKey("1")}>
                      Quay lại thông tin cơ bản
                    </Button>
                  </Space>
                }
              >
                {/* Phần Cấu hình biến thể */}
                <Collapse
                  defaultActiveKey={["1"]}
                  style={{ marginBottom: 16 }}
                  bordered={false}
                >
                  <Panel
                    header={
                      <span style={{ fontWeight: 500 }}>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        Cấu hình biến thể
                      </span>
                    }
                    key="1"
                    style={{ backgroundColor: "#f9f9f9" }}
                  >
                    <div className="flex flex-col gap-4 ">
                      <div className="flex gap-2 items-center">
                        <p className="min-w-[80px] text-sm text-gray-700">
                          Kích cỡ:
                        </p>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openAttributeSelector("size")}
                        />
                        {selectedSizeAttributes.length > 0 && (
                          <div style={{ marginLeft: 16 }}>
                            {selectedSizeAttributes.map((attr) => (
                              <Tag
                                key={attr.id}
                                color="blue"
                                style={{ marginRight: 4, marginBottom: 4 }}
                              >
                                {attr.value}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">
                        <p className="min-w-[80px] text-sm text-gray-700">
                          Màu sắc:
                        </p>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openAttributeSelector("color")}
                        />
                        {selectedColorAttributes.length > 0 && (
                          <div style={{ marginLeft: 16 }}>
                            {selectedColorAttributes.map((attr) => (
                              <Tag
                                key={attr.id}
                                style={{
                                  marginRight: 4,
                                  marginBottom: 4,
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
                    </div>
                  </Panel>
                </Collapse>

                {groupedVariants.length > 0 ? (
                  <>
                    <Card
                      title={
                        <Title level={5} style={{ margin: 0 }}>
                          <ShoppingOutlined style={{ marginRight: 8 }} />
                          Danh sách biến thể theo kích thước (
                          {groupedVariants.length} kích thước, {variants.length}{" "}
                          biến thể)
                        </Title>
                      }
                      style={{ marginBottom: 16 }}
                      extra={
                        <Tooltip title="Biến thể được nhóm theo kích thước, nhấp vào mũi tên để xem các màu sắc">
                          <InfoCircleOutlined />
                        </Tooltip>
                      }
                    >
                      <Table
                        columns={groupedVariantColumns}
                        expandable={{
                          expandedRowRender,
                          defaultExpandAllRows: true,
                        }}
                        dataSource={groupedVariants}
                        rowKey="size"
                        pagination={false}
                        bordered
                        size="middle"
                        summary={(pageData) => {
                          const totalItems = pageData.reduce(
                            (sum, item) => sum + item.totalQuantity,
                            0
                          );
                          return (
                            <Table.Summary.Row>
                              <Table.Summary.Cell
                                index={0}
                                colSpan={2}
                                align="center"
                              >
                                <strong>Tổng</strong>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="center">
                                <strong>{totalItems} sản phẩm</strong>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          );
                        }}
                      />
                    </Card>
                  </>
                ) : (
                  <Alert
                    message="Chưa có biến thể"
                    description="Hãy chọn các giá trị kích thước và màu sắc từ cơ sở dữ liệu, sau đó nhấn 'Tạo lại biến thể' để tạo các biến thể sản phẩm."
                    type="warning"
                    showIcon
                    style={{ marginTop: 16, marginBottom: 16 }}
                  />
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "16px 0",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginTop: "16px",
                  }}
                >
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      loading={loading}
                      icon={<PlusOutlined />}
                      style={{ minWidth: "150px" }}
                    >
                      Lưu sản phẩm
                    </Button>

                    <Button
                      size="large"
                      onClick={() => setActiveKey("1")}
                      icon={<InfoCircleOutlined />}
                    >
                      Quay lại thông tin cơ bản
                    </Button>
                  </Space>
                </div>
              </Card>
            </TabPane>
          )}
        </Tabs>
      </div>

      {/* Attribute Selector Modal */}
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

const isLightColor = (color) => {
  if (!color) return false;

  const hex = color.replace("#", "");

  // If not a valid hex color, return false
  if (!/^[0-9A-F]{6}$/i.test(hex)) return false;

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light, false if dark
  return luminance > 0.5;
};

export default ProductAdd;
