import React from "react";
import { Layout, Typography, Row, Col } from "antd";
import { Link } from "react-router-dom";
import {
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Text, Title } = Typography;

const FooterComponent = () => {
    return (
        <Footer className="footer">
            <div className="footer-content">
                <Row gutter={[32, 32]} justify="center">
                    {/* Company Description */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} className="footer-title">
                            Timeless
                        </Title>
                        <Text className="footer-text">
                            Timeless offers a curated collection of premium
                            men’s and women’s watches, blending elegance and
                            innovation. Discover luxury, fashion, and smart
                            watches designed to elevate your style.
                        </Text>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} className="footer-title">
                            Quick Links
                        </Title>
                        <ul className="footer-links">
                            <li>
                                <Link to="/about">About Us</Link>
                            </li>
                            <li>
                                <Link to="/contact">Contact Us</Link>
                            </li>
                            <li>
                                <Link to="/privacy">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms">Terms of Service</Link>
                            </li>
                        </ul>
                    </Col>

                    {/* Contact Information */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} className="footer-title">
                            Contact Us
                        </Title>
                        <ul className="footer-contact">
                            <li>
                                <MailOutlined className="footer-icon" />
                                <Text className="footer-text">
                                    support@timelesswatches.com
                                </Text>
                            </li>
                            <li>
                                <PhoneOutlined className="footer-icon" />
                                <Text className="footer-text">
                                    +1 (800) 555-1234
                                </Text>
                            </li>
                            <li>
                                <EnvironmentOutlined className="footer-icon" />
                                <Text className="footer-text">
                                    123 Timeless Ave, New York, NY 10001
                                </Text>
                            </li>
                        </ul>
                    </Col>

                    {/* Social Media */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} className="footer-title">
                            Follow Us
                        </Title>
                        <div className="footer-social">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                            >
                                <FacebookOutlined />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                            >
                                <InstagramOutlined />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                            >
                                <TwitterOutlined />
                            </a>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Copyright Notice */}
            <div className="footer-copyright">
                <Text className="footer-text">
                    TIMELESS ©{new Date().getFullYear()} | All Rights Reserved
                </Text>
            </div>
        </Footer>
    );
};

export default FooterComponent;