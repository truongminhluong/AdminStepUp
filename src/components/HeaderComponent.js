import React from "react";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  BellOutlined,
  DownOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu, Space, Typography } from "antd";
import { auth } from "../firebase/firebaseConfig";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const HeaderComponent = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await auth.signOut();
      logout();
      localStorage.clear();
      navigate("/login");
    }
  };

  const userMenu = (
    <Menu
      style={{
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "8px 0",
      }}
      items={[
        {
          key: "1",
          label: "Thông tin tài khoản",
          icon: <UserOutlined />,
        },
        {
          key: "2",
          label: "Cài đặt",
          icon: <SettingOutlined />,
        },
        {
          type: "divider",
        },
        {
          key: "3",
          label: "Đăng xuất",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
          style: { color: "#ff4d4f" }, 
        },
      ]}
    />
  );

  return (
    <header
      style={{
        background: "#fff",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: collapsed ? 80 : 250, 
        right: 0,
        zIndex: 1001,
        height: "64px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "left 0.3s",
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          type="text"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: "20px" }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: "20px" }} />
            )
          }
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#595959",
            transition: "all 0.3s",
          }}
          className="trigger"
        />

        <h1 className="font-bold text-xl mt-2">Xin chào: {user?.name ?? "Quan Tri Vien"}</h1>
      </div>

      {/* User Section */}
      {user && (
        <Space size="middle" style={{ paddingRight: "8px" }}>
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined style={{ fontSize: "18px" }} />}
            style={{
              color: "#595959",
              transition: "all 0.3s",
            }}
            className="notification-btn"
          />
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <a
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: "20px",
                transition: "background 0.3s",
              }}
              className="user-dropdown"
            >
              <Space size="small">
                <Avatar
                  size={32}
                  src={
                    user?.avatar ??
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  }
                  style={{ border: "2px solid #f0f0f0" }}
                />
                {!collapsed && (
                  <>
                    <Text
                      strong
                      style={{
                        color: "#1f1f1f",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.email}
                    </Text>
                    <DownOutlined
                      style={{ fontSize: "12px", color: "#595959" }}
                    />
                  </>
                )}
              </Space>
            </a>
          </Dropdown>
        </Space>
      )}

      <style jsx>{`
        .trigger:hover,
        .notification-btn:hover {
          color: #1890ff !important;
          background: #f5f5f5 !important;
        }

        .user-dropdown:hover {
          background: #f5f5f5 !important;
        }

        .ant-dropdown-menu-item:hover {
          background: #f5f5f5 !important;
        }
      `}</style>
    </header>
  );
};

export default HeaderComponent;
