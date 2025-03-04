import React, { useState, useEffect } from "react";
import axios from "axios";

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
                username: response.data.username,
                email: response.data.email,
                first_name: response.data.first_name || "",
                middle_name: response.data.middle_name || "",
                last_name: response.data.last_name || "",
                suffix: response.data.suffix || "",
                date_of_birth: response.data.date_of_birth || "",
                gender: response.data.gender || "",
                profile_image: response.data.profile_image || null,
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    // ✅ Keep Edited Changes Separate Until Save is Clicked
    const [editedProfileData, setEditedProfileData] = useState({
        ...profileData,
    });

    const handleInputChange = (e) => {
        setEditedProfileData({
            ...editedProfileData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setEditedProfileData({
                ...editedProfileData,
                profile_image: e.target.files[0],
            });
        }
    };

    const handleEdit = () => {
        setEditMode(true);
        setEditedProfileData(profileData); // ✅ Copy current data into editable state
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
            fetchUserProfile(); // ✅ Refresh profile data after saving
        } catch (error) {
            console.error("Error updating profile:", error.response?.data);
            alert("Failed to update profile. Check the image format.");
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
            <h2>User Profile</h2>

            {/* ✅ Profile Image Display Section */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                    src={user.profile_image}
                    alt="Profile"
                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #ddd",
                    }}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={editedProfileData.username}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={editedProfileData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

                <label>First Name:</label>
                <input
                    type="text"
                    name="first_name"
                    value={editedProfileData.first_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

                <label>Middle Name:</label>
                <input
                    type="text"
                    name="middle_name"
                    value={editedProfileData.middle_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

                <label>Last Name:</label>
                <input
                    type="text"
                    name="last_name"
                    value={editedProfileData.last_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

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

                <label>Date of Birth:</label>
                <input
                    type="date"
                    name="date_of_birth"
                    value={editedProfileData.date_of_birth}
                    onChange={handleInputChange}
                    disabled={!editMode}
                />

                <label>Gender:</label>
                <select
                    name="gender"
                    value={editedProfileData.gender}
                    onChange={handleInputChange}
                    disabled={!editMode}
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <label>Profile Image:</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={!editMode}
                />

                {editMode ? (
                    <>
                        <button type="submit">Save Changes</button>
                        <button
                            type="button"
                            onClick={() => setEditMode(false)}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button type="button" onClick={handleEdit}>
                        Edit Profile
                    </button>
                )}
            </form>
        </div>
    );
};

export default UserProfile;
