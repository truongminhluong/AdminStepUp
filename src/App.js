import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  OrderedListOutlined,
  UserOutlined,
  GiftOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { auth } from "./firebase/firebaseConfig";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Statistics from "./pages/Statistics";
import GiftCards from "./pages/GiftCards";
import "antd/dist/reset.css";
import { ADMIN_UID } from "./config";
import logo from "./images/logo.jpg";
import Category from "./pages/Category";
import { ToastContainer } from "react-toastify";
import { Attribute } from "./pages/Attribute/Attribute";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "1", icon: <HomeOutlined />, path: "/dashboard", label: "Trang chủ" },
  {
    key: "2",
    icon: <ShoppingCartOutlined />,
    path: "/categories",
    label: "Quản lý danh mục",
  },
  {
    key: "3",
    icon: <ShoppingCartOutlined />,
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
  {
    key: "7",
    icon: <BarChartOutlined />,
    path: "/statistics",
    label: "Thống kê",
  },
];

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser && currentUser.uid === ADMIN_UID) {
        setUser(currentUser);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        setUser(storedLogin === "true" ? { uid: ADMIN_UID } : null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/*"
            element={
              user ? (
                <Layout style={{ minHeight: "100vh" }}>
                  <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    theme="dark"
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: collapsed ? "10px 0" : "20px 0",
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={logo}
                          alt="Logo"
                          style={{
                            width: collapsed ? "20px" : "70px",
                            height: "auto",
                            transition: "width 0.3s",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                    </div>
                    <Menu
                      theme="dark"
                      mode="inline"
                      defaultSelectedKeys={["1"]}
                    >
                      {menuItems.map((item) => {
                        if (item.children) {
                          return (
                            <Menu.SubMenu
                              key={item.key}
                              icon={item.icon}
                              title={item.label}
                            >
                              {item.children.map((child) => (
                                <Menu.Item key={child.key}>
                                  <Link to={child.path}>{child.label}</Link>
                                </Menu.Item>
                              ))}
                            </Menu.SubMenu>
                          );
                        }
                        return (
                          <Menu.Item key={item.key} icon={item.icon}>
                            <Link to={item.path}>{item.label}</Link>
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  </Sider>
                  <Layout>
                    <Header
                      style={{
                        background: "#fff",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {collapsed ? (
                        <MenuUnfoldOutlined
                          style={{
                            fontSize: "18px",
                            padding: "0 16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setCollapsed(false)}
                        />
                      ) : (
                        <MenuFoldOutlined
                          style={{
                            fontSize: "18px",
                            padding: "0 16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setCollapsed(true)}
                        />
                      )}
                    </Header>
                    <Content style={{ margin: "16px" }}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/categories" element={<Category />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/gift-cards" element={<GiftCards />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/attributes" element={<Attribute />} />
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" />}
                        />
                      </Routes>
                    </Content>
                  </Layout>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
};

export default App;
