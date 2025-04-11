// File: ChatBox.js
import React, { useState, useEffect, useRef } from "react";
import { Drawer, Input, Button, List, Avatar, message } from "antd";
import axios from "axios";

const { TextArea } = Input;

const ChatBox = ({ visible, onClose, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [attachedImage, setAttachedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const token = localStorage.getItem("token");

    // Helper to return a full URL if needed
    const getFullImageUrl = (url) => {
        if (url && !url.startsWith("http")) {
            return window.location.origin + url;
        }
        return url;
    };

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

    // Fetch user profile info
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/user/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Fetched user profile:", response.data);
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
