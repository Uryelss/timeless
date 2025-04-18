import React from "react";
import { Form, Input, Button, message, Row, Col, Select } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";

const Register = () => {
    const onFinish = (values) => {
        const payload = {
            username: values.username,
            email: values.email,
            first_name: values.first_name,
            middle_name: values.middle_name,
            last_name: values.last_name,
            suffix: values.suffix === "None" ? undefined : values.suffix,
            password: values.password,
            password_confirmation: values.password_confirmation,
        };

        axios
            .post("http://localhost:8000/api/register", payload)
            .then(() => {
                message.success("Registration successful! Please log in.");
                window.location.href = "/login";
            })
            .catch((error) => {
                message.error("Registration failed!");
                console.error(error);
            });
    };

    return (
        <div className="test-container">
            <div className="test-left">
                <img
                    src="/Images/test2.svg"
                    alt="Timeless SVG"
                    className="test-svg"
                />
            </div>
            <div className="test-right">
                <h2>JOIN TIMELESS</h2>
                <p className="sub-text">Create an account to continue</p>
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    className="test-form register-form"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Username"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a username!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    {
                                        required: true,
                                        type: "email",
                                        message: "Please enter a valid email!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="first_name"
                                label="First Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your first name!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="middle_name"
                                label="Middle Name (optional)"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="last_name"
                                label="Last Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your last name!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="suffix" label="Suffix (optional)">
                                <Select placeholder="Select suffix" allowClear>
                                    <Select.Option value="None">
                                        None
                                    </Select.Option>
                                    <Select.Option value="Jr">Jr</Select.Option>
                                    <Select.Option value="Sr">Sr</Select.Option>
                                    <Select.Option value="II">II</Select.Option>
                                    <Select.Option value="III">
                                        III
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a password!",
                                    },
                                    {
                                        min: 8,
                                        message:
                                            "Password must be at least 8 characters!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password_confirmation"
                                label="Confirm Password"
                                dependencies={["password"]}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please confirm your password!",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error(
                                                    "Passwords do not match!"
                                                )
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="test-button"
                        >
                            REGISTER
                        </Button>
                    </Form.Item>
                </Form>

                <p className="register-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;