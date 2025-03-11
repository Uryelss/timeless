import React from "react";
import { Form, Input, Button, message } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const onFinish = (values) => {
        axios
            .post("http://localhost:8000/api/login", values)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                const user = response.data.user;
                message.success("Login successful!");

                if (user.role && user.role.name === "admin") {
                    window.location.href = "/dashboard";
                } else {
                    window.location.href = "/user-home";
                }
            })
            .catch((error) => {
                message.error("Login failed! Check your credentials.");
                console.error(error);
            });
    };

    return (
        <div className="login-section">
            {/* Image Background from Public Folder */}
            <img src="/images/rolexdaytona.png" alt="Login Background" className="login-bg" />

            {/* Login Form */}
            <div className="login-container">
                <h2 className="login-title">Login</h2>
                <Form name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button">
                            Login
                        </Button>
                    </Form.Item>
                </Form>
                <p className="signup-link">
                    Don't have an account? <Link to="/register">Sign up here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;