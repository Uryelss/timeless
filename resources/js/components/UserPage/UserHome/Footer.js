import React from "react";
import { Layout, Typography } from "antd";
import { Link } from "react-router-dom";

const { Footer } = Layout;
const { Text } = Typography;

const FooterComponent = () => {
    return (
        <Footer style={{ textAlign: "center" }}>
            TIMELESS ©{new Date().getFullYear()} |{" "}
            <Link to="/privacy">Privacy Policy</Link> |{" "}
            <Link to="/terms">Terms of Service</Link>
        </Footer>
    );
};

export default FooterComponent;
