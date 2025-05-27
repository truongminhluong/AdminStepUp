import React, {useState, useEffect} from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Card,
    Row,
    Col,
    Space,
    Tag,
    Popconfirm,
    message,
    InputNumber,
    Typography,
    Divider,
    Empty,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    GiftOutlined,
    DollarOutlined,
    PercentageOutlined,
    FilterOutlined,
    CalendarOutlined,
    NumberOutlined,
    StockOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {addGiftCard, deleteGiftCard, subscribeToGiftCards, updateGiftCard, updateCardStatus} from "../services/girf-card-service";
import {Calendar, Eye, Gift, Tag as TagIcon} from "lucide-react";
import {formatCurrency} from "../lib/common";

const {Option} = Select;
const { Text} = Typography;
const {Search} = Input;

const GiftCards = () => {
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [form] = Form.useForm();
    const [discountType, setDiscountType] = useState('money');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToGiftCards((cards) => {
            setGiftCards(cards);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const isExpired = (expiry) => {
        return dayjs(expiry).isBefore(dayjs(), 'day');
    };

    const isOutOfStock = (quantity, usedQuantity = 0) => {
        return quantity <= usedQuantity;
    };

    const getRemainingQuantity = (quantity, usedQuantity = 0) => {
        return Math.max(0, quantity - usedQuantity);
    };

    const getOverallStatus = (card) => {
        if (card.status === 'inactive') return 'inactive';
        if (isExpired(card.expiry)) return 'expired';
        if (isOutOfStock(card.quantity, card.usedQuantity)) return 'out_of_stock';
        return 'active';
    };

    const showModal = (record = null) => {
        setEditingCard(record);
        setIsModalOpen(true);

        if (record) {
            form.setFieldsValue({
                code: record.code,
                type: record.type,
                value: record.value,
                maxDiscount: record.maxDiscount,
                quantity: record.quantity,
                expiry: record.expiry ? dayjs(record.expiry) : null,
                status: record.status || 'active'
            });
            setDiscountType(record.type);
        } else {
            form.resetFields();
            form.setFieldsValue({
                quantity: 1,
                status: 'active'
            });
            setDiscountType('money');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCard(null);
        form.resetFields();
        setDiscountType('money');
    };

    const handleSubmit = async (values) => {
        try {
            const cardData = {
                ...values,
                expiry: values.expiry.format('YYYY-MM-DD'),
                maxDiscount: values.type === 'percent' ? values.maxDiscount : null,
                usedQuantity: editingCard ? editingCard.usedQuantity || 0 : 0,
                status: values.status || 'active'
            };

            if (editingCard) {
                await updateGiftCard(editingCard.id, cardData);
                message.success('Cập nhật mã giảm giá thành công!');
            } else {
                await addGiftCard(cardData);
                message.success('Thêm mã giảm giá thành công!');
            }

            handleCancel();
        } catch (error) {
            console.error('Error saving gift card:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteGiftCard(id);
            message.success('Xóa mã giảm giá thành công!');
        } catch (error) {
            console.error('Error deleting gift card:', error);
            message.error('Có lỗi xảy ra khi xóa dữ liệu!');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateCardStatus(id, newStatus);
            message.success(`${newStatus === 'active' ? 'Kích hoạt' : 'Vô hiệu hóa'} mã thành công!`);
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Có lỗi xảy ra khi cập nhật trạng thái!');
        }
    };

    const filteredCards = giftCards.filter(card => {
        const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || card.type === filterType;

        let matchesStatus = true;
        if (filterStatus === 'active') {
            matchesStatus = getOverallStatus(card) === 'active';
        } else if (filterStatus === 'expired') {
            matchesStatus = getOverallStatus(card) === 'expired';
        } else if (filterStatus === 'out_of_stock') {
            matchesStatus = getOverallStatus(card) === 'out_of_stock';
        } else if (filterStatus === 'inactive') {
            matchesStatus = card.status === 'inactive';
        }

        return matchesSearch && matchesFilter && matchesStatus;
    });

    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY');
    };

    const columns = [
        {
            title: 'Mã giảm giá',
            dataIndex: 'code',
            key: 'code',
            render: (text) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TagIcon className="w-4 h-4 text-blue-600"/>
                    </div>
                    <span className="font-mono font-semibold text-gray-900">{text}</span>
                </div>
            ),
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const config = {
                    money: { color: 'green', icon: <DollarOutlined />, text: 'Giảm tiền' },
                    percent: { color: 'orange', icon: <PercentageOutlined />, text: 'Giảm %' }
                };
                const { color, icon, text } = config[type];
                return (
                    <Tag color={color} icon={icon}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá trị',
            key: 'value',
            render: (_, record) => (
                <div>
                    <Text strong>
                        {record.type === 'percent'
                            ? `${record.value}%`
                            : formatCurrency(record.value)
                        }
                    </Text>
                    {record.type === 'percent' && record.maxDiscount && (
                        <div>
                            <Text type="secondary" style={{fontSize: '12px'}}>
                                Tối đa: {formatCurrency(record.maxDiscount)}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            render: (_, record) => {
                const remaining = getRemainingQuantity(record.quantity, record.usedQuantity || 0);

                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <NumberOutlined style={{ color: '#666', fontSize: '12px' }} />
                            <Text style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: 600 }}>{remaining}</span>
                            </Text>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const overallStatus = getOverallStatus(record);

                const statusConfig = {
                    active: { color: 'green', text: 'Hoạt động', icon: <CheckCircleOutlined /> },
                    inactive: { color: 'default', text: 'Tạm dừng', icon: <StopOutlined /> },
                    expired: { color: 'red', text: 'Hết hạn', icon: <ExclamationCircleOutlined /> },
                    out_of_stock: { color: 'orange', text: 'Hết hàng', icon: <ExclamationCircleOutlined /> }
                };

                const config = statusConfig[overallStatus];
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expiry',
            key: 'expiry',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{color: '#666'}}/>
                    <span className="text-gray-600">{formatDate(date)}</span>
                </Space>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const canToggleStatus = !isExpired(record.expiry) && !isOutOfStock(record.quantity, record.usedQuantity);

                return (
                    <Space>
                        <Button
                            type="text"
                            icon={<EditOutlined/>}
                            onClick={() => showModal(record)}
                            title="Chỉnh sửa"
                        />
                        {canToggleStatus && (
                            <Popconfirm
                                title={record.status === 'active' ? 'Tạm dừng mã giảm giá' : 'Kích hoạt mã giảm giá'}
                                description={`Bạn có chắc chắn muốn ${record.status === 'active' ? 'tạm dừng' : 'kích hoạt'} mã này?`}
                                onConfirm={() => handleStatusChange(record.id, record.status === 'active' ? 'inactive' : 'active')}
                                okText={record.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
                                    title={record.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                />
                            </Popconfirm>
                        )}
                        <Popconfirm
                            title="Xóa mã giảm giá"
                            description="Bạn có chắc chắn muốn xóa mã này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{danger: true}}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined/>}
                                danger
                                title="Xóa"
                            />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const stats = {
        total: giftCards.length,
        active: giftCards.filter(card => getOverallStatus(card) === 'active').length,
        expired: giftCards.filter(card => getOverallStatus(card) === 'expired').length,
        outOfStock: giftCards.filter(card => getOverallStatus(card) === 'out_of_stock').length,
        inactive: giftCards.filter(card => card.status === 'inactive').length,
        money: giftCards.filter(card => card.type === 'money').length,
        percent: giftCards.filter(card => card.type === 'percent').length,
        totalQuantity: giftCards.reduce((sum, card) => sum + (card.quantity || 0), 0),
        remainingQuantity: giftCards.reduce((sum, card) => sum + getRemainingQuantity(card.quantity, card.usedQuantity), 0)
    };

    return (
        <div style={{padding: '24px', background: '#f0f2f5', minHeight: '100vh'}}>
            <div style={{maxWidth: '1400px', margin: '0 auto'}}>
                <h1 className="text-3xl mb-8 font-bold text-gray-900 mb-2">Quản lý thẻ quà tặng</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng số thẻ</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Gift className="w-6 h-6 text-blue-600"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Eye className="w-6 h-6 text-green-600"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
                                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-red-600"/>
                            </div>
                        </div>
                    </div>
                </div>

                <Card style={{marginBottom: '24px'}}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Search
                                placeholder="Tìm kiếm mã giảm giá..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{width: '100%'}}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Lọc theo loại"
                                value={filterType}
                                onChange={setFilterType}
                                style={{width: '100%'}}
                                suffixIcon={<FilterOutlined/>}
                            >
                                <Option value="all">Tất cả loại</Option>
                                <Option value="money">Giảm tiền</Option>
                                <Option value="percent">Giảm %</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                value={filterStatus}
                                onChange={setFilterStatus}
                                style={{width: '100%'}}
                                suffixIcon={<FilterOutlined/>}
                            >
                                <Option value="all">Tất cả trạng thái</Option>
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Tạm dừng</Option>
                                <Option value="expired">Hết hạn</Option>
                                <Option value="out_of_stock">Hết hàng</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={9}>
                            <div style={{textAlign: 'right'}}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined/>}
                                        onClick={() => showModal()}
                                    >
                                        Thêm mã mới
                                    </Button>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={filteredCards}
                        loading={loading}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} mục`,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Không tìm thấy mã giảm giá nào"
                                />
                            )
                        }}
                    />
                </Card>

                {/* Modal */}
                <Modal
                    title={
                        <Space>
                            <GiftOutlined/>
                            {editingCard ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                        </Space>
                    }
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    width={600}
                >
                    <Divider/>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            type: 'money',
                            quantity: 1,
                            status: 'active'
                        }}
                    >
                        <Form.Item
                            name="code"
                            label="Mã giảm giá"
                            rules={[
                                {required: true, message: 'Vui lòng nhập mã giảm giá!'},
                                {min: 3, message: 'Mã phải có ít nhất 3 ký tự!'}
                            ]}
                        >
                            <Input
                                placeholder="Nhập mã giảm giá (VD: DISCOUNT50K)"
                                prefix={<GiftOutlined/>}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="type"
                                    label="Loại giảm giá"
                                    rules={[{required: true, message: 'Vui lòng chọn loại giảm giá!'}]}
                                >
                                    <Select
                                        placeholder="Chọn loại giảm giá"
                                        onChange={(value) => {
                                            setDiscountType(value);
                                            form.setFieldsValue({maxDiscount: undefined});
                                        }}
                                    >
                                        <Option value="money">
                                            <Space>
                                                <DollarOutlined style={{color: '#52c41a'}}/>
                                                Giảm tiền
                                            </Space>
                                        </Option>
                                        <Option value="percent">
                                            <Space>
                                                <PercentageOutlined style={{color: '#fa8c16'}}/>
                                                Giảm %
                                            </Space>
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="quantity"
                                    label="Số lượng"
                                    rules={[
                                        {required: true, message: 'Vui lòng nhập số lượng!'},
                                        {type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!'}
                                    ]}
                                >
                                    <InputNumber
                                        style={{width: '100%'}}
                                        placeholder="Nhập số lượng"
                                        prefix={<NumberOutlined/>}
                                        min={editingCard ? (editingCard.usedQuantity || 0) : 1}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    rules={[{required: true, message: 'Vui lòng chọn trạng thái!'}]}
                                >
                                    <Select placeholder="Chọn trạng thái">
                                        <Option value="active">
                                            <Space>
                                                <CheckCircleOutlined style={{color: '#52c41a'}}/>
                                                Hoạt động
                                            </Space>
                                        </Option>
                                        <Option value="inactive">
                                            <Space>
                                                <StopOutlined style={{color: '#666'}}/>
                                                Tạm dừng
                                            </Space>
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {editingCard && editingCard.usedQuantity > 0 && (
                            <div style={{
                                padding: '12px',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '6px',
                                marginBottom: '16px'
                            }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                    <StockOutlined style={{ marginRight: '4px' }} />
                                    Đã sử dụng: {editingCard.usedQuantity} / Tối thiểu phải để: {editingCard.usedQuantity}
                                </Text>
                            </div>
                        )}

                        <Form.Item
                            name="value"
                            label={
                                discountType === 'percent'
                                    ? 'Phần trăm giảm (%)'
                                    : 'Số tiền giảm (VND)'
                            }
                            rules={[
                                {required: true, message: 'Vui lòng nhập giá trị!'},
                                {
                                    type: 'number',
                                    min: 1,
                                    message: discountType === 'percent'
                                        ? 'Phần trăm phải lớn hơn 0!'
                                        : 'Số tiền phải lớn hơn 0!'
                                },
                                discountType === 'percent' && {
                                    type: 'number',
                                    max: 100,
                                    message: 'Phần trăm không được vượt quá 100!'
                                }
                            ].filter(Boolean)}
                        >
                            <InputNumber
                                style={{width: '100%'}}
                                placeholder={
                                    discountType === 'percent'
                                        ? 'Nhập phần trăm (VD: 20)'
                                        : 'Nhập số tiền (VD: 50000)'
                                }
                                formatter={
                                    discountType === 'percent'
                                        ? value => `${value}%`
                                        : value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={
                                    discountType === 'percent'
                                        ? value => value.replace('%', '')
                                        : value => value.replace(/\$\s?|(,*)/g, '')
                                }
                            />
                        </Form.Item>

                        {discountType === 'percent' && (
                            <Form.Item
                                name="maxDiscount"
                                label="Số tiền giảm tối đa (VND)"
                                rules={[
                                    {required: true, message: 'Vui lòng nhập số tiền giảm tối đa!'},
                                    {type: 'number', min: 1000, message: 'Số tiền tối đa phải ít nhất 1,000 VND!'}
                                ]}
                            >
                                <InputNumber
                                    style={{width: '100%'}}
                                    placeholder="Nhập số tiền giảm tối đa (VD: 100000)"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="expiry"
                            label="Ngày hết hạn"
                            rules={[
                                {required: true, message: 'Vui lòng chọn ngày hết hạn!'},
                                {
                                    validator: (_, value) => {
                                        if (value && value.isBefore(dayjs(), 'day')) {
                                            return Promise.reject('Ngày hết hạn phải sau ngày hiện tại!');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <DatePicker
                                style={{width: '100%'}}
                                placeholder="Chọn ngày hết hạn"
                                format="DD/MM/YYYY"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>

                        <Divider/>

                        <Form.Item style={{marginBottom: 0}}>
                            <Space style={{width: '100%', justifyContent: 'flex-end'}}>
                                <Button onClick={handleCancel}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    {editingCard ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default GiftCards;