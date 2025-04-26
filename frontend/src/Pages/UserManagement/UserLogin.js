import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogalLogo from "./img/glogo.png";
import { authService } from "../../services/api";
import { useToast } from "../../Components/common/Components/ToastContainer";
import { ROUTES, API_BASE_URL } from "../../constants";
import LoadingSpinner from "../../Components/common/LoadingSpinner";
import { useForm } from "../../hooks/useForm";
import "./userLogin.css";

function UserLogin() {
  const { values, handleChange, isSubmitting, setIsSubmitting } = useForm({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await authService.login(values);
      localStorage.setItem("userID", response.data.id);
      showSuccess("Login successful!");
      navigate(ROUTES.ALL_POSTS);
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.status === 401) {
        showError("Invalid credentials!");
      } else {
        showError("Failed to login. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="auth-container">
      <div className="bg-bubbles">
        {[...Array(10)].map((_, i) => (
          <li key={i}></li>
        ))}
      </div>
      <div className="auth-card">
        <div className="auth-content">
          <div className="platform-logo">SkillPlate</div>
          <h1 className="welcome-text">Welcome to SkillPlate</h1>
          <p className="subtitle">
            Join our community of food lovers and learners
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={handleChange}
                  required
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  className="modern-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-btn"
              disabled={isSubmitting}
            >
              <img src={GoogalLogo} alt="Google" className="google-icon" />
              Continue with Google
            </button>

            <p className="signup-text">
              Don't have an account?
              <span
                onClick={() => navigate(ROUTES.REGISTER)}
                className="signup-link"
              >
                Create account
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
