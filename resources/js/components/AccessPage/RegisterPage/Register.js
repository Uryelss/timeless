import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const Register = () => {
    const onFinish = (values) => {
        const payload = {
            username: values.username,
            email: values.email,
            first_name: values.first_name,
            middle_name: values.middle_name,
            last_name: values.last_name,
            suffix: values.suffix, // optional
            password: values.password,
            password_confirmation: values.password_confirmation,
        };

        axios
            .post("http://localhost:8000/api/register", payload)
            .then((response) => {
                message.success("Registration successful! Please log in.");
                window.location.href = "/login";
            })
            .catch((error) => {
                message.error("Registration failed!");
                console.error(error);
            });
    };

    return (
        <div className="register-container">
            <h2>User Registration</h2>
            <Form name="register" onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        {
                            required: true,
                            message: "Please input your username!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
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
                    name="first_name"
                    label="First Name"
                    rules={[
                        {
                            required: true,
                            message: "Please input your first name!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="middle_name" label="Middle Name (optional)">
                    <Input />
                </Form.Item>
                <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[
                        {
                            required: true,
                            message: "Please input your last name!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="suffix" label="Suffix (optional)">
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
                <Form.Item
                    name="password_confirmation"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (
                                    !value ||
                                    getFieldValue("password") === value
                                ) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    "The two passwords do not match!"
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
