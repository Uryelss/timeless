// File: resources/js/components/ChatPage/ChatBox.js
import React, { useState, useEffect, useRef } from "react";
import { Drawer, Input, Button, List, Avatar, message } from "antd";
import axios from "axios";

const { TextArea } = Input;

const ChatBox = ({ visible, onClose, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [userProfile, setUserProfile] = useState({
        username: "You",
        profile_image: "https://via.placeholder.com/40?text=Y",
    });
    const [adminProfile, setAdminProfile] = useState({
        username: "Admin",
        profile_image: "https://via.placeholder.com/40?text=A",
    });
    const [attachedImage, setAttachedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const token = localStorage.getItem("token");

    console.log("ChatBox props:", { userId, token });

    // Helper to return a full URL if needed
    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (!url.startsWith("http")) {
            return window.location.origin + url;
        }
        return url;
    };

    // Fetch admin profile
    const fetchAdminProfile = async () => {
        if (!token) {
            console.error("No token found for admin profile fetch");
            message.error("Authentication token missing");
            return;
        }
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin/profile",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Admin profile fetched:", response.data);
            setAdminProfile({
                username: response.data.username || "Support Admin",
                profile_image:
                    getFullImageUrl(response.data.profile_image) ||
                    "https://via.placeholder.com/40?text=A",
            });
        } catch (error) {
            console.error(
                "Error fetching admin profile:",
                error.response?.data || error.message
            );
            message.error("Failed to load admin profile");
        }
    };

    // Fetch user profile
    const fetchUserProfile = async () => {
        if (!userId) {
            console.error("No userId provided for user profile fetch");
            message.error("User ID missing");
            return;
        }
        if (!token) {
            console.error("No token found for user profile fetch");
            message.error("Authentication token missing");
            return;
        }
        try {
            const response = await axios.get(
                `http://localhost:8000/api/user/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Fetched user profile:", response.data);
            setUserProfile({
                username: response.data.username || "You",
                profile_image:
                    getFullImageUrl(response.data.profile_image) ||
                    `https://via.placeholder.com/40?text=${
                        response.data.username?.charAt(0) || "Y"
                    }`,
            });
        } catch (error) {
            console.error(
                "Error fetching user profile:",
                error.response?.data || error.message
            );
            message.error("Failed to load user profile");
        }
    };

    // Fetch chat messages
    const fetchMessages = async () => {
        if (!userId) {
            console.error("No userId provided for messages fetch");
            message.error("User ID missing");
            return;
        }
        try {
            const response = await axios.get("http://localhost:8000/api/chat", {
                params: { user_id: userId },
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Fetched messages:", response.data);
            setMessages(response.data);
        } catch (error) {
            console.error(
                "Error fetching messages:",
                error.response?.data || error.message
            );
            message.error("Failed to load messages");
        }
    };

    useEffect(() => {
        if (visible) {
            console.log("ChatBox visible, fetching data...");
            fetchMessages();
            fetchUserProfile();
            fetchAdminProfile();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [visible, userId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const sendMessage = async () => {
        if (!newMsg.trim() && !attachedImage) return;
        try {
            let response;
            if (attachedImage) {
                const formData = new FormData();
                formData.append("user_id", userId);
                formData.append("sender_type", "user");
                formData.append("message", newMsg);
                formData.append("image", attachedImage);
                response = await axios.post(
                    "http://localhost:8000/api/chat",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } else {
                response = await axios.post(
                    "http://localhost:8000/api/chat",
                    {
                        user_id: userId,
                        sender_type: "user",
                        message: newMsg,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
            setMessages([...messages, response.data]);
            setNewMsg("");
            setAttachedImage(null);
            setImagePreview(null);
        } catch (error) {
            console.error(
                "Error sending message:",
                error.response?.data || error.message
            );
            message.error("Failed to send message");
        }
    };

    console.log("Current state:", { adminProfile, userProfile });

    // Custom header with admin avatar and username
    const headerContent = (
        <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
                src={adminProfile.profile_image}
                style={{ marginRight: 10 }}
            />
            <span>Chat with {adminProfile.username}</span>
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
                                            ? adminProfile.profile_image
                                            : userProfile.profile_image
                                    }
                                />
                            }
                            title={
                                item.sender_type === "admin"
                                    ? adminProfile.username
                                    : userProfile.username
                            }
                            description={
                                <>
                                    <div>{item.message}</div>
                                    {item.image && (
                                        <img
                                            src={getFullImageUrl(item.image)}
                                            alt="attachment"
                                            style={{
                                                maxWidth: "100%",
                                                marginTop: 5,
                                            }}
                                        />
                                    )}
                                </>
                            }
                        />
                    </List.Item>
                )}
                style={{ marginBottom: 16, maxHeight: 300, overflowY: "auto" }}
            />

            {imagePreview && (
                <div style={{ marginBottom: 8 }}>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: "100%" }}
                    />
                </div>
            )}

            <TextArea
                rows={3}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
            />

            <div
                style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <Button onClick={triggerFileSelect}>Attach Image</Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </div>
                <Button type="primary" onClick={sendMessage}>
                    Send
                </Button>
            </div>
        </Drawer>
    );
};

export default ChatBox;
