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
import { Popconfirm } from "antd";

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

  const generateRandomCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },

    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value, record) => {
        if (typeof value !== "number") return "Không xác định";
        return record.type === "Phần trăm (%)"
          ? `${value}%`
          : `${value.toLocaleString()} VNĐ`;
      },
    },

    {
      title: "Chi tiêu tối thiểu",
      dataIndex: "minimumSpend",
      key: "minimumSpend",
      render: (value, record) => {
        if (record.type === "Phần trăm (%)") {
          return "-";
        }
        return value ? `${value.toLocaleString()} VNĐ` : "-";
      },
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
      render: (date) => {
        if (!date) return "Không có";
        const expiry = dayjs(date.seconds * 1000); // nếu là Firestore Timestamp
        const now = dayjs();
        const diffDays = expiry.diff(now, "day");

        let color = "inherit";
        if (diffDays < 0) {
          color = "red"; // đã hết hạn
        } else if (diffDays <= 3) {
          color = "orange"; // sắp hết hạn
        }

        return <span style={{ color }}>{expiry.format("DD/MM/YYYY")}</span>;
      },
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
    //dfeiahuufau
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const isUsed = record.usedBy.length > 0;
        const isExpired =
          record.expiryDate &&
          new Date(record.expiryDate.seconds * 1000) < new Date();
        const canEdit = !record.isActive || isExpired;

        return (
          <>
            <Tooltip
              title={
                canEdit
                  ? "Chỉnh sửa"
                  : "Không thể sửa khi đang bật và chưa hết hạn"
              }
            >
              <Button
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
                disabled={!canEdit}
              />
            </Tooltip>

            {record.isActive ? (
              <Tooltip title="Tắt voucher">
                <Switch
                  checked
                  onChange={() => toggleVoucherStatus(record)}
                  checkedChildren={<CheckOutlined style={{ color: "white" }} />}
                  unCheckedChildren=""
                  style={{
                    marginLeft: 12,
                    backgroundColor: "#52c41a",
                  }}
                />
              </Tooltip>
            ) : (
              <Popconfirm
                title="Bạn có chắc muốn bật voucher này không?"
                okText="Bật"
                cancelText="Hủy"
                onConfirm={() => {
                  const { type, value, minimumSpend } = record;

                  if (value <= 0) {
                    message.error("Giá trị phải lớn hơn 0!");
                    return;
                  }

                  if (type === "Phần trăm (%)") {
                    if (value > 100) {
                      message.error("Phần trăm không được vượt quá 100!");
                      return;
                    }
                  }

                  if (type === "Số tiền (VNĐ)") {
                    if (minimumSpend == null) {
                      message.error(
                        "Chi tiêu tối thiểu bắt buộc với loại Số tiền!"
                      );
                      return;
                    }
                    if (value >= minimumSpend) {
                      message.error("Giá trị phải nhỏ hơn Chi tiêu tối thiểu!");
                      return;
                    }
                  }

                  // Nếu hợp lệ thì bật
                  toggleVoucherStatus(record);
                }}
              >
                <Tooltip title="Bật voucher">
                  <Switch
                    checked={false}
                    checkedChildren={
                      <CheckOutlined style={{ color: "white" }} />
                    }
                    unCheckedChildren=""
                    style={{
                      marginLeft: 12,
                      backgroundColor: "red",
                    }}
                  />
                </Tooltip>
              </Popconfirm>
            )}

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
              form.setFieldsValue({
                code: generateRandomCode(), // Set mã tự động
              });
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
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại voucher!" }]}
          >
            <Select onChange={(value) => form.setFieldsValue({ type: value })}>
              <Select.Option value="Phần trăm (%)">Phần trăm (%)</Select.Option>
              <Select.Option value="Số tiền (VNĐ)">Số tiền (VNĐ)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prev, current) =>
              prev.type !== current.type ||
              prev.minimumSpend !== current.minimumSpend
            }
          >
            {() => {
              const type = form.getFieldValue("type");
              const minSpend = form.getFieldValue("minimumSpend");

              return (
                <>
                  <Form.Item
                    label="Giá trị"
                    name="value"
                    rules={[
                      {
                        required: true,
                        message: "Giá trị không được để trống!",
                      },
                      {
                        validator: (_, value) => {
                          if (value <= 0) {
                            return Promise.reject("Giá trị phải lớn hơn 0!");
                          }
                          if (type === "Phần trăm (%)" && value > 100) {
                            return Promise.reject(
                              "Phần trăm không được vượt quá 100!"
                            );
                          }
                          if (
                            type === "Số tiền (VNĐ)" &&
                            minSpend &&
                            value >= minSpend
                          ) {
                            return Promise.reject(
                              "Giá trị giảm phải nhỏ hơn chi tiêu tối thiểu!"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      addonAfter={type === "Phần trăm (%)" ? "%" : "VNĐ"}
                    />
                  </Form.Item>

                  {type === "Số tiền (VNĐ)" && (
                    <Form.Item
                      label="Chi tiêu tối thiểu"
                      name="minimumSpend"
                      rules={[
                        {
                          required: true,
                          message:
                            "Chi tiêu tối thiểu là bắt buộc với loại Số tiền!",
                        },
                        {
                          type: "number",
                          min: 20000,
                          message:
                            "Chi tiêu tối thiểu phải từ 20.000 VNĐ trở lên!",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={20000}
                        step={1000}
                        addonAfter="VNĐ"
                      />
                    </Form.Item>
                  )}
                </>
              );
            }}
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
