// UserProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../UserLayout/Navbar"; // Import the Navbar to render it at the top

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: "",
        email: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUser(response.data);
            setProfileData({
                username: response.data.username || "",
                email: response.data.email || "",
                first_name: response.data.first_name || "",
                middle_name: response.data.middle_name || "",
                last_name: response.data.last_name || "",
                suffix: response.data.suffix || "",
                date_of_birth: response.data.date_of_birth || "",
                gender: response.data.gender || "",
                profile_image:
                    response.data.profile_image || "/default-profile.png",
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const [editedProfileData, setEditedProfileData] = useState({
        ...profileData,
    });
    const [previewImage, setPreviewImage] = useState(profileData.profile_image);

    useEffect(() => {
        setEditedProfileData(profileData);
        setPreviewImage(profileData.profile_image);
    }, [profileData]);

    const handleInputChange = (e) => {
        setEditedProfileData({
            ...editedProfileData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setEditedProfileData({
                ...editedProfileData,
                profile_image: file,
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            Object.keys(editedProfileData).forEach((key) => {
                if (key !== "profile_image") {
                    formData.append(key, editedProfileData[key]);
                }
            });

            if (editedProfileData.profile_image instanceof File) {
                formData.append(
                    "profile_image",
                    editedProfileData.profile_image
                );
            }

            await axios.post(
                "http://localhost:8000/api/update-profile",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            alert("Profile updated successfully!");
            setEditMode(false);
            fetchUserProfile();
        } catch (error) {
            console.error("Error updating profile:", error.response?.data);
            alert("Complete the Requirements Fields");
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="profile-container">
            <Navbar /> {/* Render the Navbar at the top */}
            <div className="user-sidebar">
                <div className="sidebar-item">PROFILE</div>
                <div className="sidebar-item">MY PURCHASE</div>
                <div className="sidebar-item">ADDRESSES</div>
            </div>
            <div className="profile-content">
                <div className="profile-header">
                    <img
                        src={previewImage}
                        alt="Profile"
                        style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                        }}
                    />
                    <h2>{user.username}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={editedProfileData.username}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={editedProfileData.email}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={editedProfileData.first_name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Middle Name:</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={editedProfileData.middle_name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={editedProfileData.last_name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Suffix:</label>
                        <select
                            name="suffix"
                            value={editedProfileData.suffix}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        >
                            <option value="">None</option>
                            <option value="Jr.">Jr.</option>
                            <option value="Sr.">Sr.</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date of Birth:</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={editedProfileData.date_of_birth}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender:</label>
                        <select
                            name="gender"
                            value={editedProfileData.gender || ""}
                            onChange={handleInputChange}
                            disabled={!editMode}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Profile Image:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            disabled={!editMode}
                        />
                    </div>

                    {editMode ? (
                        <>
                            <button type="submit" className="save-btn">
                                Save Changes
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="edit-btn"
                            onClick={handleEdit}
                        >
                            Edit Profile
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
