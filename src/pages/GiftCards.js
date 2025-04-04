import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from "firebase/firestore";
import dayjs from "dayjs";

const { Option } = Select;

const GiftCards = () => {
    const [giftCards, setGiftCards] = useState(() => {
        // 🔹 Lấy dữ liệu từ localStorage khi khởi động
        const storedData = localStorage.getItem("giftCards");
        return storedData ? JSON.parse(storedData) : [];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "giftCards"), (snapshot) => {
            const cards = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    expiry: data.expiry ? data.expiry.toDate() : null
                };
            });

            setGiftCards(cards);
            localStorage.setItem("giftCards", JSON.stringify(cards)); // 🔹 Lưu vào localStorage
        });

        return () => unsubscribe();
    }, []);

    const showEditModal = (record) => {
        setEditingCard(record);
        form.setFieldsValue({
            ...record,
            value: parseFloat(record.value.replace(/,/g, "")), 
            expiry: record.expiry ? dayjs(record.expiry) : null
        });
        setIsModalOpen(true);
    };

    const showAddModal = () => {
        setEditingCard(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSave = async () => {
        form.validateFields().then(async (values) => {
            const formattedValue = values.value.toLocaleString("vi-VN");
            const formattedExpiry = values.expiry ? Timestamp.fromDate(values.expiry.toDate()) : null;

            const dataToSave = { ...values, value: formattedValue, expiry: formattedExpiry };

            if (editingCard) {
                await updateDoc(doc(db, "giftCards", editingCard.id), dataToSave);
            } else {
                await addDoc(collection(db, "giftCards"), dataToSave);
            }
            handleCancel();
        });
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "giftCards", id));
    };

    const columns = [
        { title: "Mã thẻ", dataIndex: "code", key: "code" },
        { title: "Loại giảm giá", dataIndex: "type", key: "type" },
        { title: "Giá trị", dataIndex: "value", key: "value" },
        { 
            title: "Ngày hết hạn", 
            dataIndex: "expiry", 
            key: "expiry",
            render: (expiry) => expiry ? dayjs(expiry).format("DD/MM/YYYY") : "Chưa đặt",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <>
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} style={{ marginRight: 8 }} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </>
            ),
        },
    ];

    return (
        <div>
            <h2>Quản lý thẻ quà tặng</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{ marginBottom: 16 }}>
                Thêm mới
            </Button>
            <Table dataSource={giftCards} columns={columns} rowKey="id" />
            <Modal title={editingCard ? "Chỉnh sửa thẻ quà tặng" : "Thêm thẻ quà tặng"} open={isModalOpen} onOk={handleSave} onCancel={handleCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã thẻ" rules={[{ required: true, message: "Vui lòng nhập mã thẻ" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true, message: "Vui lòng chọn loại" }]}>
                        <Select>
                            <Option value="Voucher">Voucher</Option>
                            <Option value="Ship">Ship</Option>
                            <Option value="Giảm giá tiền">Giảm giá tiền</Option>
                            <Option value="Giảm %">Giảm %</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="value" label="Giá trị (VND)" rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}>
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                    <Form.Item name="expiry" label="Ngày hết hạn" rules={[{ required: true, message: "Vui lòng chọn ngày" }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GiftCards;
