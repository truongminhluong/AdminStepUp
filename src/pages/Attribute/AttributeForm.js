import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Button } from "antd";
import {
  storeAttribute,
  updateAttribute,
} from "../../services/attribute-service";
import { toast } from "react-toastify";

export const AttributeForm = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [form, initialValues, open]);

  const handleSubmit = async (values) => {
    try {
      if (initialValues && initialValues.id) {
        await updateAttribute(initialValues.id, values);
        toast.success("Cập nhật thuộc tính thành công!");
      } else {
        await storeAttribute(values);
        toast.success("Thêm thuộc tính thành công!");
      }
      onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <Modal
      title={
        <span className="text-xl font-semibold text-gray-800">
          {initialValues && initialValues.id ? "Sửa thuộc tính" : "Thêm thuộc tính"}
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      className="rounded-lg"
      width={450}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: true }}
      >
        <Form.Item
          name="name"
          label={<span className="font-medium text-gray-700">Tên thuộc tính</span>}
          rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính!" }]}
        >
          <Input
            placeholder="Nhập tên thuộc tính"
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={<span className="font-medium text-gray-700">Trạng thái</span>}
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
            className="bg-gray-300"
          />
        </Form.Item>

        <Form.Item className="mt-6">
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onCancel}
              className="rounded-md border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-md bg-blue-600 hover:bg-blue-700 border-none"
            >
              {initialValues && initialValues.id ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};