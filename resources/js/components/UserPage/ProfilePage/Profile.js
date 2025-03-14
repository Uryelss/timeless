import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Layout, Menu } from "antd";
import Navbar from "../Navbar/Navbar";

const { Sider, Content } = Layout;

const UserProfile = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formValues, setFormValues] = useState({
        username: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
    });
    const [previewImage, setPreviewImage] = useState("");
    const token = localStorage.getItem("token");

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("API Response:", res.data);

            const formattedData = { ...res.data };
            if (formattedData.date_of_birth) {
                formattedData.date_of_birth = dayjs(
                    formattedData.date_of_birth
                ).format("YYYY-MM-DD");
            }
            if (formattedData.gender) {
                formattedData.gender =
                    formattedData.gender.charAt(0).toUpperCase() +
                    formattedData.gender.slice(1).toLowerCase();
            }

            setProfileData(formattedData);
            setFormValues({ ...formattedData });
            setPreviewImage(
                formattedData.profile_image
                    ? formattedData.profile_image + "?" + new Date().getTime()
                    : "http://localhost:8000/storage/profiles/tennis-racket.png"
            );
        } catch (error) {
            console.error("Error fetching profile:", error);
            alert("Error fetching profile");
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            alert("No token found, please log in.");
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        console.log(`Changed ${name} to:`, value);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file);
            setFormValues((prev) => ({ ...prev, profile_image: file }));
            // Display the selected image immediately (optimistic preview)
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        // Revert to last saved profileData
        setFormValues({ ...profileData });
        setPreviewImage(
            profileData.profile_image
                ? profileData.profile_image + "?" + new Date().getTime()
                : "http://localhost:8000/storage/profiles/tennis-racket.png"
        );
        setEditMode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create "optimistic" data
        const optimisticData = { ...formValues };
        if (optimisticData.date_of_birth) {
            optimisticData.date_of_birth = dayjs(
                optimisticData.date_of_birth
            ).format("YYYY-MM-DD");
        }
        if (optimisticData.gender) {
            optimisticData.gender =
                optimisticData.gender.charAt(0).toUpperCase() +
                optimisticData.gender.slice(1).toLowerCase();
        }

        // Immediately update UI (optimistic)
        setProfileData(optimisticData);
        setEditMode(false);
        setPreviewImage(
            optimisticData.profile_image instanceof File
                ? URL.createObjectURL(optimisticData.profile_image)
                : optimisticData.profile_image
                ? optimisticData.profile_image + "?" + new Date().getTime()
                : "http://localhost:8000/storage/profiles/tennis-racket.png"
        );

        try {
            const formData = new FormData();
            Object.keys(formValues).forEach((key) => {
                if (key === "profile_image") {
                    if (formValues.profile_image instanceof File) {
                        formData.append(key, formValues.profile_image);
                    }
                } else {
                    formData.append(key, formValues[key] || "");
                }
            });
            console.log("Form data sent:", Object.fromEntries(formData));

            // Send POST request to update the profile
            const res = await axios.post(
                "http://localhost:8000/api/profile",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Update Response:", res.data);

            if (res.data) {
                const updatedData = { ...res.data };
                if (updatedData.date_of_birth) {
                    updatedData.date_of_birth = dayjs(
                        updatedData.date_of_birth
                    ).format("YYYY-MM-DD");
                }
                if (updatedData.gender) {
                    updatedData.gender =
                        updatedData.gender.charAt(0).toUpperCase() +
                        updatedData.gender.slice(1).toLowerCase();
                }
                // Update local state with server data
                setProfileData(updatedData);
                setFormValues(updatedData);
                setPreviewImage(
                    updatedData.profile_image
                        ? updatedData.profile_image + "?" + new Date().getTime()
                        : "http://localhost:8000/storage/profiles/tennis-racket.png"
                );

                // Dispatch custom event so the Navbar updates automatically
                window.dispatchEvent(
                    new CustomEvent("profileUpdated", { detail: updatedData })
                );
            }
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error.response?.data);
            alert("Update failed. Reverting changes.");
            // On error, revert to the previously saved data from the server
            fetchProfile();
        }
    };

    if (!profileData) {
        return <p>Loading...</p>;
    }

    const items = [
        { key: "1", label: "PROFILE" },
        { key: "2", label: "MY PURCHASE" },
        { key: "3", label: "ADDRESSES" },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    trigger={null}
                    style={{
                        background: "#fff",
                        height: "80vh",
                        width: collapsed ? "80px" : "200px",
                        transition: "width 0.2s",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <Menu
                            theme="light"
                            defaultSelectedKeys={["1"]}
                            mode="inline"
                            items={items}
                            style={{
                                height: "100%",
                                borderRight: 0,
                                paddingTop: "20px",
                            }}
                        />
                        <div
                            style={{
                                textAlign: "center",
                                padding: "10px 0",
                                background: collapsed
                                    ? "transparent"
                                    : "#001529",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? ">" : "<"}
                        </div>
                    </div>
                </Sider>

                <Content
                    style={{
                        margin: "24px 16px 0",
                        overflow: "initial",
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: "#fff",
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            {/* Force re-render when previewImage changes */}
                            <img
                                key={previewImage}
                                src={previewImage}
                                alt="Profile"
                                style={{
                                    width: "120px",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                            />
                            <h2>{profileData.username}</h2>
                            {!editMode && (
                                <button
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#0066cc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                    }}
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 15,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <label>Username:</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formValues.username}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 15,
                                    flexWrap: "wrap",
                                    marginTop: 15,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <label>First Name:</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formValues.first_name}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Middle Name:</label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={formValues.middle_name}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 15,
                                    flexWrap: "wrap",
                                    marginTop: 15,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formValues.last_name}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Suffix:</label>
                                    <select
                                        name="suffix"
                                        value={formValues.suffix}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    >
                                        <option value="">None</option>
                                        <option value="Jr.">Jr.</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                    </select>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 15,
                                    flexWrap: "wrap",
                                    marginTop: 15,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <label>Date of Birth:</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formValues.date_of_birth}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Gender:</label>
                                    <select
                                        name="gender"
                                        value={
                                            formValues.gender || "Select Gender"
                                        }
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        style={{
                                            width: "100%",
                                            padding: 6,
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                        }}
                                    >
                                        <option value="Select Gender">
                                            Select Gender
                                        </option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 15,
                                    flexWrap: "wrap",
                                    marginTop: 15,
                                }}
                            >
                                <div style={{ flex: 2 }}>
                                    <label>Profile Image:</label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        disabled={!editMode}
                                        style={{ width: "100%", padding: 5 }}
                                    />
                                </div>
                            </div>

                            {editMode && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        justifyContent: "center",
                                        marginTop: 15,
                                        width: "100%",
                                    }}
                                >
                                    <button
                                        type="submit"
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "#4caf50",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            padding: "8px 16px",
                                            backgroundColor: "#ff4444",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                        }}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserProfile;
