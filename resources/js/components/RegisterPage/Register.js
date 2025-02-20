import { useState } from "react";
import axios from "axios";

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        password: "",
        password_confirmation: "",
    });

    const handleChange = (e) => {
        console.log(`Changing ${e.target.name}:`, e.target.value); // ✅ Debugging Step
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", form); // ✅ Debugging: Check if username is being sent

        if (form.password !== form.password_confirmation) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await axios.post("http://localhost:8000/api/register", form);
            alert("Registration successful!");
        } catch (error) {
            console.error("Error:", error.response.data);
            alert("Error: " + error.response.data.message);
        }
    };
    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="Username"
                    value={form.username} // ✅ Ensuring controlled component
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="first_name"
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="middle_name"
                    placeholder="Middle Name"
                    value={form.middle_name}
                    onChange={handleChange}
                />
                <input
                    name="last_name"
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="suffix"
                    placeholder="Suffix"
                    value={form.suffix}
                    onChange={handleChange}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password_confirmation"
                    type="password"
                    placeholder="Confirm Password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
