import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../Auth";
const Login = () => {
    const navigate = useNavigate();
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: Password
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (isAuthenticated()) {
            const user = JSON.parse(localStorage.getItem("user"));
            const redirectTo =
                user.role.name === "admin" ? "/dashboard" : "/user-home";
            navigate(redirectTo, { replace: true });
        }
    }, [navigate]);

    const onFinishLogin = (values) => {
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

    const onEmailSubmit = (values) => {
        axios
            .post("http://localhost:8000/api/forgot-password", {
                email: values.email,
            })
            .then((response) => {
                message.success(response.data.message);
                setEmail(values.email);
                setResetStep(2);
            })
            .catch((error) => {
                message.error(
                    error.response?.data?.message || "Something went wrong"
                );
            });
    };

    const onCodeSubmit = (values) => {
        axios
            .post("http://localhost:8000/api/verify-reset-code", {
                email: email,
                token: values.token,
            })
            .then((response) => {
                message.success(response.data.message);
                setResetStep(3); // Move to password step
            })
            .catch((error) => {
                message.error(error.response?.data?.message || "Invalid code");
            });
    };

    const onResetSubmit = (values) => {
        axios
            .post("http://localhost:8000/api/reset-password", {
                email: email,
                token: values.token,
                password: values.password,
                password_confirmation: values.password_confirmation,
            })
            .then((response) => {
                message.success(response.data.message);
                setForgotPassword(false);
                setResetStep(1);
            })
            .catch((error) => {
                message.error(
                    error.response?.data?.message || "Something went wrong"
                );
            });
    };

    window.onpopstate = () => {
        if (isAuthenticated()) {
            const user = JSON.parse(localStorage.getItem("user"));
            const redirectTo =
                user.role.name === "admin" ? "/dashboard" : "/user-home";
            navigate(redirectTo, { replace: true });
        }
    };

    return (
        <div className="test-container">
            {/* Left Section with SVG */}
            <div className="test-left">
                <img
                    src="/Images/test2.svg"
                    alt="Timeless SVG"
                    className="test-svg"
                />
            </div>

            {/* Right Section with Form */}
            <div className="test-right">
                {!forgotPassword ? (
                    <>
                        <h2>WELCOME TO TIMELESS</h2>
                        <Form
                            name="login"
                            onFinish={onFinishLogin}
                            className="test-form"
                        >
                            <div className="input-group">
                                <Form.Item
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter your email!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input
                                        prefix={
                                            <UserOutlined className="input-icon" />
                                        }
                                        placeholder="ENTER YOUR EMAIL"
                                    />
                                </Form.Item>
                            </div>
                            <div className="input-group">
                                <Form.Item
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please enter your password!",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input.Password
                                        prefix={
                                            <LockOutlined className="input-icon" />
                                        }
                                        placeholder="ENTER YOUR PASSWORD"
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="test-button"
                                >
                                    LOGIN
                                </Button>
                            </Form.Item>
                            <a
                                href="#"
                                className="forgot-password"
                                onClick={() => setForgotPassword(true)}
                            >
                                FORGOT PASSWORD?
                            </a>
                            <p className="register-link">
                                NEW TO TIMELESS?{" "}
                                <a href="/register">REGISTER HERE</a>
                            </p>
                        </Form>
                    </>
                ) : (
                    <>
                        <h2>RESET PASSWORD</h2>
                        {resetStep === 1 ? (
                            <Form
                                name="forgot_password"
                                onFinish={onEmailSubmit}
                                className="test-form"
                            >
                                <div className="input-group">
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your email!",
                                            },
                                            {
                                                type: "email",
                                                message:
                                                    "Please enter a valid email!",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            prefix={
                                                <MailOutlined className="input-icon" />
                                            }
                                            placeholder="ENTER YOUR EMAIL"
                                        />
                                    </Form.Item>
                                </div>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="test-button"
                                    >
                                        SEND RESET CODE
                                    </Button>
                                </Form.Item>
                                <p className="register-link">
                                    <a onClick={() => setForgotPassword(false)}>
                                        BACK TO LOGIN
                                    </a>
                                </p>
                            </Form>
                        ) : resetStep === 2 ? (
                            <Form
                                name="verify_code"
                                onFinish={onCodeSubmit}
                                className="test-form"
                            >
                                <div className="input-group">
                                    <Form.Item
                                        name="token"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter the reset code!",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="RESET CODE (e.g., AB5C87)"
                                            maxLength={6}
                                        />
                                    </Form.Item>
                                </div>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="test-button"
                                    >
                                        VERIFY CODE
                                    </Button>
                                </Form.Item>
                                <p className="register-link">
                                    <a onClick={() => setForgotPassword(false)}>
                                        BACK TO LOGIN
                                    </a>
                                </p>
                            </Form>
                        ) : (
                            <Form
                                name="reset_password"
                                onFinish={onResetSubmit}
                                className="test-form"
                            >
                                <Form.Item
                                    name="token"
                                    initialValue={email}
                                    rules={[{ required: true }]}
                                    style={{ display: "none" }}
                                >
                                    <Input type="hidden" />
                                </Form.Item>
                                <div className="input-group">
                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter new password!",
                                            },
                                            {
                                                min: 8,
                                                message:
                                                    "Password must be at least 8 characters!",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input.Password
                                            prefix={
                                                <LockOutlined className="input-icon" />
                                            }
                                            placeholder="NEW PASSWORD"
                                        />
                                    </Form.Item>
                                </div>
                                <div className="input-group">
                                    <Form.Item
                                        name="password_confirmation"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please confirm your password!",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input.Password
                                            prefix={
                                                <LockOutlined className="input-icon" />
                                            }
                                            placeholder="CONFIRM PASSWORD"
                                        />
                                    </Form.Item>
                                </div>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="test-button"
                                    >
                                        RESET PASSWORD
                                    </Button>
                                </Form.Item>
                                <p className="register-link">
                                    <a onClick={() => setForgotPassword(false)}>
                                        BACK TO LOGIN
                                    </a>
                                </p>
                            </Form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
