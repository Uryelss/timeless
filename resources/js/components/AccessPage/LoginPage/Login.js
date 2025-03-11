import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const Login = () => {
    const onFinish = (values) => {
        axios
            .post("http://localhost:8000/api/login", values)
            .then((response) => {
                // Save token and user details to localStorage
                localStorage.setItem("token", response.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
                localStorage.setItem("userId", response.data.user.id); // Save user ID

                message.success("Login successful!");
                const user = response.data.user;
                // Redirect based on role
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
        <div className="login-container">
            <h2>Login</h2>
            <Form name="login" onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {
                            required: true,
                            type: "email",
                            message: "Please input a valid email!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
