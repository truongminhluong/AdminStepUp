import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Input, Select, Popconfirm } from "antd";
import { toast } from "react-toastify";
import { deleteCategory, getCategories, storeCategory, updateCategory } from "../services/category-service";

const { Option } = Select;

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const showModal = (category = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
        if (category) {
            form.setFieldValue({
                ...category,
                status: Boolean(category.status),
            });
        
        } else {
            form.resetFields();
            form.setFieldsValue({ status: true });
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const onFinish = async (values) => {
        console.log("Giá trị gửi lên Firebase:", values);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, values);
            } else {
                await storeCategory(values);
            }
            handleCancel();
            fetchCategories();
        } catch (error) {
            toast.error("Lỗi khi lưu danh mục!");
        }
    };

    const handleDelete = async (id) => {
        await deleteCategory(id);
        toast.success("Xóa danh mục thành công!");
        fetchCategories();
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Tên danh mục",
            dataIndex: "category_name",
            key: "category_name",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) =>
                status ? (
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
                    <Button type="link" onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa danh mục này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 20 }}>
                Thêm danh mục
            </Button>

            <Table columns={columns} dataSource={categories} rowKey="id" />

            <Modal
                title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    initialValues={{ status: true }}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="category_name"
                        rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value={true}>Hoạt động</Option>
                            <Option value={false}>Tạm ngưng</Option>
                        </Select>

                    </Form.Item>

                    <Form.Item style={{ textAlign: "center" }}>
                        <Button type="primary" htmlType="submit">
                            {editingCategory ? "Cập nhật" : "Thêm danh mục"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Category;
