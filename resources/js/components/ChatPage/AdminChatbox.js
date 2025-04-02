import React, { useState, useEffect } from "react";
import { Drawer, List, Input, Button, Avatar, message } from "antd";
import axios from "axios";

const { TextArea } = Input;

const AdminChatBox = ({ visible, onClose, conversation, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");

    useEffect(() => {
        console.log("AdminChatBox conversation:", conversation);
    }, [conversation]);

    const fetchMessages = async () => {
        if (!conversation) return;
        try {
            const response = await axios.get(
                `http://localhost:8000/api/admin/chat/${conversation.user_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
        } catch (error) {
            message.error("Failed to load messages");
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        let intervalId;
        if (visible && conversation) {
            fetchMessages();
            intervalId = setInterval(fetchMessages, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [visible, conversation]);

    const sendMessage = async () => {
        if (!newMsg.trim() || !conversation) return;
        try {
            const response = await axios.post(
                "http://localhost:8000/api/admin/chat",
                {
                    user_id: conversation.user_id,
                    sender_type: "admin",
                    message: newMsg,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages([...messages, response.data]);
            setNewMsg("");
        } catch (error) {
            message.error("Failed to send message");
            console.error("Error sending message:", error);
        }
    };

    if (!conversation) {
        return <div>Loading conversation...</div>; // Prevent rendering until conversation is ready
    }

    const displayUsername =
        conversation?.username && conversation.username.trim().length > 0
            ? conversation.username
            : "Unknown";

    const profileImage =
        conversation?.profile_image &&
        conversation.profile_image.trim().length > 0
            ? conversation.profile_image
            : `https://via.placeholder.com/40?text=${displayUsername.charAt(
                  0
              )}`;

    console.log(
        "Header - Username:",
        displayUsername,
        "Profile Image:",
        profileImage
    );

    const headerContent = (
        <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar src={profileImage} style={{ marginRight: 10 }} />
            <span>Chat with {displayUsername}</span>
        </div>
    );

    return (
        <Drawer
            title={headerContent}
            placement="right"
            onClose={onClose}
            visible={visible}
            width={350}
        >
            <List
                itemLayout="horizontal"
                dataSource={messages}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={
                                        item.sender_type === "admin"
                                            ? "https://via.placeholder.com/40?text=Admin"
                                            : profileImage
                                    }
                                />
                            }
                            title={
                                item.sender_type === "admin"
                                    ? "Admin"
                                    : displayUsername
                            }
                            description={item.message}
                        />
                    </List.Item>
                )}
                style={{ marginBottom: 16, maxHeight: 300, overflowY: "auto" }}
            />
            <TextArea
                rows={3}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
            />
            <Button
                type="primary"
                onClick={sendMessage}
                style={{ marginTop: 8 }}
            >
                Send
            </Button>
        </Drawer>
    );
};

export default AdminChatBox;
