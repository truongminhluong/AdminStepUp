import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
    Table, Button, Select, Input, Row,
    Col, Card, DatePicker, Spin, Space, Tag, Tooltip, Badge, Avatar, Typography,
    Statistic
} from "antd";
import {
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
    DollarOutlined,
    ExclamationCircleOutlined,
    EyeOutlined, FilterOutlined,
    PhoneOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    UserOutlined
} from "@ant-design/icons";
import {getOrdersFromFirebase} from "../../services/order-service";
import {formatCurrency, formatDate} from "../../lib/common";

const {Text} = Typography;
const {RangePicker} = DatePicker;

const getStatusColor = (status) => {
    switch (status) {
        case "Chờ xử lý":
            return "orange";
        case "Đang xử lý":
            return "blue";
        case "Đang giao hàng":
            return "cyan";
        case "Hoàn tất":
            return "green";
        case "Đã hủy":
            return "red";
        default:
            return "gray";
    }
};

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrdersFromFirebase();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = orders;

        if (searchText) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchText.toLowerCase()) ||
                order.email.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (statusFilter !== "All") {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate.toDate() && orderDate <= endDate.toDate();
            });
        }

        setFilteredOrders(filtered);
    }, [searchText, statusFilter, dateRange, orders]);

    const getStatusBadgeCount = (status) => {
        return filteredOrders.filter(order => order.status === status).length;
    };

    const showOrderDetails = (order) => {
        navigate(`/orders/${order.id}`);
    };

    const columns = [
        {
            title: "STT",
            render: (text, record, index) => (
                <Text strong style={{color: '#1890ff'}}>{index + 1}</Text>
            ),
        },
        {
            title: "Khách hàng",
            key: "customer",
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined/>} size="small"/>
                    <div>
                        <div style={{fontWeight: 500}}>{record.email}</div>
                        <Text type="secondary" style={{fontSize: '12px'}}>
                            <PhoneOutlined/> {record.phone}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Sản phẩm",
            key: "products",
            render: (_, record) => (
                <Tooltip title={`${record.items?.length || 0} sản phẩm`}>
                    <Badge count={record.items?.length || 0}>
                        <Avatar icon={<ShoppingCartOutlined/>}/>
                    </Badge>
                </Tooltip>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (total) => (
                <Text strong style={{color: '#52c41a', fontSize: '14px'}}>
                    {formatCurrency(total)}
                </Text>
            ),
            sorter: (a, b) => a.totalPrice - b.totalPrice,
        },
        {
            title: "Thanh toán",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            render: (method) => (
                <Tag color={method === 'COD' ? 'orange' : 'blue'}>
                    {method}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Ngày đặt",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (timestamp) => (
                <Space direction="vertical" size={0}>
                    <Text>{formatDate(timestamp)}</Text>
                </Space>
            ),
            sorter: (a, b) => a.createdAt - b.createdAt,
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined/>}
                    size="small"
                    onClick={() => showOrderDetails(record)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const totalRevenue = filteredOrders
        .filter(order => order.status === 'Hoàn tất')
        .reduce((sum, order) => sum + order.totalPrice, 0);
    const completedOrders = filteredOrders.filter(order => order.status === 'Hoàn tất').length;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h2>

            <Row gutter={[24, 24]} style={{marginBottom: '24px'}}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                            border: '1px solid #e6f7ff'
                        }}
                    >
                        <Statistic
                            title={<Text style={{fontSize: '14px', fontWeight: 500}}>Tổng đơn hàng</Text>}
                            value={filteredOrders.length}
                            prefix={<ShoppingCartOutlined style={{color: '#1890ff'}}/>}
                            valueStyle={{color: '#1890ff', fontSize: '24px', fontWeight: 'bold'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)',
                            border: '1px solid #f6ffed'
                        }}
                    >
                        <Statistic
                            title={<Text style={{fontSize: '14px', fontWeight: 500}}>Đơn hoàn tất</Text>}
                            value={completedOrders}
                            prefix={<CheckCircleOutlined style={{color: '#52c41a'}}/>}
                            valueStyle={{color: '#52c41a', fontSize: '24px', fontWeight: 'bold'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(250, 173, 20, 0.1)',
                            border: '1px solid #fffbe6'
                        }}
                    >
                        <Statistic
                            title={<Text style={{fontSize: '14px', fontWeight: 500}}>Đang xử lý</Text>}
                            value={getStatusBadgeCount('Đang xử lý')}
                            prefix={<ClockCircleOutlined style={{color: '#faad14'}}/>}
                            valueStyle={{color: '#faad14', fontSize: '24px', fontWeight: 'bold'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)',
                            border: '1px solid #f6ffed'
                        }}
                    >
                        <Statistic
                            title={<Text style={{fontSize: '14px', fontWeight: 500}}>Doanh thu</Text>}
                            value={totalRevenue}
                            formatter={(value) => formatCurrency(value)}
                            prefix={<DollarOutlined style={{color: '#52c41a'}}/>}
                            valueStyle={{color: '#52c41a', fontSize: '24px', fontWeight: 'bold'}}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                title={
                    <Space>
                        <FilterOutlined/>
                        <span>Bộ lọc tìm kiếm</span>
                    </Space>
                }
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo mã đơn hàng, email, hoặc số điện thoại"
                            prefix={<SearchOutlined/>}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{borderRadius: '6px'}}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{width: '100%'}}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                        >
                            <Select.Option value="All">Tất cả trạng thái</Select.Option>
                            <Select.Option value="Chờ xử lý">
                                <Tag color="warning" icon={<ExclamationCircleOutlined/>}>
                                    Chờ xử lý
                                </Tag>
                            </Select.Option>
                            <Select.Option value="Đang xử lý">
                                <Tag color="processing" icon={<ClockCircleOutlined/>}>
                                    Đang xử lý
                                </Tag>
                            </Select.Option>
                            <Select.Option value="Hoàn tất">
                                <Tag color="success" icon={<CheckCircleOutlined/>}>
                                    Hoàn tất
                                </Tag>
                            </Select.Option>
                            <Select.Option value="Đã hủy">
                                <Tag color="error" icon={<CloseCircleOutlined/>}>
                                    Đã hủy
                                </Tag>
                            </Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            style={{width: '100%'}}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            format="DD/MM/YYYY"
                            onChange={setDateRange}
                        />
                    </Col>
                </Row>
            </Card>

            <Card>
                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>
                        <Spin size="large"/>
                        <div style={{marginTop: '16px'}}>Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} đơn hàng`,
                        }}
                        scroll={{x: 1200}}
                        size="middle"
                    />
                )}
            </Card>
        </div>
    );
};

export default Orders;