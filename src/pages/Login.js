import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Form, Input, Button, message, Typography, Card } from "antd";
import logo from "../images/logo.jpg"; // Đảm bảo đường dẫn đúng

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      if (user?.accessToken) {
        const access_token = user.accessToken;
        if (!access_token) {
          message.error("Bạn không có quyền truy cập!");
          await auth.signOut();
          setLoading(false);
          return;
        }

        message.success("Đăng nhập thành công!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("access_token", access_token);
        navigate("/dashboard");
      } else {
        message.error("Tài khoản không tồn tại!");
        await auth.signOut();
      }
    } catch (error) {
      message.error("Email hoặc mật khẩu không đúng!");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, rgb(157, 255, 198), rgb(255, 183, 197), rgb(198, 157, 255), rgb(255, 255, 102), rgb(101, 217, 255), rgb(255, 138, 101), rgb(189, 255, 122))",
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 10s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes gradientAnimation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>

      <Card
        style={{
          width: 400,
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          background: "#fff",
          textAlign: "center",
          border: "2px solid #2ecc71",
        }}
      >
        <img src={logo} alt="Logo" style={{ width: 100, marginBottom: 20 }} />

        <Title
          level={2}
          style={{
            background:
              "linear-gradient(to right, #ff9a9e, rgb(255, 225, 216), rgb(89, 246, 45))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Login
        </Title>

        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="email"
            label={<span style={{ color: "#2ecc71" }}>Email</span>}
            rules={[
              { required: true, type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              placeholder="Enter your email"
              style={{
                background: "#fff",
                color: "#2ecc71",
                border: "1px solid #2ecc71",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: "#2ecc71" }}>Password</span>}
            rules={[{ required: true, message: "Password is required!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              style={{
                background: "#fff",
                color: "#2ecc71",
                border: "1px solid #2ecc71",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                backgroundColor: "#2ecc71",
                border: "none",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
