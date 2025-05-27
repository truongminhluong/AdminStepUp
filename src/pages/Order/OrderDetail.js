import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {
    Card, Row, Col, Button, Tag, Typography, Space, Image,
    Divider, Timeline, Select, message, Spin, Steps, Alert,
    Descriptions, Badge, Modal, Form
} from "antd";
import {
    ArrowLeftOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined,
    CalendarOutlined, DollarOutlined, ShoppingCartOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    CloseCircleOutlined, EditOutlined,
    TruckOutlined, GiftOutlined, HistoryOutlined, WarningOutlined
} from "@ant-design/icons";
import {getOrderById, updateOrderCustomerInfo, updateOrderStatus} from "../../services/order-service";
import {formatCurrency, formatDate} from "../../lib/common";
import CustomerInfoModal from "./CustomerInfoModal";

const {Title, Text, Paragraph} = Typography;
const {Step} = Steps;
const {confirm} = Modal;

const OrderDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const [customerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerUpdateLoading, setCustomerUpdateLoading] = useState(false);
    const [customerForm] = Form.useForm();

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const orderData = await getOrderById(id);
            setOrder(orderData);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            message.error("Không thể tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'Hoàn tất': 'success',
            'Đang xử lý': 'processing',
            'Đã hủy': 'error',
            'Chờ xử lý': 'warning'
        };
        return statusColors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'Hoàn tất': <CheckCircleOutlined/>,
            'Đang xử lý': <ClockCircleOutlined/>,
            'Đã hủy': <CloseCircleOutlined/>,
            'Chờ xử lý': <ExclamationCircleOutlined/>
        };
        return statusIcons[status] || <ClockCircleOutlined/>;
    };

    const getCurrentStep = (status) => {
        const steps = {
            'Chờ xử lý': 0,
            'Đang xử lý': 1,
            'Đang giao hàng': 2,
            'Hoàn tất': 3,
            'Đã hủy': -1
        };
        return steps[status] || 0;
    };

    const getAvailableStatuses = (currentStatus) => {
        const statusFlow = {
            'Chờ xử lý': ['Đang xử lý', 'Đã hủy'],
            'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
            'Đang giao hàng': ['Hoàn tất'],
            'Hoàn tất': [],
            'Đã hủy': []
        };
        return statusFlow[currentStatus] || [];
    };

    const getStatusMessage = (fromStatus, toStatus) => {
        const messages = {
            'Chờ xử lý->Đang xử lý': {
                title: 'Xác nhận đơn hàng',
                content: 'Bạn có chắc chắn muốn xác nhận đơn hàng này? Sau khi xác nhận, đơn hàng sẽ được chuyển sang trạng thái "Đang xử lý".'
            },
            'Chờ xử lý->Đã hủy': {
                title: 'Hủy đơn hàng',
                content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
                type: 'error'
            },
            'Đang xử lý->Đang giao hàng': {
                title: 'Bắt đầu giao hàng',
                content: 'Bạn có chắc chắn đơn hàng đã sẵn sàng để giao? Sau khi chuyển sang "Đang giao hàng", bạn sẽ không thể hủy đơn hàng này.'
            },
            'Đang xử lý->Đã hủy': {
                title: 'Hủy đơn hàng',
                content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
                type: 'error'
            },
            'Đang giao hàng->Hoàn tất': {
                title: 'Hoàn tất đơn hàng',
                content: 'Xác nhận đơn hàng đã được giao thành công và hoàn tất?'
            }
        };

        const key = `${fromStatus}->${toStatus}`;
        return messages[key] || {
            title: 'Xác nhận thay đổi',
            content: `Bạn có chắc chắn muốn chuyển trạng thái từ "${fromStatus}" sang "${toStatus}"?`
        };
    };

    const showStatusChangeConfirm = (newStatus) => {
        const messageInfo = getStatusMessage(order.status, newStatus);

        confirm({
            title: messageInfo.title,
            content: messageInfo.content,
            icon: messageInfo.type === 'error' ? <WarningOutlined style={{color: '#ff4d4f'}}/> :
                <ExclamationCircleOutlined/>,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okType: messageInfo.type === 'error' ? 'danger' : 'primary',
            centered: true,
            onOk: () => handleStatusChange(newStatus),
            onCancel: () => {
                setEditingStatus(false);
            }
        });
    };

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        try {
            await updateOrderStatus(id, newStatus);
            setOrder(prev => ({...prev, status: newStatus}));

            const successMessages = {
                'Đang xử lý': 'Đã xác nhận đơn hàng thành công!',
                'Đang giao hàng': 'Đã chuyển đơn hàng sang trạng thái giao hàng!',
                'Hoàn tất': 'Đã hoàn tất đơn hàng thành công!',
                'Đã hủy': 'Đã hủy đơn hàng!'
            };

            message.success(successMessages[newStatus] || 'Cập nhật trạng thái thành công');
            setEditingStatus(false);
        } catch (error) {
            message.error(error?.message);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleEditCustomerInfo = () => {
        customerForm.setFieldsValue({
            email: order.email,
            phone: order.phone,
            address: order.address,
            note: order.note || '',
            name: order.customerName
        });
        setCustomerModalVisible(true);
    };

    const handleUpdateCustomerInfo = async (values) => {
        setCustomerUpdateLoading(true);
        try {
            await updateOrderCustomerInfo(id, values);
            setOrder(prev => ({
                ...prev,
                customerName: values.name,
                email: values.email,
                phone: values.phone,
                address: values.address,
                note: values.note,
            }));
            message.success('Cập nhật thông tin khách hàng thành công!');
            setCustomerModalVisible(false);
            customerForm.resetFields();
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setCustomerUpdateLoading(false);
        }
    };

    const renderStatusSelect = () => {
        const availableStatuses = getAvailableStatuses(order.status);

        if (availableStatuses.length === 0) {
            return (
                <Alert
                    message="Không thể thay đổi trạng thái"
                    description={
                        order.status === 'Hoàn tất'
                            ? "Đơn hàng đã hoàn tất, không thể thay đổi trạng thái."
                            : "Đơn hàng đã bị hủy, không thể thay đổi trạng thái."
                    }
                    type="info"
                    showIcon
                    style={{marginBottom: '16px'}}
                />
            );
        }

        return (
            <Space>
                <Select
                    value={order.status}
                    style={{width: 180}}
                    onChange={showStatusChangeConfirm}
                    loading={statusLoading}
                    placeholder="Chọn trạng thái mới"
                >
                    <Select.Option value={order.status} disabled>
                        {order.status} (Hiện tại)
                    </Select.Option>
                    <Select.OptGroup label="Trạng thái có thể chuyển">
                        {availableStatuses.map(status => (
                            <Select.Option
                                key={status}
                                value={status}
                                style={{
                                    color: status === 'Đã hủy' ? '#ff4d4f' : undefined
                                }}
                            >
                                {getStatusIcon(status)} {status}
                            </Select.Option>
                        ))}
                    </Select.OptGroup>
                </Select>
                <Button
                    onClick={() => setEditingStatus(false)}
                    disabled={statusLoading}
                >
                    Hủy
                </Button>
            </Space>
        );
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Spin size="large"/>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{padding: '24px'}}>
                <Alert
                    message="Không tìm thấy đơn hàng"
                    description="Đơn hàng không tồn tại hoặc đã bị xóa."
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => navigate('/orders')}>
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    const availableStatuses = getAvailableStatuses(order.status);

    return (
        <div style={{padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
            <Card
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined/>}
                                onClick={() => navigate('/orders')}
                                type="text"
                            >
                                Quay lại
                            </Button>
                            <Divider type="vertical"/>
                            <Title level={3} style={{margin: 0}}>
                                <ShoppingCartOutlined style={{color: '#1890ff', marginRight: '8px'}}/>
                                Chi tiết đơn hàng #{order.id}
                            </Title>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            {editingStatus ? (
                                renderStatusSelect()
                            ) : (
                                <Button
                                    icon={<EditOutlined/>}
                                    onClick={() => setEditingStatus(true)}
                                    disabled={availableStatuses.length === 0}
                                    type={availableStatuses.length > 0 ? "primary" : "default"}
                                >
                                    {availableStatuses.length > 0 ? 'Thay đổi trạng thái' : 'Không thể thay đổi'}
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                title={
                    <Space>
                        <TruckOutlined/>
                        <span>Trạng thái đơn hàng</span>
                    </Space>
                }
            >
                {order.status === 'Đã hủy' ? (
                    <Alert
                        message="Đơn hàng đã bị hủy"
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined/>}
                        style={{marginBottom: '16px'}}
                    />
                ) : (
                    <Steps current={getCurrentStep(order.status)}
                           status={order.status === 'Đã hủy' ? 'error' : 'process'}>
                        <Step title="Chờ xử lý" icon={<ExclamationCircleOutlined/>}/>
                        <Step title="Đang xử lý"/>
                        <Step title="Đang giao hàng" icon={<TruckOutlined/>}/>
                        <Step title="Hoàn tất" icon={<GiftOutlined/>}/>
                    </Steps>
                )}

                <Row style={{marginTop: '24px'}}>
                    <Col span={24}>
                        <Tag
                            color={getStatusColor(order.status)}
                            icon={getStatusIcon(order.status)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '16px',
                                borderRadius: '20px'
                            }}
                        >
                            {order.status}
                        </Tag>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Space>
                                        <UserOutlined style={{color: '#1890ff'}}/>
                                        <span>Thông tin khách hàng</span>
                                    </Space>
                                </Col>
                                <Col>
                                    <Button
                                        size="small"
                                        icon={<EditOutlined/>}
                                        onClick={handleEditCustomerInfo}
                                        type="primary"
                                        ghost
                                    >
                                        Chỉnh sửa
                                    </Button>
                                </Col>
                            </Row>
                        }
                        style={{
                            marginBottom: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label={<><UserOutlined/> Tên khách hàng </>}>
                                <Text strong>{order.customerName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><UserOutlined/> Email</>}>
                                <Text strong>{order.email}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined/> Số điện thoại</>}>
                                <Text strong>{order.phone}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><EnvironmentOutlined/> Địa chỉ giao hàng</>}>
                                <Paragraph style={{margin: 0}}>{order.address}</Paragraph>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title={
                            <Space>
                                <ShoppingCartOutlined style={{color: '#1677FF'}}/>
                                <span>Sản phẩm đã đặt</span>
                                <Badge count={order.items?.length || 0}/>
                            </Space>
                        }
                        style={{
                            marginBottom: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                            {order.items?.map((item, index) => (
                                <Card key={index} size="small" style={{marginBottom: '16px'}}>
                                    <Row align="middle" gutter={16}>
                                        <Col span={4}>
                                            {item.product_image ? (
                                                <Image
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    width={80}
                                                    height={80}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid #f0f0f0'
                                                    }}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+2w+Y/yANJjGAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYPgX"
                                                />
                                            ) : (
                                                <div style={{
                                                    width: 80,
                                                    height: 80,
                                                    backgroundColor: '#f5f5f5',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #d9d9d9'
                                                }}>
                                                    <ShoppingCartOutlined style={{color: '#bfbfbf', fontSize: '24px'}}/>
                                                </div>
                                            )}
                                        </Col>
                                        <Col span={12}>
                                            <div>
                                                <Title level={5} style={{margin: 0, marginBottom: '4px'}}>
                                                    {item.product_name}
                                                </Title>
                                                <Text type="secondary">Size: {item.size}</Text>
                                            </div>
                                        </Col>
                                        <Col span={4} style={{textAlign: 'center'}}>
                                            <div>
                                                <Text strong>Số lượng</Text>
                                                <br/>
                                                <Badge count={item.quantity} style={{backgroundColor: '#1677FF'}}/>
                                            </div>
                                        </Col>
                                        <Col span={4} style={{textAlign: 'right'}}>
                                            <div>
                                                <Text type="secondary">Đơn giá</Text>
                                                <br/>
                                                <Text strong style={{color: '#1677FF', fontSize: '16px'}}>
                                                    {formatCurrency(item.price)}
                                                </Text>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <CalendarOutlined style={{color: '#722ed1'}}/>
                                <span>Thông tin đơn hàng</span>
                            </Space>
                        }
                        style={{
                            marginBottom: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Mã đơn hàng">
                                <Text strong>#{order.id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt hàng">
                                <Text>{formatDate(order.createdAt)}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                <Tag color={order.paymentMethod === 'COD' ? 'orange' : 'blue'}>
                                    {order.paymentMethod}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                <Text>{order.note || 'Không có ghi chú'}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title={
                            <Space>
                                <DollarOutlined style={{color: '#fa8c16'}}/>
                                <span>Tổng kết thanh toán</span>
                            </Space>
                        }
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                        headStyle={{
                            background: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                            color: 'white'
                        }}
                        bodyStyle={{background: 'transparent'}}
                    >
                        <div style={{marginBottom: '16px'}}>
                            <Row justify="space-between" style={{marginBottom: '8px'}}>
                                <Col>
                                    <Text style={{color: 'rgba(255,255,255,0.8)'}}>Tạm tính:</Text>
                                </Col>
                                <Col>
                                    <Text style={{color: 'white'}}>
                                        {formatCurrency(order.totalPrice - (order.shippingFee || 0))}
                                    </Text>
                                </Col>
                            </Row>
                            <Row justify="space-between" style={{marginBottom: '8px'}}>
                                <Col>
                                    <Text style={{color: 'rgba(255,255,255,0.8)'}}>Phí vận chuyển:</Text>
                                </Col>
                                <Col>
                                    <Text style={{color: 'white'}}>
                                        {formatCurrency(order.shippingFee || 0)}
                                    </Text>
                                </Col>
                            </Row>
                            <Row justify="space-between" style={{marginBottom: '8px'}}>
                                <Col>
                                    <Text style={{color: 'rgba(255,255,255,0.8)'}}>Giảm giá:</Text>
                                </Col>
                                <Col>
                                    <Text style={{color: 'white'}}>
                                        -{formatCurrency(order.discount || 0)}
                                    </Text>
                                </Col>
                            </Row>
                            <Divider style={{borderColor: 'rgba(255,255,255,0.2)', margin: '16px 0'}}/>
                            <Row justify="space-between">
                                <Col>
                                    <Title level={4} style={{color: 'white', margin: 0}}>
                                        Tổng cộng:
                                    </Title>
                                </Col>
                                <Col>
                                    <Title level={3} style={{color: '#ffd700', margin: 0}}>
                                        {formatCurrency(order.totalPrice)}
                                    </Title>
                                </Col>
                            </Row>
                        </div>

                        <Alert
                            message={`${order.paymentMethod === 'COD' ? 'Chưa thanh toán' : 'Đã thanh toán'} `}
                            type={order.paymentMethod === 'COD' ? 'warning' : 'success'}
                            showIcon
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'white'
                            }}
                        />
                    </Card>

                    <Card
                        title={
                            <Space>
                                <HistoryOutlined style={{color: '#13c2c2'}}/>
                                <span>Lịch sử đơn hàng</span>
                            </Space>
                        }
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            marginTop: '24px'
                        }}
                        headStyle={{borderRadius: '16px 16px 0 0'}}
                    >
                        <Timeline>
                            <Timeline.Item
                                color="blue"
                                dot={<CheckCircleOutlined style={{
                                    background: '#1890ff',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '4px'
                                }}/>}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <Text strong style={{color: '#1890ff'}}>Đơn hàng được tạo</Text>
                                    <br/>
                                    <Text type="secondary">{formatDate(order.createdAt)}</Text>
                                </div>
                            </Timeline.Item>

                            {order.statusHistory && order.statusHistory.map((historyItem, index) => {
                                const getStatusInfo = (status) => {
                                    switch (status) {
                                        case 'Đang xử lý':
                                            return {
                                                title: 'Đơn hàng được xác nhận',
                                                description: 'Đang chuẩn bị hàng',
                                                icon: <CheckCircleOutlined/>,
                                                color: '#52c41a',
                                                gradient: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)'
                                            };
                                        case 'Đang giao hàng':
                                            return {
                                                title: 'Đang giao hàng',
                                                description: 'Đơn hàng đang được vận chuyển',
                                                icon: <TruckOutlined/>,
                                                color: '#1890ff',
                                                gradient: 'linear-gradient(135deg, #e6f7ff 0%, #fff2e6 100%)'
                                            };
                                        case 'Hoàn tất':
                                            return {
                                                title: 'Giao hàng thành công',
                                                description: 'Đơn hàng đã được giao thành công',
                                                icon: <GiftOutlined/>,
                                                color: '#52c41a',
                                                gradient: 'linear-gradient(135deg, #f6ffed 0%, #fff7e6 100%)'
                                            };
                                        case 'Đã hủy':
                                            return {
                                                title: 'Đơn hàng đã bị hủy',
                                                description: 'Đơn hàng đã được hủy',
                                                icon: <CloseCircleOutlined/>,
                                                color: '#ff4d4f',
                                                gradient: 'linear-gradient(135deg, #fff2f0 0%, #ffebee 100%)'
                                            };
                                        default:
                                            return {
                                                title: status,
                                                description: '',
                                                icon: <CheckCircleOutlined/>,
                                                color: '#1890ff',
                                                gradient: 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 100%)'
                                            };
                                    }
                                };

                                const statusInfo = getStatusInfo(historyItem.status);
                                const isCurrentStatus = index === order.statusHistory.length - 1;

                                return (
                                    <Timeline.Item
                                        key={index}
                                        color={statusInfo.color}
                                        dot={React.cloneElement(statusInfo.icon, {
                                            style: {
                                                background: statusInfo.color,
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '4px',
                                                fontSize: '12px'
                                            }
                                        })}
                                    >
                                        <div style={{
                                            background: statusInfo.gradient,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            marginBottom: '8px',
                                            border: isCurrentStatus ? `2px solid ${statusInfo.color}` : '1px solid #f0f0f0'
                                        }}>
                                            <Text strong style={{color: statusInfo.color}}>
                                                {statusInfo.title}
                                            </Text>
                                            <br/>
                                            <Text type="secondary" style={{fontSize: '13px'}}>
                                                {statusInfo.description}
                                            </Text>
                                            <br/>
                                            <Text type="secondary" style={{fontSize: '12px'}}>
                                                {formatDate(historyItem.changedAt)}
                                            </Text>
                                        </div>
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                    </Card>
                </Col>
            </Row>

            <CustomerInfoModal
                visible={customerModalVisible}
                onCancel={() => setCustomerModalVisible(false)}
                onUpdate={handleUpdateCustomerInfo}
                loading={customerUpdateLoading}
                form={customerForm}
            />
        </div>
    );
};

export default OrderDetail;