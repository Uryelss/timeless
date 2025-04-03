// File: AdminChatBox.js
import React, { useState, useEffect, useRef } from "react";
import { Drawer, List, Input, Button, Avatar, message } from "antd";
import axios from "axios";

const { TextArea } = Input;

const AdminChatBox = ({ visible, onClose, conversation, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [attachedImage, setAttachedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Helper to return a full URL if needed
    const getFullImageUrl = (url) => {
        if (url && !url.startsWith("http")) {
            return window.location.origin + url;
        }
        return url;
    };

    // Log conversation data for debugging
    useEffect(() => {
        if (conversation) {
            console.log("AdminChatBox conversation:", conversation);
        } else {
            console.log("No conversation data available.");
        }
    }, [conversation]);

    // Fetch messages when visible and conversation exists
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
            intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [visible, conversation]);

    // File input change handler
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

    // Send a new message (with optional image)
    const sendMessage = async () => {
        if (!newMsg.trim() && !attachedImage) return; // Require either text or an image
        try {
            let response;
            if (attachedImage) {
                const formData = new FormData();
                formData.append("user_id", conversation.user_id);
                formData.append("sender_type", "admin");
                formData.append("message", newMsg);
                formData.append("image", attachedImage);
                response = await axios.post(
                    "http://localhost:8000/api/admin/chat",
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
                    "http://localhost:8000/api/admin/chat",
                    {
                        user_id: conversation.user_id,
                        sender_type: "admin",
                        message: newMsg,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setMessages([...messages, response.data]);
            setNewMsg("");
            setAttachedImage(null);
            setImagePreview(null);
        } catch (error) {
            message.error("Failed to send message");
            console.error("Error sending message:", error);
        }
    };

    if (!conversation) {
        return <div>Loading conversation...</div>;
    }

    const displayUsername = conversation?.username?.trim() || "Unknown";
    const profileImage =
        conversation?.profile_image?.trim() ||
        `https://via.placeholder.com/40?text=${displayUsername.charAt(0)}`;

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

export default AdminChatBox;
