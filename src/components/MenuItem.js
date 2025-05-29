import {
  HomeOutlined,
  OrderedListOutlined,
  UserOutlined,
  GiftOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  DropboxOutlined,
} from "@ant-design/icons";

export const menuItems = [
  { key: "1", icon: <BarChartOutlined />, path: "/dashboard", label: "Thống kê" },
  {
    key: "2",
    icon: <AppstoreOutlined />,
    path: "/categories",
    label: "Quản lý danh mục",
  },
  {
    key: "2+",
    icon: <TagsOutlined />,
    path: "/brands",
    label: "Quản lý thương hiệu",
  },
  {
    key: "3",
    icon: <DropboxOutlined />,
    label: "Sản phẩm",
    children: [
      { key: "3.1", path: "/products", label: "Danh sách sản phẩm" },
      { key: "3.2", path: "/attributes", label: "Thuộc tính" },
      { key: "3.3", path: "/attribute-values", label: "Giá trị thuộc tính" },
    ],
  },
  {
    key: "4",
    icon: <OrderedListOutlined />,
    path: "/orders",
    label: "Quản lý đơn hàng",
  },
  {
    key: "5",
    icon: <UserOutlined />,
    path: "/users",
    label: "Quản lý tài khoản",
  },
  {
    key: "6",
    icon: <GiftOutlined />,
    path: "/gift-cards",
    label: "Quản lý thẻ quà tặng",
  },
];
