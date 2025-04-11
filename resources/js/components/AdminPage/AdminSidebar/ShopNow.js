// src/components/ShopNowButton.js
import React from "react";
import { Button } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ShopNowButton = () => {
    const navigate = useNavigate();

    const handleShopNow = () => {
        // Redirect to the user shop/home page
        navigate("/user-home");
    };

    return (
        <Button
            type="primary"
            icon={<ShoppingOutlined />}
            onClick={handleShopNow}
        >
            Shop Now
        </Button>
    );
};

export default ShopNowButton;
