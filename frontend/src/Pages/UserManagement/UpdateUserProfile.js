import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import { FaUserCircle } from 'react-icons/fa';
import NavBar from '../../Components/NavBar/NavBar';
import './UpdateUserProfile.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [formStep, setFormStep] = useState(1);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/userProfile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        window.location.href = '/userProfile';
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="continer">
      <NavBar />
      <div className='continSection'>
        <div className='Auth_singleContainer'>
          <div className="Auth_header">
            <h1 className="Auth_heading">Update Your Profile</h1>
            <p className="Auth_subheading">Modify your profile information - Step {formStep} of 3</p>
          </div>
          <form onSubmit={handleSubmit} className="Auth_form">
            {formStep === 1 && (
              <fieldset className="form-step">
                <legend>Basic Information</legend>
                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="fullname">Full Name <span className="required">*</span></label>
                  <input
                    id="fullname"
                    className="modern-input"
                    type="text"
                    name="fullname"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="email">Email Address <span className="required">*</span></label>
                  <input
                    id="email"
                    className="modern-input"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="password">Password <span className="required">*</span></label>
                  <input
                    id="password"
                    className="modern-input"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
                  <button type="button" onClick={() => setFormStep(2)}>Next</button>
                </div>
              </fieldset>
            )}

            {formStep === 2 && (
              <fieldset className="form-step">
                <legend>Profile Information</legend>
                <div className="Auth_formGroup profile-upload-section">
                  <label className="Auth_label">Profile Picture <span className="required">*</span></label>
                  <div className="profile-upload-container" onClick={() => document.getElementById('profilePictureInput').click()}>
                    <div className="profile-circle">
                      {previewImage ? (
                        <>
                          <img src={previewImage} alt="Selected Profile" className="profile-preview" />
                          <div className="hover-overlay">
                            <span>Change Photo</span>
                          </div>
                        </>
                      ) : formData.profilePicturePath ? (
                        <>
                          <img
                            src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                            alt="Current Profile"
                            className="profile-preview"
                          />
                          <div className="hover-overlay">
                            <span>Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="upload-placeholder">
                          <FaUserCircle className="placeholder-icon" />
                          <div className="upload-text">
                            <p>Upload Photo</p>
                            <span>JPG, JPEG, PNG (max 5MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    id="profilePictureInput"
                    className="hidden-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleProfilePictureChange}
                  />
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="phone">Phone <span className="required">*</span></label>
                  <input
                    id="phone"
                    className="modern-input"
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => {
                      const re = /^[0-9\b]{0,10}$/;
                      if (re.test(e.target.value)) {
                        handleInputChange(e);
                      }
                    }}
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits."
                    required
                  />
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
                  <button type="button" onClick={() => setFormStep(1)}>Back</button>
                  <button type="button" onClick={() => setFormStep(3)}>Next</button>
                </div>
              </fieldset>
            )}

            {formStep === 3 && (
              <fieldset className="form-step">
                <legend>Skills & Bio</legend>
                <div className="Auth_formGroup">
                  <label className="Auth_label">Skills <span className="required">*</span></label>
                  <div className='skills-container'>
                    <div className='skil_dis_con'>
                      {formData.skills.map((skill, index) => (
                        <p className='skil_name' key={index}>
                          {skill}
                          <span className='remve_skil' onClick={() => handleRemoveSkill(skill)}>×</span>
                        </p>
                      ))}
                    </div>
                    <div className='skill-input-container'>
                      <input
                        className="modern-input"
                        type="text"
                        placeholder="Add a skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                      />
                      <button type="button" onClick={handleAddSkill} className="skill-add-btn">
                        <IoMdAdd />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label">Bio <span className="required">*</span></label>
                  <textarea
                    className="modern-input"
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
                  <button type="button" onClick={() => setFormStep(2)}>Back</button>
                  <button type="submit">Update Profile</button>
                </div>
              </fieldset>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
