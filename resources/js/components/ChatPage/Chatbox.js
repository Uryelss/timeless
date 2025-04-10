// ChatPage/ChatBox.js
import React, { useState, useEffect } from "react";
import { Drawer, Input, Button, List, Avatar, message } from "antd";
import axios from "axios";

const { TextArea } = Input;

const ChatBox = ({ visible, onClose, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [userProfileImage, setUserProfileImage] = useState(null);
    const token = localStorage.getItem("token");

    // Fetch chat messages
    const fetchMessages = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/chat", {
                params: { user_id: userId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data);
        } catch (error) {
            message.error("Failed to load messages");
            console.error("Error fetching messages:", error);
        }
    };

    // Fetch user profile info to get profile image
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/user/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUserProfileImage(response.data.profile_image);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchMessages();
            fetchUserProfile();
        }
    }, [visible, userId]);

    const sendMessage = async () => {
        if (!newMsg.trim()) return;
        try {
            const response = await axios.post(
                "http://localhost:8000/api/chat",
                {
                    user_id: userId,
                    sender_type: "user",
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

    return (
        <Drawer
            title="Chat with Admin"
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
                                            : userProfileImage ||
                                              "https://via.placeholder.com/40?text=You"
                                    }
                                />
                            }
                            title={
                                item.sender_type === "admin" ? "Admin" : "You"
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

export default ChatBox;
