import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
    const navigate = useNavigate(); // Initialize navigate

    const onFinish = (values) => {
        axios
            .post("http://localhost:8000/api/login", values)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
                localStorage.setItem("userId", response.data.user.id);

                message.success("Login successful!");
                const user = response.data.user;
                if (user.role && user.role.name === "admin") {
                    navigate("/dashboard"); // Use navigate instead of window.location.href
                } else {
                    navigate("/homepage"); // Use navigate instead of window.location.href
                }
            })
            .catch(() => {
                message.error("Login failed! Check your credentials.");
            });
    };

    return (
        <div className="auth-page">
            {" "}
            {/* ✅ Add wrapper to prevent style issues */}
            <div className="login-container">
                <div className="login-box">
                    <h2>Welcome Back</h2>
                    <p className="sub-text">Please log in to your account</p>
                    <Form name="login" onFinish={onFinish} layout="vertical">
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your email!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Email"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your password!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="login-button"
                            >
                                Login
                            </Button>
                        </Form.Item>
                        <p className="register-text">
                            Don’t have an account?{" "}
                            <a href="/register">Register here</a>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
