import React from 'react';
import {Modal, Form, Input} from 'antd';

const CustomerInfoModal = ({
                               visible,
                               onCancel,
                               onUpdate,
                               loading,
                               form
                           }) => {
    return (
        <Modal
            title="Cập nhật thông tin khách hàng"
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="Cập nhật"
            cancelText="Hủy"
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onUpdate}
            >
                <Form.Item
                    name="name"
                    label="Tên khách hàng"
                    rules={[
                        {required: true, message: 'Vui lòng nhập tên khách hàng'},
                    ]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {required: true, message: 'Vui lòng nhập email'},
                        {type: 'email', message: 'Email không hợp lệ'}
                    ]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{required: true, message: 'Vui lòng nhập số điện thoại'}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{required: true, message: 'Vui lòng nhập địa chỉ'}]}
                >
                    <Input.TextArea rows={3}/>
                </Form.Item>
                <Form.Item
                    name="note"
                    label="Ghi chú"
                >
                    <Input.TextArea rows={3}/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CustomerInfoModal;