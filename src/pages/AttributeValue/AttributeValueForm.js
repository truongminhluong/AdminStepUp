import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Button, Select } from "antd";
import { toast } from "react-toastify";
import { storeAttributeValue, updateAttributeValue } from "../../services/attribute-value-service";

export const AttributeValueForm = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  attributes,
}) => {
  const [form] = Form.useForm();
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
        if (initialValues.attributeId) {
          const attr = attributes.find((a) => a.id === initialValues.attributeId);
          setSelectedAttribute(attr);
        }
      }
    }
  }, [form, initialValues, open, attributes]);

  const handleAttributeChange = (attributeId) => {
    const selectedAttr = attributes.find((attr) => attr.id === attributeId);
    setSelectedAttribute(selectedAttr);
    
    if (selectedAttr?.name !== "Màu sắc" && form.getFieldValue("colorCode")) {
      form.setFieldsValue({ colorCode: null });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const attributeName = attributes.find(
        (attr) => attr.id === values.attributeId
      )?.name;
      
      if (attributeName !== "Màu sắc") {
        values.colorCode = null;
      }

      if (initialValues && initialValues.id) {
        await updateAttributeValue(initialValues.id, values);
      } else {
        await storeAttributeValue(values);
      }
      onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const isColorAttribute = selectedAttribute?.name === "Màu sắc";

  return (
    <Modal
      title={
        <span className="text-xl font-semibold text-gray-800">
          {initialValues && initialValues.id
            ? "Sửa giá trị thuộc tính"
            : "Thêm giá trị thuộc tính"}
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
          name="attributeId"
          label={<span className="font-medium text-gray-700">Thuộc tính</span>}
          rules={[{ required: true, message: "Vui lòng chọn thuộc tính!" }]}
        >
          <Select
            placeholder="Chọn thuộc tính"
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            options={attributes.map((attr) => ({
              value: attr.id,
              label: attr.name,
            }))}
            onChange={handleAttributeChange}
          />
        </Form.Item>

        <Form.Item
          name="value"
          label={
            <span className="font-medium text-gray-700">
              Giá trị thuộc tính
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập giá trị thuộc tính!" },
          ]}
        >
          <Input
            placeholder="Nhập giá trị thuộc tính"
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Form.Item>

        {isColorAttribute && (
          <Form.Item
            name="colorCode"
            label={<span className="font-medium text-gray-700">Mã màu</span>}
            rules={[{ required: true, message: "Vui lòng chọn mã màu!" }]}
          >
            <Input
              type="color"
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </Form.Item>
        )}

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