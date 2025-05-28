import React, {useState, useEffect} from "react";
import {
    Layout,
    Card,
    Row,
    Col,
    Button,
    Typography,
    Tag,
    Table,
    Avatar,
    Badge,
    Space,
    Dropdown,
    Menu,
    DatePicker,
    Spin,
    message,
    List,
    Tooltip,
    Select,
} from "antd";
import {
    DollarOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    CalendarOutlined,
    MoreOutlined,
    ShopOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import dayjs from 'dayjs';
import {
    getDashboardStats,
    getRevenueByDateRange,
    getRecentOrders,
    getTopSellingProducts,
    getMonthlyStats
} from '../services/statistic-service';
import {formatCurrency} from "../lib/common";
import {useNavigate} from "react-router-dom";

const {Content} = Layout;
const {Title, Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;

const Dashboard = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(6, 'month'),
        dayjs()
    ]);

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2020; year <= currentYear + 1; year++) {
            years.push(year);
        }
        return years;
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            loadRevenueData();
        }
    }, [dateRange]);

    useEffect(() => {
        loadMonthlyData();
    }, [selectedYear]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [
                dashboardStats,
                recentOrdersData,
                topProductsData
            ] = await Promise.all([
                getDashboardStats(),
                getRecentOrders(),
                getTopSellingProducts()
            ]);

            setStats(dashboardStats);
            setRecentOrders(recentOrdersData);
            setTopProducts(topProductsData);

            await loadMonthlyData();
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu dashboard');
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMonthlyData = async () => {
        try {
            setMonthlyLoading(true);
            const monthlyStatsData = await getMonthlyStats(selectedYear);
            setMonthlyData(monthlyStatsData);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu thống kê theo tháng');
            console.error('Monthly stats error:', error);
        } finally {
            setMonthlyLoading(false);
        }
    };

    const loadRevenueData = async () => {
        try {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');
            const data = await getRevenueByDateRange(startDate, endDate);
            setRevenueData(data);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu doanh thu');
            console.error('Revenue data error:', error);
        }
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    const formatTooltipDate = (dateStr) => {
        const [month, year] = dateStr.split('/');
        return `Tháng ${month}/20${year}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Hoàn tất":
                return "green";
            case "Đang xử lý":
                return "blue";
            case "Đang giao hàng":
                return "cyan";
            case "Chờ xử lý":
                return "orange";
            case "Đã hủy":
                return "red";
            default:
                return "gray";
        }
    };

    const orderColumns = [
        {
            title: "STT",
            render: (text, record, index) => (
                <Text strong style={{color: '#1890ff'}}>{index + 1}</Text>
            ),
        },
        {
            title: "Khách hàng",
            dataIndex: "customerInfo",
            key: "customer",
            render: (customerInfo, record) => (
                <Space>
                    <Avatar style={{backgroundColor: "#1890ff"}}>
                        {(customerInfo?.name || record.customerName || "KH")[0].toUpperCase()}
                    </Avatar>
                    <Text>{customerInfo?.name || record.customerName || "Khách hàng"}</Text>
                </Space>
            ),
        },
        {
            title: "Số lượng",
            dataIndex: "items",
            key: "items",
            render: (items) => (
                <Tooltip title={`${items?.length || 0} sản phẩm`}>
                    <Badge count={items ? items.length : 0} style={{backgroundColor: "#52c41a"}}>
                        <Avatar icon={<ShoppingCartOutlined/>}/>
                    </Badge>
                </Tooltip>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (value) => (
                <Text strong style={{color: "#1890ff"}}>
                    {(value || 0).toLocaleString("vi-VN")} ₫
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                return (
                    <Tag
                        color={getStatusColor(status)}
                        style={{borderRadius: "12px", padding: "2px 12px"}}
                    >
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{color: "#8c8c8c"}}/>
                    <Text type="secondary">
                        {dayjs(date).format('DD/MM/YYYY')}
                    </Text>
                </Space>
            ),
        },
        {
            title: "",
            key: "action",
            render: (record) => (
                <Dropdown
                    overlay={
                        <Menu onClick={({key}) => {
                            if (key === "info") {
                                navigate(`/orders/${record.id}`);
                            }
                        }}>
                            <Menu.Item key="info">Thông tin</Menu.Item>
                        </Menu>
                    }
                    trigger={["click"]}
                >
                    <Button type="text" icon={<MoreOutlined/>}/>
                </Dropdown>
            ),
        },
    ];

    if (loading) {
        return (
            <Layout style={{minHeight: "100vh", background: "#f5f5f5"}}>
                <Content style={{padding: "24px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Spin size="large"/>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{minHeight: "100vh", background: "#f5f5f5"}}>
            <div className="p-4 bg-white rounded shadow-md">
                <Space size="large">
                    <Title level={3} style={{margin: 0, color: "#1890ff"}}>
                        Tổng quan Dashboard
                    </Title>
                </Space>
            </div>

            <Content style={{padding: "24px", background: "#f5f5f5"}}>
                {/* Thống kê tổng quan */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "20px"}}
                        >
                            <Space direction="vertical" style={{width: "100%"}} size="small">
                                <Text type="secondary">Tổng người dùng</Text>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Title level={2} style={{margin: 0}}>
                                            {stats?.users?.total || 0}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Avatar
                                            size={48}
                                            style={{backgroundColor: "rgba(24, 144, 255, 0.1)"}}
                                            icon={<UserOutlined style={{color: "#1890ff"}}/>}
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "20px"}}
                        >
                            <Space direction="vertical" style={{width: "100%"}} size="small">
                                <Text type="secondary">Tổng đơn hàng</Text>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Title level={2} style={{margin: 0}}>
                                            {stats?.orders?.total || 0}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Avatar
                                            size={48}
                                            style={{backgroundColor: "rgba(82, 196, 26, 0.1)"}}
                                            icon={<ShoppingCartOutlined style={{color: "#52c41a"}}/>}
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "20px"}}
                        >
                            <Space direction="vertical" style={{width: "100%"}} size="small">
                                <Text type="secondary">Tổng doanh thu</Text>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Title level={2} style={{margin: 0}}>
                                            {formatCurrency(stats?.revenue?.total || 0)}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Avatar
                                            size={48}
                                            style={{backgroundColor: "rgba(245, 34, 45, 0.1)"}}
                                            icon={<DollarOutlined style={{color: "#f5222d"}}/>}
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "20px"}}
                        >
                            <Space direction="vertical" style={{width: "100%"}} size="small">
                                <Text type="secondary">Sản phẩm</Text>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Title level={2} style={{margin: 0}}>
                                            {stats?.products?.total || 0}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Avatar
                                            size={48}
                                            style={{backgroundColor: "rgba(250, 140, 22, 0.1)"}}
                                            icon={<ShopOutlined style={{color: "#fa8c16"}}/>}
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{marginTop: 24}}>
                    <Col xs={24}>
                        <Card
                            title={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong style={{fontSize: "16px"}}>
                                            Biểu đồ doanh thu theo tháng
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Space>
                                            <RangePicker
                                                value={dateRange}
                                                onChange={setDateRange}
                                                format="DD/MM/YYYY"
                                                placeholder={["Từ ngày", "Đến ngày"]}
                                            />
                                        </Space>
                                    </Col>
                                </Row>
                            }
                            bordered={false}
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "0 20px 20px"}}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis axisLine={false} tickLine={false}/>
                                    <RechartsTooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        }}
                                        formatter={(value, name) => [`${value.toLocaleString("vi-VN")} ₫`, "Doanh thu"]}
                                        labelFormatter={(label) => formatTooltipDate(label)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#1890ff"
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{marginTop: 24}}>
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong style={{fontSize: "16px"}}>
                                            Đơn hàng gần đây
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Button type="primary" ghost size="small">
                                            Xem tất cả
                                        </Button>
                                    </Col>
                                </Row>
                            }
                            bordered={false}
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{padding: "0 20px 20px"}}
                        >
                            <Table
                                dataSource={recentOrders}
                                columns={orderColumns}
                                pagination={false}
                                rowKey="id"
                                style={{marginTop: "8px"}}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title={<Text strong style={{fontSize: "16px"}}>Top sản phẩm bán chạy</Text>}
                            bordered={false}
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                height: "100%",
                            }}
                        >
                            <List
                                dataSource={topProducts}
                                renderItem={(product, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Badge count={index + 1} style={{backgroundColor: "#1890ff"}}>
                                                    <Avatar
                                                        src={product.image}
                                                        shape="square"
                                                        size={64}
                                                        style={{ borderRadius: "8px", objectFit: "cover" }}
                                                    />
                                                </Badge>
                                            }
                                            title={product.productName}
                                            description={
                                                <Space direction="vertical" size="small">
                                                    <Text type="secondary">Đã bán: {product.totalSold}</Text>
                                                    <Text strong>{product.totalRevenue.toLocaleString("vi-VN")} ₫</Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{marginTop: 24}}>
                    <Col xs={24}>
                        <Card
                            title={
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong style={{fontSize: "16px"}}>
                                            Thống kê theo tháng năm {selectedYear}
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Space>
                                            <Select
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                style={{ width: 120 }}
                                                placeholder="Chọn năm"
                                            >
                                                {generateYearOptions().map(year => (
                                                    <Option key={year} value={year}>
                                                        Năm {year}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Space>
                                    </Col>
                                </Row>
                            }
                            bordered={false}
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            {monthlyLoading ? (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="month"/>
                                        <YAxis yAxisId="left" orientation="left"/>
                                        <YAxis yAxisId="right" orientation="right"/>
                                        <RechartsTooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                            }}
                                            formatter={(value, name) => {
                                                if (name === "Doanh thu (Hoàn tất)") {
                                                    return [`${value.toLocaleString("vi-VN")} ₫`, name];
                                                }
                                                return [value, name];
                                            }}
                                        />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="revenue"
                                            fill="#1890ff"
                                            name="Doanh thu"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="completedOrders"
                                            fill="#52c41a"
                                            name="Đơn hoàn tất"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Dashboard;