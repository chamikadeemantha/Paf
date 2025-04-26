import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaTools,
  FaUser,
  FaUserEdit,
  FaTrash,
  FaGraduationCap,
  FaFileAlt,
  FaChartLine,
} from "react-icons/fa";
import NavBar from "../../Components/NavBar/NavBar";
import { authService } from "../../services/api";
import {
  useToast,
  ToastProvider,
} from "../../Components/common/ToastContainer";
import LoadingSpinner from "../../Components/common/LoadingSpinner";
import ConfirmDialog from "../../Components/common/ConfirmDialog";
import { ROUTES } from "../../constants";
import "./UserProfile.css";

function UserProfileContent() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        navigate(ROUTES.HOME);
        return;
      }

      try {
        setLoading(true);
        const response = await authService.getUserDetails(userId);
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to load profile information.");
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate, userId]);

  const handleDeleteConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Account",
      message:
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      onConfirm: handleDelete,
    });
  };

  const handleDelete = async () => {
    try {
      await authService.deleteUser(userId);
      localStorage.removeItem("userID");
      localStorage.removeItem("userType");
      localStorage.removeItem("googleProfileImage");
      showSuccess("Profile deleted successfully!");
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Error deleting profile:", error);
      showError("Failed to delete profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <NavBar />
        <div className="profile-container">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading profile..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <NavBar />
        <div className="profile-container">
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <NavBar />

      <div className="profile-container">
        {userData && userData.id === userId && (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-image-container">
                {userData.profilePicturePath ? (
                  <img
                    src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-avatar">
                    <FaUser />
                  </div>
                )}
              </div>

              <div className="profile-title">
                <h1 className="profile-name">{userData.fullname}</h1>
                <p className="profile-bio">
                  {userData.bio || "No bio added yet"}
                </p>

                <div className="profile-tabs">
                  <button
                    className={`tab-button ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </button>
                  <button
                    className={`tab-button ${
                      activeTab === "activities" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("activities")}
                  >
                    My Activities
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "profile" && (
              <div className="profile-details">
                <div className="profile-card">
                  <h3 className="card-title">Contact Information</h3>
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">{userData.email}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <div className="info-content">
                      <span className="info-label">Phone</span>
                      <span className="info-value">
                        {userData.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3 className="card-title">Skills & Expertise</h3>
                  <div className="skills-container">
                    {userData.skills && userData.skills.length > 0 ? (
                      userData.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="no-skills">No skills added yet</p>
                    )}
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    onClick={() =>
                      navigate(`/updateUserProfile/${userData.id}`)
                    }
                    className="action-button edit-button"
                  >
                    <FaUserEdit /> Update Profile
                  </button>
                  <button
                    onClick={handleDeleteConfirmation}
                    className="action-button delete-button"
                  >
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div className="activities-grid">
                <div
                  className="activity-card learning-plan"
                  onClick={() => navigate(ROUTES.MY_LEARNING_PLANS)}
                >
                  <div className="activity-icon">
                    <FaGraduationCap />
                  </div>
                  <h3>My Learning Plan</h3>
                  <p>View and manage your learning journey</p>
                </div>

                <div
                  className="activity-card skill-post"
                  onClick={() => navigate(ROUTES.MY_POSTS)}
                >
                  <div className="activity-icon">
                    <FaFileAlt />
                  </div>
                  <h3>My SkillPost</h3>
                  <p>Check your posts and interactions</p>
                </div>

                <div
                  className="activity-card meal-progress"
                  onClick={() => navigate("/myMealProgress")}
                >
                  <div className="activity-icon">
                    <FaChartLine />
                  </div>
                  <h3>My Meal Progress</h3>
                  <p>Track your cooking achievements</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          type="danger"
        />
      )}
    </div>
  );
}

// Wrap the component with ToastProvider
function UserProfile() {
  return (
    <ToastProvider>
      <UserProfileContent />
    </ToastProvider>
  );
}

export default UserProfile;
