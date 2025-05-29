import { useState, useEffect } from "react";
import {
  Modal,
  List,
  Tag,
  Button,
  Spin,
  Empty,
  Checkbox,
  Space,
  Tabs,
  message,
  Typography,
} from "antd";
import {
  TagsOutlined,
  AppstoreAddOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAttributeValuesByAttribute } from "../../services/attribute-value-service";
import { getAttributes } from "../../services/attribute-service";

const { Text } = Typography;
const { TabPane } = Tabs;

const AttributeSelectorModal = ({
  visible,
  onCancel,
  onSelect,
  attributeType,
  selectedValues = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedItems, setSelectedItems] = useState(selectedValues);


  useEffect(() => {
    if (visible) {
      fetchAttributes();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setSelectedAttribute(null);
      setAttributeValues([]);
    } else {
      setSelectedItems(selectedValues);
    }
  }, [visible, selectedValues]);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const data = await getAttributes();
      const filteredAttributes = data.filter((attr) =>
        attributeType === "size"
          ? attr.name.toLowerCase().includes("kích")
          : attr.name.toLowerCase().includes("màu")
      );
      setAttributes(filteredAttributes);

      if (filteredAttributes.length > 0 && !selectedAttribute) {
        setSelectedAttribute(filteredAttributes[0].id);
        fetchAttributeValues(filteredAttributes[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      message.error("Không thể tải danh sách thuộc tính");
      setLoading(false);
    }
  };

  const fetchAttributeValues = async (attributeId) => {
    setLoading(true);
    try {
      const values = await getAttributeValuesByAttribute(attributeId);
      setAttributeValues(values);
    } catch (error) {
      console.error("Error fetching attribute values:", error);
      message.error("Không thể tải giá trị thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attributeId) => {
    setSelectedAttribute(attributeId);
    fetchAttributeValues(attributeId);
  };

  const toggleItemSelection = (item) => {
    const isSelected = selectedItems.some((i) => i.id === item.id);

    if (isSelected) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedItems);
    onCancel();
  };

  const renderAttributeTabs = () => {
    if (attributes.length === 0) {
      return <Empty description="Không tìm thấy thuộc tính" />;
    }

    return (
      <Tabs
        activeKey={selectedAttribute}
        onChange={handleAttributeChange}
        type="card"
        style={{ marginBottom: "16px" }}
        tabBarExtraContent={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAttributes}
            size="small"
          >
            Làm mới
          </Button>
        }
      >
        {attributes.map((attr) => (
          <TabPane
            tab={
              <span>
                <TagsOutlined style={{ marginRight: 4 }} />
                {attr.name}
              </span>
            }
            key={attr.id}
          />
        ))}
      </Tabs>
    );
  };

  const renderAttributeValues = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin />
        </div>
      );
    }

    if (attributeValues.length === 0) {
      return (
        <Empty
          description="Không có giá trị thuộc tính"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        bordered
        dataSource={attributeValues}
        renderItem={(item) => {
          const isSelected = selectedItems.some((i) => i.value === item.value);

          return (
            <List.Item
              key={item.id}
              style={{
                cursor: "pointer",
                backgroundColor: isSelected ? "#f0f5ff" : "transparent",
                transition: "background-color 0.3s",
              }}
              onClick={() => toggleItemSelection(item)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Space>
                  <Checkbox checked={isSelected} />
                  {attributeType === "color" ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div />
                      <Tag color={item.colorCode || item.value}>
                        {item.value}
                      </Tag>
                      {item.colorCode && (
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", marginLeft: "4px" }}
                        >
                          {item.colorCode}
                        </Text>
                      )}
                    </div>
                  ) : (
                    <Tag
                      color="blue"
                      style={{ minWidth: "60px", textAlign: "center" }}
                    >
                      {item.value}
                    </Tag>
                  )}
                </Space>
                {isSelected && <Text type="success">Đã chọn</Text>}
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <Modal
      title={
        <span>
          <AppstoreAddOutlined style={{ marginRight: 8 }} />
          Chọn {attributeType === "size" ? "kích thước" : "màu sắc"} cho biến
          thể
        </span>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm}>
          Xác nhận ({selectedItems.length} đã chọn)
        </Button>,
      ]}
    >
      <div>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Chọn loại {attributeType === "size" ? "kích thước" : "màu sắc"} từ
          danh sách thuộc tính có sẵn
        </Text>

        {renderAttributeTabs()}
        {renderAttributeValues()}
      </div>
    </Modal>
  );
};

export default AttributeSelectorModal;
