import React, { useEffect, useState } from "react";
import { Button, Popconfirm, Space, Table, Tag, Select } from "antd";
import { AttributeValueForm } from "./AttributeValueForm";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getAttributes } from "../../services/attribute-service";
import {
  deleteAttributeValue,
  getAttributeValues,
  getAttributeValuesByAttribute,
} from "../../services/attribute-value-service";

export const AttributeValue = () => {
  const [attributeValues, setAttributeValues] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const expandedRowRender = (record) => {
    const isColorAttribute = record.name === "Màu sắc";

    const columns = [
      {
        title: "STT",
        key: "stt",
        render: (_, __, index) => index + 1,
        width: 70,
        align: "center",
      },
      {
        title: "Giá trị",
        dataIndex: "value",
        key: "value",
        render: (text) => <span className="font-medium">{text}</span>,
      },
      ...(isColorAttribute
        ? [
            {
              title: "Mã màu",
              dataIndex: "colorCode",
              key: "colorCode",
              render: (colorCode) => (
                <div className="flex items-center gap-2">
                  {colorCode && (
                    <>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorCode }}
                      ></div>
                      <span>{colorCode}</span>
                    </>
                  )}
                </div>
              ),
            },
          ]
        : []),
      {
        title: "Trạng thái",
        key: "status",
        dataIndex: "status",
        render: (status) => (
          <Tag
            color={status ? "green" : "red"}
            className="px-3 py-1 rounded-full"
          >
            {status ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        ),
        align: "center",
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, item) => (
          <Space size="middle">
            <Button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => {
                setEditingRecord(item);
                setModalOpen(true);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xoá giá trị thuộc tính"
              description="Bạn có chắc chắn muốn xoá giá trị thuộc tính này không?"
              onConfirm={() => handleDelete(item.id)}
              okText="Đồng ý"
              cancelText="Huỷ"
              okButtonProps={{ className: "bg-red-500" }}
            >
              <Button className="text-red-600 hover:text-red-800">
                Xoá
              </Button>
            </Popconfirm>
          </Space>
        ),
        align: "center",
      },
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={record.values}
        pagination={false}
        className="nested-table"
      />
    );
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
      title: "Thuộc tính",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium text-lg">{text}</span>,
    },
    {
      title: "Số lượng giá trị",
      dataIndex: "count",
      key: "count",
      render: (count) => (
        <Tag color="blue" className="px-3 py-1 rounded-full">
          {count}
        </Tag>
      ),
      align: "center",
    },
  ];

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (attributes.length > 0) {
      fetchAttributeValues();
    }
  }, [attributes]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await getAttributes();
      setAttributes(response);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách thuộc tính!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttributeValues = async () => {
    try {
      setLoading(true);
      const response = await getAttributeValues();
      
      const groupedData = processAttributeValues(response);
      setAttributeValues(groupedData);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách giá trị thuộc tính!");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttributeValuesByAttribute = async (attributeId) => {
    try {
      setLoading(true);
      const response = await getAttributeValuesByAttribute(attributeId);
      
      const filteredAttribute = attributes.find(attr => attr.id === attributeId);
      if (filteredAttribute) {
        const groupedData = [
          {
            id: filteredAttribute.id,
            name: filteredAttribute.name,
            count: response.length,
            values: response
          }
        ];
        setAttributeValues(groupedData);
      } else {
        setAttributeValues([]);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách giá trị thuộc tính!");
    } finally {
      setLoading(false);
    }
  };

  const processAttributeValues = (values) => {
    const groupedByAttribute = {};
    
    values.forEach(value => {
      const attributeId = value.attributeId;
      if (!groupedByAttribute[attributeId]) {
        groupedByAttribute[attributeId] = [];
      }
      groupedByAttribute[attributeId].push(value);
    });
    
    return Object.keys(groupedByAttribute).map(attributeId => {
      const attribute = attributes.find(attr => attr.id === attributeId);
      return {
        id: attributeId,
        name: attribute ? attribute.name : "Unknown",
        count: groupedByAttribute[attributeId].length,
        values: groupedByAttribute[attributeId]
      };
    });
  };

  const handleSubmit = () => {
    if (selectedAttribute) {
      fetchAttributeValuesByAttribute(selectedAttribute);
    } else {
      fetchAttributeValues();
    }
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttributeValue(id);
      if (selectedAttribute) {
        fetchAttributeValuesByAttribute(selectedAttribute);
      } else {
        fetchAttributeValues();
      }
      toast.success("Xóa giá trị thuộc tính thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa giá trị thuộc tính!");
    }
  };

  const handleAttributeFilter = (value) => {
    setSelectedAttribute(value);
    if (value) {
      fetchAttributeValuesByAttribute(value);
    } else {
      fetchAttributeValues();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Danh sách giá trị thuộc tính
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          Thêm mới
        </Button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <span className="font-medium text-gray-700 mr-4">
            Lọc theo thuộc tính:
          </span>
          <Select
            placeholder="Chọn thuộc tính"
            className="w-64"
            allowClear
            onChange={handleAttributeFilter}
            options={attributes.map((attr) => ({
              value: attr.id,
              label: attr.name,
            }))}
          />
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        expandable={{
          expandedRowRender,
          defaultExpandAllRows: true,
        }}
        dataSource={attributeValues}
        className="shadow-md rounded-lg overflow-hidden"
        pagination={false}
        bordered
        loading={loading}
        locale={{
          emptyText: (
            <div className="py-10 text-gray-500">
              Chưa có giá trị thuộc tính nào được thêm
            </div>
          ),
        }}
      />

      <AttributeValueForm
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingRecord}
        attributes={attributes}
      />
    </div>
  );
};