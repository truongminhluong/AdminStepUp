import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Card,
  Divider,
  Spin,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import logo from "../images/logo.jpg";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      
      if (!user) {
        throw new Error("Vui lòng đăng nhập");
      }

      if (user) {
        const useData = {
          email: user.email,
          avatar: user.photoURL,
          name: user.displayName,
          id: user.uid,
        };

        setToken(user.accessToken);
        setUser(useData);
        message.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        message.error("Tài khoản không tồn tại!");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Login error:", error);

      message.error(
        "Đăng nhập thất bại: " + (error.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #2ecc71, #1abc9c)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <Card
        style={{
          width: 420,
          padding: "30px 40px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          border: "none",
        }}
      >
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Company Logo"
            style={{
              width: 120,
              height: "auto",
              marginBottom: 16,
            }}
            className="rounded-full"
          />

          <Title
            level={2}
            style={{
              color: "#2ecc71",
              margin: 0,
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            Quản trị hệ thống
          </Title>
        </div>

        <Divider style={{ marginBottom: 24 }} />

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email không được để trống!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Email"
              autoComplete="email"
              style={{
                height: 50,
                borderRadius: 6,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              style={{
                height: 50,
                borderRadius: 6,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 30, marginBottom: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={loading ? null : <LoginOutlined />}
              block
              style={{
                height: 50,
                borderRadius: 6,
                backgroundColor: "#2ecc71",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              {loading ? <Spin size="small" /> : "Đăng nhập"}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              © {new Date().getFullYear()} StepUp. All rights reserved.
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
