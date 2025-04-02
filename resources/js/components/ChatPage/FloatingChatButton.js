// File: FloatingChatButton.js
import React, { useState } from "react";
import { Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import ChatBox from "./ChatBox";

const FloatingChatButton = ({ userId }) => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Button
                type="primary"
                shape="circle"
                icon={<MessageOutlined />}
                size="large"
                style={{
                    position: "fixed",
                    bottom: 30,
                    right: 30,
                    zIndex: 1000,
                }}
                onClick={() => setVisible(true)}
            />
            <ChatBox
                visible={visible}
                onClose={() => setVisible(false)}
                userId={userId}
            />
        </>
    );
};

export default FloatingChatButton;
