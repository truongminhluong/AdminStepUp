import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Input, Select, Popconfirm } from "antd";
import { toast } from "react-toastify";
import {
  deleteCategory,
  getCategories,
  storeCategory,
  updateCategory,
} from "../services/category-service";

const { Option } = Select;

const brands = [
  {
    name: "Nike",
    value: "nike",
    image: "https://1000logos.net/wp-content/uploads/2017/03/Nike-Logo.png",
  },
  {
    name: "Puma",
    value: "puma",
    image:
      "data:image/png;base64,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",
  },
  {
    name: "Adidas",
    value: "adidas",
    image:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAAC4CAMAAAAYGZMtAAAAhFBMVEX///8AAABVVVXy8vLV1dX4+Pja2toPDw/MzMyTk5OlpaWPj48bGxv7+/vPz8/i4uJfX1/t7e2ysrIvLy+4uLgsLCxKSkqBgYEVFRU4ODi+vr7GxsaIiIipqaltbW3f3994eHhoaGidnZ1DQ0MkJCQ3NzdaWlofHx98fHxzc3NPT09AQECbI0MXAAAOgElEQVR4nO1dbUPqPAy9Yw4YOsZ4V0CYIIr+///3sBcgTZqti4NOHvPtygXaszZNTk7Kv3+Nt+He9ggaZot3x3mxPYgmWbh3jjYJbI+jMebOnMx82yNpiq06zski22NphHXfnYvFtkfTAAtbjmJ92wOybe7SQba1PSTLtsKAHG1oe1A2rTvSIOI4nu1xWbMw1gLiOEvbI7NkwYwB5Gih7cFZMZ0TOdv/MdXpPhch4jgL2wO8tYWDYkCOqY7tId7W3McyQI72ZnuUt7TVkwEijuPaHufNrF/iRM52sD3SG1m5E7nYg+3B3sI8ks4U2dT2cG9gwyqAHG1se8DXtrJIRGO2h3xdY9OZIrtvznErQOTOU52+CJL75hxfRZjcNefoiiC571TnTYRJz/awr2nBTgJJ565TnRfRMpnZHvZVrVUOgMbWtod9TVuLIPmyPeyr2kaEyV3LK4QH8V3LK2QH8X1zju/lAGjsruUVCxEk953qfIkwuWvOMRRB8m172Fe1SvTr2e5aXuF2ygGg1rnrg7gqKZ3ZPaU6C8IC6VU2ZXY3nGP0Sl2jjHMc2Bh+/Rb4yWRW+M8yzvEu5BXjSTYZrDyTHcQjK3Oo1drnOgVxjSZiCmq/nXOMDmAybfyqCJJfLq9QU16iPBuLIPm0MZOa7AUzz8Q1TkWYkNX2W6xNU7s5/j8PIkh+qbzC1bKJhAU66P5Xqf1KzpHjzTALJOMcO1bm9CNbsOUrojyTcY6PNmb1A1vvCyaDWaBgIsLkV6U6XoEk3tGwQLLi32/iHHtlkyEskKz492vkFYvv0rl81JPqvFuZX2XDzXl6I67xU4QJSawbaLQ5jzHsGmWc47z5qc5qbjoZwgKV+h+tNb2lq1+FNuzid8uKf40+iCuqWYlr7IogadmYqpkFlWsyxDXKDuLGpjqS6gN2jbKDuKHyiqg8EtEYYYFkxb+GyitEkBDX6IkO4oZyjm3RXIjyTFb8e7Ux43KTBZ/ENcoO4mbKKyLRXIgEXFb8ayjnKAs+a+IcGyqvkLFA2DXKVltD5RUy5RnhHGXFv4ZyjhVaXIERFkj0KQ1NdWTBJ3GNd8U5yoJP0u0qK/6RxLoRFojmQrpdZWFfQ1u6ZMEnYYFkB3FD5RX1dLt6ok9paKojK3jXxDlubj9fE5OteewaA5nOsZnyClnwucMfIzuIG9rSVVO3a1FBmbdG3F5Bm2NEqQ7pdpWFfR+3mXSRBUu6f2vqdi0us3Nm/faKJAyhVIVszWNoZcU/y6lOPwu8CTEm63Yl0Bbex8eaTc4xivNBPJGXZGv+t3OOHjhYyP6VBZ87zALJOEdb8oqxokIjp45szRPOUca/WJFXtFH2TvevrKqDoZUdxBbkFRGVspL9W9PFPjLO8eYtXbrolLZkxqLJYGiFxb/bHsSMlJXUDGSpDrlMXMa/3FJe0ebUDnT/ylIdAq3MKd1MXuEWxBukZuCJLvaZY52jjH+51UFcTOuQ/StLdWriHG8ir1iUxJL0xmsZz44PYplTugHnaHAxK+k7kvHshHP0RR9z7RtzS/TwmdH9K0t1CLSyg/i6qY7hSUiIMVl6T6CVOaVryiv6xucg+ekJGc9OchTZJSdX4xyr3O5M969MXoGhlTkl5zryCq+abyOco0zbS3SOstvGriKvGH5UGwQNpGXpPYZWWPyr/xqph+q3O5P9K0vvSTlG5pTqvr0ikoSNpAFYmN7XxDnWLK+QpW20ZiD6GNLtKtN81X17RUU/khvZv7L7BAi0skJIzfIK2YOhnGM9qY7MKdWd6sg6QUggLUvvSYwjyw5q5hxlFSqa6siiCsI5GjfIKVazvEKmiifEmOw+gWf8MbJCSM3yClmE1CGpTk2co+wgrplzlD0Y2pIpkhQReYXMKdHy7M+sppZM2eFFcpRY9DE1c46yudBAWhZVYGiFB3HNqY5sLoQYkxGoJIuUcY41K8nrugZOpiTH0Aayg7hmzlEWIZH9K6tkEmhl2QE5z39mbktig3b/Yim7BfnbqenHTMcP50/ppmd7LBnNtBH3OcKNkh6mUEpg/hsMcN82U+ZrboAmyeILSDma7+0/SIj9QULsDxJif5AQ+4OE2B8kxP4gIfYHCbE/SIjdNSTuw8UIE8naXUMisz9IiDUFksCTiFU8ZTuIIfGULzeEpPqIzd/RfXudfo8m79vW5/A0BP/xZEv95arheLbfPk9Gz9OBv8iBIZCEbxfTk6Hewo/zL5+Nc/6gHJJ+7/D1/Z68aTPM3bYHRkyZkvBluZ8+H7/m+yt+W5S4tResj5ml3wH+oKk6h/6T+qbt0NNBUnLieENUOu4s1+WQLGI04s/koyHRi1j+0MdU5XTFouL1dLzm9kVREBBI+lqV0dKtCEmkVaHs+4WQBCudEu44YiikVBQI7Vj3NY6v39ljjuj9WoMvRpBEnOyqM6wECVsNfIXvQpAsOGlgqw8eIoSEpZE7moqgayijVCExrAWWQRIa1gIVSILY7E0XSKIidSURDBq3WCmQGA6qDBJj0h1CsjZt4zhDEhbXO1A1zlx9DCDxjJU0xZCYl9ABJOZtcidISlthNqLHBCGpcJlGISQV6ncXSCo0Dp4gKRebAk12FbXuBZIKaqsiSKr0qZ0hqSKWziEhte35jkjxztFSpWrtGZIqYpwCSCrJI06QVPqpB1/zBFvD0PU8z42GSnfAWcNF7i76mL5uXqf6rXeChO619/1hM9BLh3lIvCf8fydfr5t4q/eEJ0jIHuh8x5tDSw+UT9cVDGiVQzOP2bDseNPPXggedIXtHBKsTtquctlDhGPQdMQsJHitzfIX3K5OhtzW74HBS77i276m7pxBAj2WKm5aklfQ5GKYfbh0d/S0U1ECnQUZFwsJkge+wiAypCqOHBLVBzzDo9mjjzGDJAZ/UUNVqKMbEJCoAp549gwS1f3EOKWM0ZtYSNQdgCNI4nmzyavxIRYqtfEDySABxyNuMQWD2GGMdNlYiNxyBokSGGuEpShw5iBRFwlN6vBRmP4P1bfSCxci5J5SSBRZCoIebtEQQ67T4CPFTQqJ4hS1Cp/YCBIl1dPRDshrtMnfdCo0tBszSOCT7ahfFfbP/GfqRqcln48j2x7+E9OirJxXDCTKOPVadzWOSyGBvxeq7y1RT8Ns46iteHGXZ0ngvuGUOsqGT0cOxc5Md4ey5hlI4MHI/bC2sktSSOAfGFmeonPPIMEHWCf2F2strQafN6eYVRZiCgnYmGyXJcysGUhgcsOphJQ1mkACYztOHq/Efxkk2g6np+/DirBqcGFyk1M0jQkkcGmxgic4FwYSuPy4j1GcaQIJdH7sjRww+swgKRAhzjdDuNriyyt8RwIcRQ/NjX1TBA5DBhKw2PhfuIERUAIJOMz4X7GHTzoP6IuzvtYl+gDHNd9UC/d8AgmIFwquCQE7h4EE/JuXucPVlkACzgMeR7hzfDoJnX2cYlpwmvL3wsCNkkACVk3B7xcBh6aHBN4fzMuX4ewSSEAWxV8CBbfJiRwobTH8ygYB/lJQawHAJZAAt1jQiAvCYj0kMATmvxw69wQS4Fv4pQU/+syqlRImnfREAxueHxUM/ZoECb/VtZAYkLXJTgHPn5eiwi9AG6egSwyEVOUbh9+1BRuH72TUbZx/Br3GO09pLeF/EgKOCrnXgo4o4AfL3Sv/wGEomkACvDb/PGC2CosWURmr+ag8Sv5HrSG4PfSFbF0VLi0GEhD087PDv2gO9iN/3RF0pai5dvFZSNS7SgDJfgHMgxJIIMXCri2Y2TOQwGyF+xilxbGNPpfd65App63c4WLW4rj0oZJWcrNTwuN0/4LHy4ZLMM9iIIGrj9s5CmeSQALdLXe1j5Jg6W/E9aJub6bp+X1VHviOyQ4VbjaFBNIhzFyUbJSBBDpBcodnbsp4SdrHLBOFAS68JDgao6N5ouYvem+iuukenlxHG2WpzBTHl8C+Qb03URPYFBIY4evXqForSyHxgKH/vVbJYvQ0deEgYrZSSJRcTJsLq1/DQaL4f92+RTXnFBJlH+u2DhpxCslkdLYnvLRchYbDHdp0WJgN79G5fJE1H6CaOweJmp7SLYir8BkVqbBBG/ImTBenkEBClgS9kH5OGmjVVbZE0yPBTQaJui9GiDVdY3fO0tFq4z0KhQMifci+RyXN9mjjEjFDCgn0GMQ/wAecbEX04y0jSIB0aU2mR4E92hKMS1M3YCFBhcZnSNGNaaUqh15FvAOD2DbVhKSQKA8eez84yw0F/ej739rJUgnWPd3Zffp+XKWLx26QSOJedCUpvrSFo8lRL0w+JugT+VRiOSSkaLrsJlK8IFzpfnQlhUTZoijk1rhTTYb48c4pD06Q6DqqJyOmybOgJqxpVt+NSFU0t9MG1dSj5yNuxD5ZCc4WrhOVbs9eqXRD3nmVVmn7LYCk0nUg5zJ5la5/XzPxc6H131p1Z6cFVEWacNm4FS4HKxJTVLlr8OzGq4gd8lCNRKrbw+Myxqvh7Ekr3CsAfJm5wKRQclPhdrDLyVbhKfoVUAR1IXNMoDDL+FqgYmGW+X0g4LA316WcAnqT5QgjW2PUFdrG9N61Evme8d6B8U+hPBHaOccpl5+pca1r6BpUJstQVVUq8jS8KVQVeRo+kEvaVyJAG5EkkgVx9ADONywFZq/yWJVyr9BYh7KHexpLgbmjcrsAxzjIhFnhcmIHTS4eaMOj9zFh6BXr6zxK55gYVBOM668un3aLNfQ9XTDyXSAYf+DOhAHDM3hD9NA7hzTEnsyfctMly+0ZGlgrbSvwndOb5rv8Gob5yXRtBVEPDXcySyAIz9/9pFGgBLgRonNIlBLR7jJipIdoL2lQPn0r+nED98UfpI5r/v3Za+ceGJANWqbnGErPpukSm+z9l7wAERCKgucsTqiMH/epwOJjOluFgdm7vMVbPMpGvOk9GIw4iMb+4D1dR53ddNNbKBWT/wBgaNave5KPCwAAAABJRU5ErkJggg==",
  },
  {
    name: "Reebok",
    value: "reebok",
    image:
      "data:image/png;base64,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",
  },
  {
    name: "Converse",
    value: "converse",
    image: "data:image/png;base64,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",
  },
  {
    name: "Vans",
    value: "vans",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhmdaMLG-cGN3TAu2OV1r1LVnbWg_JDRXChg&s",
  },
  {
    name: "New Balance",
    value: "new_balance",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/2560px-New_Balance_logo.svg.png",
  },
  {
    name: "Asics",
    value: "asics",
    image: "https://upload.wikimedia.org/wikipedia/vi/3/3f/Logo_cong_ty_Asics.png",
  },
  {
    name: "Under Armour",
    value: "under_armour",
    image:
      "https://1000logos.net/wp-content/uploads/2017/06/Under-Armour-Logo.png",
  },
  {
    name: "Jordan",
    value: "jordan",
    image: "https://censor.vn/wp-content/uploads/2022/02/3-logo-jordan.webp",
  },
  {
    name: "Fila",
    value: "fila",
    image: "https://mediaelly.sgp1.digitaloceanspaces.com/uploads/2021/05/16224825/nhung-dieu-thu-vi-ve-thuong-hieu-giay-fila.3.jpg",
  },
  {
    name: "Balenciaga",
    value: "balenciaga",
    image:
      "https://rubystore.com.vn/wp-content/uploads/2020/05/2-7.jpg",
  },
  {
    name: "Yeezy",
    value: "yeezy",
    image:
      "https://jordan1.vn/wp-content/uploads/2023/09/yeezy-emblem-700x394_876290b401d04f1ca8fee0ed2893801a_1024x1024.png",
  },
  {
    name: "Saucony",
    value: "saucony",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHtrNaOODy-UBs1n6vygTu9Y9CWzJm4bxcAg&s",
  },
  {
    name: "Brooks",
    value: "brooks",
    image: "https://yeuchaybo.com/wp-content/uploads/2016/01/Brooks-Logo.jpg",
  },
  {
    name: "Mizuno",
    value: "mizuno",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/53/MIZUNO_logo.svg",
  },
  {
    name: "Hoka One One",
    value: "hoka_one_one",
    image:
      "https://goccualien.com/wp-content/uploads/2024/07/hoka-la-hang-giay-cua-nuoc-nao.png",
  },
  {
    name: "Merrell",
    value: "merrell",
    image:
      "https://allgoods.com.au/cdn/shop/collections/merrell.jpg?v=1688009881&width=1024",
  },
  {
    name: "Salomon",
    value: "salomon",
    image: "https://pos.nvncdn.com/be3294-43017/brand/20240421_Bw5NmAGe.png",
  },
  {
    name: "La Sportiva",
    value: "la_sportiva",
    image:
      "https://wetrek.vn/pic/Service/images/La-Sportiva-1.jpg",
  },
  {
    name: "Altra",
    value: "altra",
    image: "https://pos.nvncdn.com/be3294-43017/art/20220219_meGllSowHt5wGDFIU9FlTxfP.jpg",
  },
  {
    name: "Arc'teryx",
    value: "arcteryx",
    image:
      "https://i.pinimg.com/564x/7e/10/21/7e102129c2a703ee333cb26db1e06183.jpg",
  },
  {
    name: "Diadora",
    value: "diadora",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNtCvH9OjfL69VSeeaQobJ35ItAXozWdfDsg&s",
  },
  {
    name: "K-Swiss",
    value: "k_swiss",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/K-Swiss_logo_%282015%29.svg",
  },
  {
    name: "Skechers",
    value: "skechers",
    image: "https://gigamall.com.vn/data/2019/09/05/15192046_LOGO-SKECHERS.png",
  },
  {
    name: "Lotto",
    value: "lotto",
    image:
      "https://i.pinimg.com/564x/f1/b4/b2/f1b4b232e1cf2a32cdf4e2b4b485ed49.jpg",
  },
  {
    name: "Umbro",
    value: "umbro",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/22/Umbro_logo_%28current%29.svg",
  },
  {
    name: "Bata",
    value: "bata",
    image:
      "https://gigamall.com.vn/data/2019/09/20/16211259_LOGO-BATA-500x500.jpg",
  },
  {
    name: "Tommy Hilfiger",
    value: "tommy_hilfiger",
    image:
      "https://1000logos.net/wp-content/uploads/2017/06/Tommy-Hilfiger-Logo.png",
  },
  {
    name: "Guess",
    value: "guess",
    image: "https://jordan1.vn/wp-content/uploads/2023/09/guess-emblem-700x394_3facfabdee7a40a48372f637370ceaed_1024x1024.png",
  },
];

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const showModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
      } else {
        await storeCategory(values);
      }
      handleCancel();
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi khi lưu danh mục!");
    }
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
    toast.success("Xóa danh mục thành công!");
    fetchCategories();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên danh mục",
      dataIndex: "category_name",
      key: "category_name",
    },

    {
      title: "Hãng giày",
      dataIndex: "brand",
      key: "brand",
      render: (brand) => {
        const brandData = brands.find((b) => b.value === brand);
        return brandData ? (
          <span>
            <img
              src={brandData.image}
              alt={brandData.name}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            {brandData.name}
          </span>
        ) : null;
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <span style={{ color: "green" }}>Hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Tạm ngưng</span>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button
        type="primary"
        onClick={() => showModal()}
        style={{ marginBottom: 20 }}
      >
        Thêm danh mục
      </Button>

      <Table columns={columns} dataSource={categories} rowKey="id" />

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ status: "active" }}
        >
          <Form.Item
            label="Tên danh mục"
            name="category_name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            label="Hãng giày"
            name="brand"
            rules={[{ required: true, message: "Vui lòng chọn hãng giày!" }]}
          >
            <Select placeholder="Chọn hãng giày">
              {brands.map((brand) => (
                <Option key={brand.value} value={brand.value}>
                  <img
                    src={brand.image}
                    alt={brand.name}
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm ngưng</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              {editingCategory ? "Cập nhật" : "Thêm danh mục"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Category;
