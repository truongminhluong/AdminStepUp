import React, { useEffect, useState } from "react";
import {
  Button,
  Switch,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Tooltip,
  Tag,
  Select,
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  FileExcelOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";

const GiftCards = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editData, setEditData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const fetchVouchers = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "vouchers"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const now = new Date();
    const nearExpiry = 3 * 24 * 60 * 60 * 1000;

    const updates = data.map(async (voucher) => {
      if (voucher.expiryDate) {
        const expiry = new Date(voucher.expiryDate.seconds * 1000);
        if (expiry < now && voucher.isActive) {
          const ref = doc(db, "vouchers", voucher.id);
          await updateDoc(ref, { isActive: false });
          voucher.isActive = false;
        } else if (expiry - now < nearExpiry && voucher.isActive) {
          message.warning(`Voucher ${voucher.code} sắp hết hạn!`);
        }
      }
    });

    await Promise.all(updates);

    data.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    setVouchers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const showEditModal = (record) => {
    setEditData(record);
    form.setFieldsValue({
      code: record.code,
      value: record.value,
      type: record.type,
      quantity: record.quantity,
      minimumSpend: record.minimumSpend,
      expiryDate: record.expiryDate
        ? dayjs(record.expiryDate.seconds * 1000)
        : null,
    });

    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditData(null);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate
          ? Timestamp.fromDate(values.expiryDate.toDate())
          : null,
      };

      if (editData) {
        const voucherRef = doc(db, "vouchers", editData.id);
        await updateDoc(voucherRef, formattedValues);
        message.success("Cập nhật voucher thành công!");
      } else {
        await addDoc(collection(db, "vouchers"), {
          ...formattedValues,
          usedBy: [],
          isActive: true,
          createdAt: Timestamp.now(),
        });
        message.success("Thêm voucher thành công!");
      }

      fetchVouchers();
      handleCancel();
    } catch (error) {
      message.error("Đã có lỗi xảy ra.");
    }
  };

  const toggleVoucherStatus = async (record) => {
    try {
      const voucherRef = doc(db, "vouchers", record.id);
      await updateDoc(voucherRef, {
        isActive: !record.isActive,
      });
      message.success("Cập nhật trạng thái thành công!");
      fetchVouchers();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái.");
    }
  };

  const exportToExcel = () => {
    const data = vouchers.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
    XLSX.writeFile(workbook, "vouchers.xlsx");
  };

  const total = vouchers.length;
  const activeCount = vouchers.filter((v) => v.isActive).length;
  const expiredCount = vouchers.filter(
    (v) => v.expiryDate && new Date(v.expiryDate.seconds * 1000) < new Date()
  ).length;
  const totalUsed = vouchers.reduce((sum, v) => sum + v.usedBy.length, 0);

  const pieData = [
    { name: "Đang hoạt động", value: activeCount },
    { name: "Hết hạn", value: expiredCount },
    { name: "Đã dùng", value: totalUsed },
  ];

  const COLORS = ["#52c41a", "#ff4d4f", "#1890ff"];

  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(searchText.toLowerCase()) ||
      v.type.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && v.isActive) ||
      (statusFilter === "inactive" && !v.isActive);

    const matchDate =
      !dateRange ||
      (v.expiryDate &&
        dayjs(v.expiryDate.seconds * 1000).isAfter(dateRange[0], "day") &&
        dayjs(v.expiryDate.seconds * 1000).isBefore(dateRange[1], "day"));

    return matchSearch && matchStatus && matchDate;
  });

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
    },

    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value) =>
        typeof value === "number"
          ? value.toLocaleString() + " VND"
          : "Không xác định",
    },

    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Chi tiêu tối thiểu",
      dataIndex: "minimumSpend",
      key: "minimumSpend",
      render: (val) => val?.toLocaleString() + " VND",
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đã dùng",
      dataIndex: "usedBy",
      key: "usedBy",
      render: (usedBy) => usedBy.length,
    },
    {
      title: "Hạn dùng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) =>
        date ? dayjs(date.seconds * 1000).format("DD/MM/YYYY") : "Không có",
    },
    {
      title: "Trạng thái",
      key: "statusText",
      render: (record) => (
        <span style={{ color: record.isActive ? "#52c41a" : "red" }}>
          {record.isActive ? "Đang hoạt động" : "Đã tắt"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const isUsed = record.usedBy.length > 0;
        const isExpired =
          record.expiryDate &&
          new Date(record.expiryDate.seconds * 1000) < new Date();
        const canEdit = !isUsed && !isExpired;
        return (
          <>
            <Tooltip
              title={
                canEdit ? "Chỉnh sửa" : "Không thể sửa vì đã dùng hoặc hết hạn"
              }
            >
              <Button
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
                disabled={!canEdit}
              />
            </Tooltip>
            <Tooltip title={record.isActive ? "Tắt voucher" : "Bật voucher"}>
              <Switch
                checked={record.isActive}
                onChange={() => toggleVoucherStatus(record)}
                checkedChildren={<CheckOutlined style={{ color: "white" }} />}
                unCheckedChildren=""
                style={{
                  marginLeft: 12,
                  backgroundColor: record.isActive ? "#52c41a" : "red",
                }}
              />
            </Tooltip>
            {record.isActive && (
              <Tooltip title="Xem người đã dùng">
              <Tag
                color="blue"
                style={{ marginLeft: 12, cursor: "pointer" }}
                onClick={() => {
                  navigate("/voucher-users", {
                    state: {
                      code: record.code,
                      usedBy: record.usedBy,
                    },
                  });
                }}
              >
                Đã dùng
              </Tag>
            </Tooltip>
            
            )}
          </>
        );
      },
    },
  ];

  const viewStatistics = () => {
    navigate("/voucher-stats", {
      state: {
        total,
        activeCount,
        expiredCount,
        totalUsed,
      },
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý thẻ quà tặng</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<BarChartOutlined />} disabled>
            Tổng: {total} | Hoạt động: {activeCount} | Hết hạn: {expiredCount} |
            Dùng: {totalUsed}
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
            Xuất Excel
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setEditData(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm voucher
          </Button>
          <Button type="default" onClick={viewStatistics}>
            Xem Thống Kê
          </Button>
        </div>
      </div>

      <div
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Tìm theo mã hoặc loại"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="active">Đang hoạt động</Select.Option>
          <Select.Option value="inactive">Đã tắt</Select.Option>
        </Select>
        <DatePicker.RangePicker
          format="DD/MM/YYYY"
          onChange={(range) => setDateRange(range)}
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredVouchers}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredVouchers.length,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: handlePageChange,
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setCurrentPage(current);
          },
          showTotal: (total) => `Tổng ${total} mục`,
          position: ["bottomLeft"],
        }}
        scroll={{ y: 1000 }}
        sticky
        forceRender
      />

      <Modal
        title={editData ? "Chỉnh sửa Voucher" : "Thêm Voucher"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: "Mã không được để trống!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá trị"
            name="value"
            rules={[
              { required: true, message: "Giá trị không được để trống!" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Loại không được để trống!" }]}
          >
            <Select placeholder="Chọn loại...">
              <Select.Option value="Phần trăm (%)">Phần trăm (%)</Select.Option>
              <Select.Option value="Số tiền (VNĐ)">Số tiền (VNĐ)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Chi tiêu tối thiểu"
            name="minimumSpend"
            rules={[
              { required: true, message: "Vui lòng nhập chi tiêu tối thiểu!" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: "Số lượng không được để trống!" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Hạn dùng" name="expiryDate">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              {editData ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GiftCards;
