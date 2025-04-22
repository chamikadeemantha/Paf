import React, { useEffect, useState } from 'react';
import { FaUserGraduate } from "react-icons/fa";
import { MdNotifications } from "react-icons/md";
import { MdNotificationsActive } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import axios from 'axios';
import './NavBar.css';
import Pro from './img/img.png';
import Logo from './img/logo.png';  // Add this import
import { fetchUserDetails } from '../../utils/userUtils';

function NavBar() {
    const [allRead, setAllRead] = useState(true);
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const userId = localStorage.getItem('userID');
    let lastScrollY = window.scrollY;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
                const unreadNotifications = response.data.some(notification => !notification.read);
                setAllRead(!unreadNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setIsVisible(false); // Hide navbar on scroll down
            } else {
                setIsVisible(true); // Show navbar on scroll up
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentPath = window.location.pathname;

    return (
        <div className={`navbar ${isVisible ? 'navbar_visible' : 'navbar_hidden'}`}>
            <div className="nav_con">
                <div className='nav_item_set'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src={Logo} 
                            alt="SkillPlate Logo" 
                            style={{ 
                                height: '40px',
                                marginRight: '10px'
                            }} 
                        />
                        <h1 style={{ 
                            margin: 0, 
                            padding: '0 20px', 
                            color: '#4a90e2', 
                            fontSize: '24px', 
                            fontWeight: 'bold' 
                        }}>
                            SkillPlate
                        </h1>
                    </div>
                    <div className='nav_bar_item'>

                        <p
                            className={`nav_nav_item ${currentPath === '/allPost' ? 'nav_nav_item_active' : ''}`}
                            onClick={() => (window.location.href = '/allPost')}
                        >
                            Meal Sharing
                        </p>
                        <p
                            className={`nav_nav_item ${currentPath === '/allLearningPlan' ? 'nav_nav_item_active' : ''}`}
                            onClick={() => (window.location.href = '/allLearningPlan')}
                        >
                            Meal Learning Plan
                        </p>
                        <p
                            className={`nav_nav_item ${currentPath === '/allMealProgress' ? 'nav_nav_item_active' : ''}`}
                            onClick={() => (window.location.href = '/allMealProgress')}
                        >
                            Meal Progress
                        </p>
                        {allRead ? (
                            <MdNotifications
                                className={`nav_item_icon ${currentPath === '/notifications' ? 'nav_item_icon_noty' : ''}`}
                                onClick={() => (window.location.href = '/notifications')} />
                        ) : (
                            <MdNotificationsActive className='nav_item_icon_noty' onClick={() => (window.location.href = '/notifications')} />
                        )}
                        <IoLogOut
                            className='nav_item_icon'
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        />

                        {googleProfileImage ? (
                            <img
                                src={googleProfileImage}
                                alt="Google Profile"
                                className="nav_item_icon"
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = Pro;
                                }}
                                onClick={() => {
                                    window.location.href = '/googalUserPro';
                                }}
                            />
                        ) : userProfileImage ? (
                            <img
                                src={userProfileImage}
                                alt="User Profile"
                                className="nav_item_icon"
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = Pro;
                                }}
                                onClick={() => {
                                    window.location.href = '/userProfile';
                                }}
                            />
                        ) : (
                            <FaUserGraduate
                                className='nav_item_icon'
                                onClick={() => {
                                    window.location.href = '/userProfile';
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
