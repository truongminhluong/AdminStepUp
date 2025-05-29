import React, { useEffect, useState } from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { AttributeForm } from "./AttributeForm.js";
import {
  deleteAttribute,
  getAttributes,
} from "../../services/attribute-service.js";
import { toast } from "react-toastify";
import { PlusOutlined } from "@ant-design/icons";

export const Attribute = () => {
  const [attributes, setAttributes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Tên thuộc tính",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setEditingRecord(record);
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá thuộc tính"
            description="Bạn có chắc chắn muốn xoá thuộc tính này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Huỷ"
            okButtonProps={{ className: "bg-red-500" }}
          >
            <Button type="link" className="text-red-600 hover:text-red-800">
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
      align: "center",
    },
  ];

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const data = await getAttributes();
      setAttributes(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách thuộc tính!");
    }
  };

  const handleSubmit = (values) => {
    console.log(values);
    setModalOpen(false);
    setEditingRecord(null);
    fetchAttributes();
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttribute(id);
      toast.success("Xóa thuộc tính thành công!");
      fetchAttributes();
    } catch (error) {
      toast.error("Lỗi khi xóa thuộc tính!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Danh sách thuộc tính
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

      <Table
        rowKey="id"
        columns={columns}
        dataSource={attributes}
        className="shadow-md rounded-lg overflow-hidden"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        bordered
        locale={{
          emptyText: (
            <div className="py-10 text-gray-500">
              Chưa có thuộc tính nào được thêm
            </div>
          ),
        }}
      />

      <AttributeForm
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingRecord}
      />
    </div>
  );
};