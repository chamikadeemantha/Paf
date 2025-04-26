import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaTools } from "react-icons/fa";
import "./GoogleUserProfile.css";
import Pro from "./img/img.png";
import NavBar from "../../Components/NavBar/NavBar";
export const fetchUserDetails = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/user/${userId}`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch user details");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};
function GoogalUserPro() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userID");
  const [googleProfileImage, setGoogleProfileImage] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  useEffect(() => {
    const userId = localStorage.getItem("userID");
    if (userId) {
      fetchUserDetails(userId).then((data) => setUserData(data));
    }
  }, []);
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);
    if (storedUserType === "google") {
      const googleImage = localStorage.getItem("googleProfileImage");
      setGoogleProfileImage(googleImage);
    } else if (userId) {
      fetchUserDetails(userId).then((data) => {
        if (data && data.profilePicturePath) {
          setUserProfileImage(
            `http://localhost:8080/uploads/profile/${data.profilePicturePath}`
          );
        }
      });
    }
  }, [userId]);
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      const userId = localStorage.getItem("userID");
      fetch(`http://localhost:8080/user/${userId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            alert("Profile deleted successfully!");
            localStorage.removeItem("userID");
            navigate("/"); // Redirect to home or login page
          } else {
            alert("Failed to delete profile.");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  return (
    <div className="auth-container">
      <div className="content-wrapper">
        <NavBar />
        <div className="main-content">
          {userData && userData.id === localStorage.getItem("userID") && (
            <div className="profile-card">
              <div className="profile-header">
                <img
                  src={
                    googleProfileImage
                      ? googleProfileImage
                      : userProfileImage
                      ? userProfileImage
                      : Pro
                  }
                  alt="Profile"
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Pro;
                  }}
                />
                <div className="user_data_card">
                  <div className="user_data_card_new">
                    <h1 className="username_card">{userData.fullname}</h1>
                    <p className="user_data_card_item_bio">
                      {userData.bio || "No bio added"}
                    </p>
                  </div>
                  <p className="user_data_card_item">
                    <FaEnvelope /> {userData.email}
                  </p>
                  <div className="profile-actions">
                    <button onClick={handleDelete} className="delete-button">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="my_post_link">
            <div
              className="my_post_link_card"
              onClick={() => (window.location.href = "/myLearningPlan")}
            >
              <div className="my_post_name_img1"></div>
              <p className="my_post_link_card_name">My Learning Plan</p>
            </div>
            <div
              className="my_post_link_card"
              onClick={() => (window.location.href = "/myAllPost")}
            >
              <div className="my_post_name_img2"></div>
              <p className="my_post_link_card_name">My SkillPost</p>
            </div>
            <div
              className="my_post_link_card"
              onClick={() => (window.location.href = "/myAchievements")}
            >
              <div className="my_post_name_img3"></div>
              <p className="my_post_link_card_name">My Achievements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogalUserPro;
