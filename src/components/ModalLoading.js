import React from "react";
import { Spin, Typography, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ModalLoading = () => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 64,
        color: "#1677ff",
        filter: "drop-shadow(0 4px 12px rgba(22, 119, 255, 0.4))",
      }}
      spin
    />
  );

  return (
    <div className="loading-container">
      <div className="loading-card">
        <Space direction="vertical" align="center" size="large">
          <div className="icon-wrapper">
            <Spin indicator={antIcon} />
          </div>
          <Typography.Title
            level={2}
            style={{
              margin: 0,
              color: "#1d39c4",
              fontWeight: 700,
              letterSpacing: "0.8px",
              background: "linear-gradient(45deg, #1d39c4, #1677ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            StepUp Admin
          </Typography.Title>
          <Typography.Text
            style={{
              fontSize: "18px",
              color: "#595959",
              fontWeight: 500,
              letterSpacing: "0.2px",
              padding: "4px 16px",
              background: "rgba(245, 245, 245, 0.8)",
              borderRadius: "12px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            Đang tải dữ liệu, vui lòng đợi...
          </Typography.Text>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </Space>
      </div>

      <style jsx>{`
        .loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(
            145deg,
            rgba(245, 248, 255, 0.95) 0%,
            rgba(230, 240, 255, 0.95) 100%
          );
          backdrop-filter: blur(4px);
          z-index: 9999;
          animation: fadeIn 0.4s ease-out;
        }

        .loading-container:hover .loading-card {
          transform: scale(1.02);
        }

        .icon-wrapper {
          padding: 16px;
          background: linear-gradient(135deg, #e6f0ff 0%, #f0f7ff 100%);
          border-radius: 50%;
          animation: pulseGlow 2s infinite ease-in-out;
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(22, 119, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 16px;
        }

        .progress-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #1677ff, #40c4ff);
          animation: progress 3s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 20px 8px rgba(22, 119, 255, 0.2);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.3);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ModalLoading;