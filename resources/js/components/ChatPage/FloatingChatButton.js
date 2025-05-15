import React, { useState } from "react";
import { Button, Drawer, Menu } from "antd";
import {
    MessageOutlined,
    PhoneOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import ChatBox from "./Chatbox";

const FloatingChatMenu = ({ userId }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);
    const [contactVisible, setContactVisible] = useState(false);
    const [supportVisible, setSupportVisible] = useState(false);

    // Toggle the menu drawer visibility
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    // Handle clicks on menu items
    const handleMenuClick = ({ key }) => {
        if (key === "chat") {
            setChatVisible(true);
        } else if (key === "contact") {
            setContactVisible(true);
        } else if (
            key === "support" ||
            key === "terms" ||
            key === "payment" ||
            key === "faqs" ||
            key === "order"
        ) {
            setSupportVisible(true);
        }
        setMenuVisible(false);
    };

    return (
        <>
            {/* Floating button to open the menu */}
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
                onClick={toggleMenu}
            />

            {/* Menu Drawer */}
            <Drawer
                title="Quick Options"
                placement="right"
                onClose={() => setMenuVisible(false)}
                visible={menuVisible}
                width={250}
            >
                <Menu onClick={handleMenuClick}>
                    <Menu.Item key="chat" icon={<MessageOutlined />}>
                        Chat With the Admin
                    </Menu.Item>
                    <Menu.Item key="contact" icon={<PhoneOutlined />}>
                        Contact Us
                    </Menu.Item>
                    <Menu.SubMenu
                        key="support"
                        icon={<QuestionCircleOutlined />}
                        title="Support"
                    >
                        <Menu.Item key="terms">Terms & Conditions</Menu.Item>
                        <Menu.Item key="payment">Modes of Payment</Menu.Item>
                        <Menu.Item key="faqs">FAQs</Menu.Item>
                        <Menu.Item key="order">How to Order</Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </Drawer>

            {/* Chat Box Drawer (existing chat functionality) */}
            <ChatBox
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
                userId={userId}
            />

            {/* Contact Us Drawer */}
            <Drawer
                title="Contact Us"
                placement="right"
                onClose={() => setContactVisible(false)}
                visible={contactVisible}
                width={350}
            >
                <p>
                    For inquiries, please email us at{" "}
                    <a href="mailto:support@example.com">support@example.com</a>{" "}
                    or call (123) 456-7890.
                </p>
            </Drawer>

            {/* Support Drawer */}
            <Drawer
                title="Support"
                placement="right"
                onClose={() => setSupportVisible(false)}
                visible={supportVisible}
                width={350}
            >
                <p>
                    <strong>Terms & Conditions:</strong>{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                        Read here
                    </a>
                </p>
                <p>
                    <strong>Modes of Payment:</strong>{" "}
                    <a
                        href="/payment-modes"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        See options
                    </a>
                </p>
                <p>
                    <strong>FAQs:</strong>{" "}
                    <a href="/faqs" target="_blank" rel="noopener noreferrer">
                        Frequently Asked Questions
                    </a>
                </p>
                <p>
                    <strong>How to Order:</strong>{" "}
                    <a
                        href="/how-to-order"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn the process
                    </a>
                </p>
            </Drawer>
        </>
    );
};

export default FloatingChatMenu;
