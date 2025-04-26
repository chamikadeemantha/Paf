import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import GoogalLogo from "./img/glogo.png";
import { IoMdAdd } from "react-icons/io";
import "./userRegister.css";

function UserRegister() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    skills: [],
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState({
    file: null,
    loading: false,
    error: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [formStep, setFormStep] = useState(1);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullname":
        if (value.length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) error = "Phone must be 10 digits";
        break;
      default:
        break;
    }
    return error;
  };

  const validateImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minSize = 10 * 1024; // 10KB

    if (!file) return "Please select an image file";
    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPG, JPEG, or PNG)";
    }
    if (file.size > maxSize) {
      return "Image size should be less than 5MB";
    }
    if (file.size < minSize) {
      return "Image size should be at least 10KB";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput("");
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfilePicture((prev) => ({ ...prev, loading: true, error: null }));
    const error = validateImageFile(file);

    if (!error) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
          setProfilePicture((prev) => ({
            ...prev,
            file: file,
            loading: false,
          }));
        };
        reader.onerror = () => {
          setProfilePicture((prev) => ({
            ...prev,
            error: "Failed to read image file",
            loading: false,
          }));
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setProfilePicture((prev) => ({
          ...prev,
          error: "Failed to process image",
          loading: false,
        }));
      }
    } else {
      setProfilePicture((prev) => ({
        ...prev,
        error,
        loading: false,
      }));
      setPreviewImage(null);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("profilePictureInput").click();
  };

  const sendVerificationCode = async (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      setIsVerificationModalOpen(true); // Open modal first
      localStorage.setItem("verificationCode", code);

      await fetch("http://localhost:8080/sendVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send verification code. Please try again.");
      setIsVerificationModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      isValid = false;
    }
    if (!profilePicture.file) {
      alert("Profile picture is required");
      isValid = false;
    }
    if (formData.skills.length < 2) {
      alert("Please add at least two skills.");
      isValid = false;
    }
    if (!isValid) return;

    try {
      await sendVerificationCode(formData.email);

      const response = await fetch("http://localhost:8080/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { id: userId } = await response.json();

        if (profilePicture.file) {
          const profileFormData = new FormData();
          profileFormData.append("file", profilePicture.file);
          await fetch(
            `http://localhost:8080/user/${userId}/uploadProfilePicture`,
            {
              method: "PUT",
              body: profileFormData,
            }
          );
        }
      } else if (response.status === 409) {
        alert("Email already exists!");
        setIsVerificationModalOpen(false);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed. Please try again.");
      setIsVerificationModalOpen(false);
    }
  };

  const handleVerifyCode = () => {
    const savedCode = localStorage.getItem("verificationCode");
    if (!savedCode) {
      alert("Verification code expired. Please register again.");
      window.location.href = "/register";
      return;
    }

    if (userEnteredCode === savedCode) {
      localStorage.removeItem("verificationCode");
      alert("Registration successful!");
      window.location.href = "/";
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const handleModalClose = () => {
    setIsVerificationModalOpen(false);
    setUserEnteredCode("");
  };

  return (
    <div className="register-container">
      <div className="bg-bubbles">
        {[...Array(10)].map((_, i) => (
          <li key={i}></li>
        ))}
      </div>

      <div className="Auth_container" role="main">
        <div className="Auth_singleContainer">
          <div className="Auth_header">
            <h1 className="Auth_heading" id="registration-title">
              Create your account
            </h1>
            <p className="Auth_subheading">
              Complete the form below - Step {formStep} of 3
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="Auth_form"
            aria-labelledby="registration-title"
          >
            {formStep === 1 && (
              <fieldset className="form-step">
                <legend>Basic Information</legend>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="fullname">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="fullname"
                    className={`Auth_input ${
                      errors.fullname ? "input-error" : ""
                    }`}
                    type="text"
                    name="fullname"
                    aria-required="true"
                    aria-invalid={!!errors.fullname}
                    aria-describedby={
                      errors.fullname ? "fullname-error" : undefined
                    }
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.fullname && (
                    <span id="fullname-error" className="error-message">
                      {errors.fullname}
                    </span>
                  )}
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    className={`Auth_input ${
                      errors.email ? "input-error" : ""
                    }`}
                    type="email"
                    name="email"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && (
                    <span id="email-error" className="error-message">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    id="password"
                    className={`Auth_input ${
                      errors.password ? "input-error" : ""
                    }`}
                    type="password"
                    name="password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.password && (
                    <span id="password-error" className="error-message">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="form-navigation">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="next-button"
                    aria-label="Next to contact information"
                  >
                    Next
                  </button>
                </div>
              </fieldset>
            )}

            {formStep === 2 && (
              <fieldset className="form-step">
                <legend>Profile Information</legend>
                <div className="Auth_formGroup profile-upload-section">
                  <label className="Auth_label" htmlFor="profilePictureInput">
                    Profile Picture <span className="required">*</span>
                  </label>
                  <div
                    className={`profile-upload-container ${
                      profilePicture.error ? "error-border" : ""
                    }`}
                    onClick={triggerFileInput}
                    role="button"
                    aria-label="Upload profile picture"
                  >
                    <div className="profile-circle">
                      {profilePicture.loading ? (
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                        </div>
                      ) : previewImage ? (
                        <>
                          <img
                            src={previewImage}
                            alt="Selected Profile"
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
                  {profilePicture.error && (
                    <span className="error-message">
                      {profilePicture.error}
                    </span>
                  )}
                  <input
                    id="profilePictureInput"
                    className="hidden-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleProfilePictureChange}
                    aria-label="Upload profile picture"
                    required
                  />
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="phone">
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    id="phone"
                    className={`Auth_input ${
                      errors.phone ? "input-error" : ""
                    }`}
                    type="text"
                    name="phone"
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
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
                    title="Please enter exactly 10 digits"
                    required
                  />
                  {errors.phone && (
                    <span id="phone-error" className="error-message">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={() => setFormStep(1)}>
                    Back
                  </button>
                  <button type="button" onClick={() => setFormStep(3)}>
                    Next
                  </button>
                </div>
              </fieldset>
            )}

            {formStep === 3 && (
              <fieldset className="form-step">
                <legend>Skills & Bio</legend>
                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="skills">
                    Skills <span className="required">*</span>
                  </label>
                  <div className="skills-container">
                    <div className="skil_dis_con">
                      {formData.skills.map((skill, index) => (
                        <p className="skil_name" key={index}>
                          {skill}
                        </p>
                      ))}
                    </div>
                    <div className="skill-input-container">
                      <input
                        id="skills"
                        className="Auth_input"
                        type="text"
                        placeholder="Add a skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="skill-add-btn"
                      >
                        <IoMdAdd />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="Auth_formGroup">
                  <label className="Auth_label" htmlFor="bio">
                    Bio <span className="required">*</span>
                  </label>
                  <textarea
                    id="bio"
                    className="Auth_input"
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    rows={3}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-navigation">
                  <button type="button" onClick={() => setFormStep(2)}>
                    Back
                  </button>
                  <button type="submit">Create Account</button>
                </div>
              </fieldset>
            )}
          </form>

          <div className="Auth_divider" role="separator">
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "http://localhost:8080/oauth2/authorization/google")
            }
            className="Auth_googleButton"
          >
            <img src={GoogalLogo} alt="Google" className="glogo" />
            Continue with Google
          </button>

          <p className="Auth_signupPrompt">
            Already have an account?{" "}
            <span
              onClick={() => (window.location.href = "/")}
              className="Auth_signupLink"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {isVerificationModalOpen && (
        <div
          className="verification-modal"
          role="dialog"
          aria-labelledby="verification-title"
        >
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={handleModalClose}
              aria-label="Close verification modal"
            >
              ×
            </button>
            <h2 id="verification-title" className="veryname">
              Verify Your Email
            </h2>
            <p>A verification code has been sent to {formData.email}</p>
            <input
              type="text"
              value={userEnteredCode}
              onChange={(e) => setUserEnteredCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="verification-input"
              maxLength="6"
              pattern="[0-9]{6}"
            />
            <div className="verification-buttons">
              <button
                onClick={handleVerifyCode}
                className="verification-button"
              >
                Verify
              </button>
              <button
                onClick={() => sendVerificationCode(formData.email)}
                className="resend-button"
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRegister;
