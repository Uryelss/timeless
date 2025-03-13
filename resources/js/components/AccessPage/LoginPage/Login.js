// Login.jsx - Modified version
import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../Auth";

const Login = () => {
    const navigate = useNavigate();

    // Prevent access to login if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            const user = JSON.parse(localStorage.getItem("user"));
            const redirectTo =
                user.role.name === "admin" ? "/dashboard" : "/user-home";
            navigate(redirectTo, { replace: true });
        }
    }, [navigate]);

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

                // Prevent back button
                window.history.pushState(null, "", window.location.href);

                if (user.role && user.role.name === "admin") {
                    navigate("/dashboard", { replace: true });
                } else {
                    navigate("/user-home", { replace: true });
                }
            })
            .catch(() => {
                message.error("Login failed! Check your credentials.");
            });
    };

    // Prevent back button navigation
    window.onpopstate = () => {
        if (isAuthenticated()) {
            const user = JSON.parse(localStorage.getItem("user"));
            const redirectTo =
                user.role.name === "admin" ? "/dashboard" : "/user-home";
            navigate(redirectTo, { replace: true });
        }
    };

    return (
        <div className="auth-page">
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
