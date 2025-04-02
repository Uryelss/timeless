// File: AdminChatInbox.js
import React, { useState, useEffect } from "react";
import { Drawer, List, Avatar, Badge, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import axios from "axios";
import AdminChatBox from "./AdminChatBox";

const AdminChatInbox = () => {
    const [inboxVisible, setInboxVisible] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);
    const token = localStorage.getItem("token");

    const fetchInbox = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin/chat/inbox",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to fetch inbox", error);
        }
    };

    useEffect(() => {
        fetchInbox();
        // Poll every 5 seconds for updates.
        const interval = setInterval(fetchInbox, 5000);
        return () => clearInterval(interval);
    }, []);

    const openChat = (conversation, e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSelectedConversation(conversation);
        setChatVisible(true);
        setInboxVisible(false);
    };

    // Compute total unread count.
    const totalUnread = conversations.reduce(
        (sum, conv) => sum + (conv.unread_count || 0),
        0
    );

    return (
        <>
            <Drawer
                title="User Conversations"
                placement="right"
                onClose={() => setInboxVisible(false)}
                visible={inboxVisible}
                width={350}
            >
                <List
                    dataSource={conversations}
                    renderItem={(item) => (
                        <List.Item onClick={(e) => openChat(item, e)}>
                            <List.Item.Meta
                                avatar={
                                    <Badge count={item.unread_count}>
                                        <Avatar
                                            src={
                                                item.profile_image
                                                    ? item.profile_image
                                                    : item.username
                                                    ? `https://via.placeholder.com/40?text=${item.username.charAt(
                                                          0
                                                      )}`
                                                    : "https://via.placeholder.com/40?text=U"
                                            }
                                        />
                                    </Badge>
                                }
                                title={
                                    item.username ? item.username : "Unknown"
                                }
                                description={item.last_message}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
            <AdminChatBox
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
                conversation={selectedConversation}
                token={token}
            />
            <Button
                type="primary"
                shape="circle"
                icon={
                    <Badge count={totalUnread} overflowCount={99}>
                        <MessageOutlined />
                    </Badge>
                }
                size="large"
                style={{
                    position: "fixed",
                    bottom: 30,
                    right: 30,
                    zIndex: 1000,
                }}
                onClick={() => setInboxVisible(true)}
            />
        </>
    );
};

export default AdminChatInbox;
