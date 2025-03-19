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
        <div className="auth-page">
            <div className="login-container">
                <div className="login-box">
                    {!forgotPassword ? (
                        <>
                            <h2>Welcome Back</h2>
                            <p className="sub-text">
                                Please log in to your account
                            </p>
                            <Form
                                name="login"
                                onFinish={onFinishLogin}
                                layout="vertical"
                            >
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
                                            message:
                                                "Please enter your password!",
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
                                <p className="forgot-password-text">
                                    <a onClick={() => setForgotPassword(true)}>
                                        Forgot Password?
                                    </a>
                                </p>
                            </Form>
                        </>
                    ) : (
                        <>
                            <h2>Reset Password</h2>
                            {resetStep === 1 ? (
                                <>
                                    <p>
                                        Enter your email to receive a reset code
                                    </p>
                                    <Form
                                        name="forgot_password"
                                        onFinish={onEmailSubmit}
                                        layout="vertical"
                                    >
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
                                        >
                                            <Input
                                                prefix={<MailOutlined />}
                                                placeholder="Email"
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="login-button"
                                            >
                                                Send Reset Code
                                            </Button>
                                        </Form.Item>
                                        <p>
                                            <a
                                                onClick={() =>
                                                    setForgotPassword(false)
                                                }
                                            >
                                                Back to Login
                                            </a>
                                        </p>
                                    </Form>
                                </>
                            ) : resetStep === 2 ? (
                                <>
                                    <p>We have sent a code to {email}</p>
                                    <Form
                                        name="verify_code"
                                        onFinish={onCodeSubmit}
                                        layout="vertical"
                                    >
                                        <Form.Item
                                            name="token"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please enter the reset code!",
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder="Reset Code (e.g., AB5C87)"
                                                maxLength={6}
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="login-button"
                                            >
                                                Verify Code
                                            </Button>
                                        </Form.Item>
                                        <p>
                                            <a
                                                onClick={() =>
                                                    setForgotPassword(false)
                                                }
                                            >
                                                Back to Login
                                            </a>
                                        </p>
                                    </Form>
                                </>
                            ) : (
                                <>
                                    <p>Enter your new password for {email}</p>
                                    <Form
                                        name="reset_password"
                                        onFinish={onResetSubmit}
                                        layout="vertical"
                                    >
                                        <Form.Item
                                            name="token"
                                            initialValue={email} // Hidden field for token
                                            rules={[{ required: true }]}
                                            style={{ display: "none" }}
                                        >
                                            <Input type="hidden" />
                                        </Form.Item>
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
                                        >
                                            <Input.Password placeholder="New Password" />
                                        </Form.Item>
                                        <Form.Item
                                            name="password_confirmation"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please confirm your password!",
                                                },
                                            ]}
                                        >
                                            <Input.Password placeholder="Confirm Password" />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="login-button"
                                            >
                                                Reset Password
                                            </Button>
                                        </Form.Item>
                                        <p>
                                            <a
                                                onClick={() =>
                                                    setForgotPassword(false)
                                                }
                                            >
                                                Back to Login
                                            </a>
                                        </p>
                                    </Form>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
