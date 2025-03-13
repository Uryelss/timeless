import React from "react";
import { Form, Input, Button, message, Row, Col } from "antd";
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
            suffix: values.suffix, // optional
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
        <div className="auth-container">
            <div className="auth-box">
                <h2>Register</h2>
                <p className="sub-text">Create an account to continue</p>

                {/* Updated Form Structure */}
                <Form name="register" onFinish={onFinish} layout="vertical">
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
                                <Input className="auth-input" />
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
                                <Input className="auth-input" />
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
                                        message:
                                            "Please enter your first name!",
                                    },
                                ]}
                            >
                                <Input className="auth-input" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="middle_name"
                                label="Middle Name (optional)"
                            >
                                <Input className="auth-input" />
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
                                <Input className="auth-input" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="suffix" label="Suffix (optional)">
                                <Input className="auth-input" />
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
                                ]}
                            >
                                <Input.Password className="auth-input" />
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
                                                "Passwords do not match!"
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password className="auth-input" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="auth-button"
                        >
                            Register
                        </Button>
                    </Form.Item>
                </Form>

                <p className="register-text">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
