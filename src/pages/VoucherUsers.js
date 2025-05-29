// src/pages/VoucherUsers.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, List, Typography } from "antd";

const VoucherUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { code, users = [] } = location.state || {};

  return (
    <div style={{ padding: 24 }}>
        <Button style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <Typography.Title level={3}>
        Người đã dùng voucher "{code}"
      </Typography.Title>
      <List
        bordered
        dataSource={users}
        renderItem={(user, index) => (
          <List.Item>
            <strong>{index + 1}.</strong> {user}
          </List.Item>
        )}
        style={{ marginTop: 16 }}
      />
      
    </div>
  );
};

export default VoucherUsers;
