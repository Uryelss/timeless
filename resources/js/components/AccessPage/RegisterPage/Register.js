import React from "react";
import { Form, Input, Button, message, Row, Col, Select } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
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
                <h2>WELCOME TO TIMELESS</h2>
                <Form name="register" onFinish={onFinish} className="test-form">
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a username!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input
                                        prefix={<UserOutlined className="input-icon" />}
                                        placeholder="USERNAME"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            type: "email",
                                            message: "Please enter a valid email!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input
                                        prefix={<MailOutlined className="input-icon" />}
                                        placeholder="EMAIL"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="first_name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter your first name!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input
                                        prefix={<UserOutlined className="input-icon" />}
                                        placeholder="FIRST NAME"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item name="middle_name" noStyle>
                                    <Input
                                        prefix={<UserOutlined className="input-icon" />}
                                        placeholder="MIDDLE NAME (OPTIONAL)"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="last_name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter your last name!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input
                                        prefix={<UserOutlined className="input-icon" />}
                                        placeholder="LAST NAME"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item name="suffix" noStyle>
                                    <Select
                                        placeholder="SUFFIX (OPTIONAL)"
                                        allowClear
                                    >
                                        <Select.Option value="None">None</Select.Option>
                                        <Select.Option value="Jr">Jr</Select.Option>
                                        <Select.Option value="Sr">Sr</Select.Option>
                                        <Select.Option value="II">II</Select.Option>
                                        <Select.Option value="III">III</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a password!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="input-icon" />}
                                        placeholder="PASSWORD"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="input-group">
                                <Form.Item
                                    name="password_confirmation"
                                    dependencies={["password"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please confirm your password!",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject("Passwords do not match!");
                                            },
                                        }),
                                    ]}
                                    noStyle
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="input-icon" />}
                                        placeholder="CONFIRM PASSWORD"
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="test-button">
                            REGISTER
                        </Button>
                    </Form.Item>
                    <p className="register-link">
                        ALREADY HAVE AN ACCOUNT? <Link to="/login">LOGIN</Link>
                    </p>
                </Form>
            </div>
        </div>
    );
};

export default Register;