import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { auth } from "./firebase/firebaseConfig";
import Dashboard from "./pages/Dashboard";
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
import { AttributeValue } from "./pages/AttributeValue/AttributeValue";
import Brand from "./pages/Brand/Brand";
import ProductAdd from "./pages/Product/ProductAdd";
import { menuItems } from "./components/MenuItem";
import NotFound from "./pages/NotFound/NotFound";
import ProductEdit from "./pages/Product/ProductEdit";
import Products from "./pages/Product/Products";
import ModalLoading from "./components/ModalLoading";
import HeaderComponent from "./components/HeaderComponent";

const { Header, Sider, Content } = Layout;

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
    return <ModalLoading />;
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
                    width={250}
                    style={{
                      position: "fixed",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        padding: collapsed ? "15px 0" : "25px 0",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        marginBottom: "10px",
                        transition: "all 0.3s",
                      }}
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2"
                      >
                        <img
                          src={logo}
                          alt="Logo"
                          style={{
                            width: collapsed ? "40px" : "70px",
                            height: "auto",
                            transition: "width 0.3s",
                            borderRadius: "50%",
                          }}
                        />
                        {!collapsed && (
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "24px",
                              fontWeight: "bold",
                              opacity: collapsed ? 0 : 1,
                              transition: "opacity 0.3s",
                              textTransform: "uppercase",
                            }}
                          >
                            StepUp
                          </span>
                        )}
                      </Link>
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
                  <Layout
                    style={{
                      marginLeft: collapsed ? 80 : 250,
                      transition: "margin-left 0.2s",
                    }}
                  >
                    <HeaderComponent
                      collapsed={collapsed}
                      setCollapsed={setCollapsed}
                    />

                    <Content
                      style={{
                        margin: "80px 16px 16px 16px", 
                        transition: "margin-left 0.3s",
                      }}
                    >
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                          path="/products/create"
                          element={<ProductAdd />}
                        />
                        <Route
                          path="/products/edit/:id"
                          element={<ProductEdit />}
                        />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/categories" element={<Category />} />
                        <Route path="/brands" element={<Brand />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/gift-cards" element={<GiftCards />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/attributes" element={<Attribute />} />
                        <Route
                          path="/attribute-values"
                          element={<AttributeValue />}
                        />
                        <Route path="*" element={<NotFound />} />
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
