import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaUser, FaUserEdit } from "react-icons/fa";
import NavBar from '../../Components/NavBar/NavBar';
import { authService } from '../../services/api';
import { useToast, ToastProvider } from '../../Components/common/ToastContainer';
import LoadingSpinner from '../../Components/common/LoadingSpinner';
import ConfirmDialog from '../../Components/common/ConfirmDialog';
import { ROUTES } from '../../constants';
import './UserProfile.css';

function UserProfileContent() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const userId = localStorage.getItem('userID');

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
                console.error('Error fetching user details:', error);
                setError('Failed to load profile information.');
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [navigate, userId]);

    const handleDeleteConfirmation = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Account",
            message: "Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.",
            confirmText: "Delete Account",
            cancelText: "Cancel",
            onConfirm: handleDelete
        });
    };

    const handleDelete = async () => {
        try {
            await authService.deleteUser(userId);
            localStorage.removeItem('userID');
            localStorage.removeItem('userType');
            localStorage.removeItem('googleProfileImage');
            showSuccess("Profile deleted successfully!");
            navigate(ROUTES.HOME);
        } catch (error) {
            console.error('Error deleting profile:', error);
            showError("Failed to delete profile. Please try again.");
        }
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="continer">
                    <LoadingSpinner size="large" text="Loading profile..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <NavBar />
                <div className="continer">
                    <div className="error-message">{error}</div>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='continer'>
                <NavBar />
                <div className='continSection'>
                    {userData && userData.id === userId && (
                        <div className="profile-card">
                            {userData.profilePicturePath ? (
                                <img
                                    src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            ) : (
                                <div className="profile-image">
                                    <FaUser size={60} color="rgba(255,255,255,0.8)" />
                                </div>
                            )}
                            <div className='pro_left_card'>
                                <div className='user_data_card'>
                                    <div className='user_data_card_new'>
                                        <p className='username_card'>{userData.fullname}</p>
                                        <p className='user_data_card_item_bio'>{userData.bio || 'No bio added yet'}</p>
                                    </div>
                                    <p className='user_data_card_item'><FaEnvelope className='user_data_card_icon' /> {userData.email}</p>
                                    <p className='user_data_card_item'><FaPhone className='user_data_card_icon' /> {userData.phone}</p>
                                    <p className='user_data_card_item'><FaTools className='user_data_card_icon' /> {userData.skills.join(', ')}</p>
                                </div>
                                <div className="profile-actions">
                                    <button 
                                        onClick={() => navigate(`/updateUserProfile/${userData.id}`)} 
                                        className="update-button"
                                    >
                                        <FaUserEdit /> Update Profile
                                    </button>
                                    <button onClick={handleDeleteConfirmation} className="delete-button">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='my_post_link'>
                    <div className='my_post_link_card' onClick={() => navigate(ROUTES.MY_LEARNING_PLANS)}>
                        <div className='my_post_name_img1'></div>
                        <p className='my_post_link_card_name'>My Learning Plan</p>
                    </div>
                    <div className='my_post_link_card' onClick={() => navigate(ROUTES.MY_POSTS)}>
                        <div className='my_post_name_img2'></div>
                        <p className='my_post_link_card_name'>My SkillPost</p>
                    </div>
                    <div className='my_post_link_card' onClick={() => navigate('/myMealProgress')}>
                        <div className='my_post_name_img3'></div>
                        <p className='my_post_link_card_name'>My Meal Progress</p>
                    </div>
                </div>
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
