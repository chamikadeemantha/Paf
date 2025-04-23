import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { BsGrid, BsListUl } from "react-icons/bs";
import { useLearningPlans } from '../../hooks/useLearningPlans';
import { useToast, ToastProvider } from '../../Components/common/ToastContainer';
import ConfirmDialog from '../../Components/common/ConfirmDialog';
import LoadingSpinner from '../../Components/common/LoadingSpinner';
import { ROUTES } from '../../constants';
import './post.css';

// Create a content component to wrap with ToastProvider
function MyLearningPlanContent() {
  const {
    filteredPlans: filteredPosts,
    loading,
    error,
    searchQuery,
    handleSearch,
    deletePlan,
    getEmbedURL
  } = useLearningPlans(true); // true = filter by logged-in user
  
  const [viewMode, setViewMode] = useState('grid');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, planId: null });
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const userId = localStorage.getItem('userID');

  const handleDeleteConfirmation = (id) => {
    setConfirmDialog({
      isOpen: true,
      planId: id,
      title: "Delete Learning Plan",
      message: "Are you sure you want to delete this learning plan? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        const success = await deletePlan(id);
        if (success) {
          showSuccess("Learning plan deleted successfully!");
        } else {
          showError("Failed to delete learning plan. Please try again.");
        }
      }
    });
  };

  const handleUpdate = (id) => {
    navigate(`/updateLearningPlan/${id}`);
  };

  const renderPostByTemplate = (post) => {
    if (!post.templateID) {
      return <div className="template template-default">Invalid template ID</div>;
    }

    switch (post.templateID) {
      case 1:
        return (
          <div className="template_dis template-1">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
              </div>
              {post.postOwnerID === userId && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDeleteConfirmation(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        );
      case 2:
        return (
          <div className="template_dis template-2">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
              </div>
              {post.postOwnerID === userId && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDeleteConfirmation(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            <div className='preview_part'>
              <div className='preview_part_sub'>
                {post.imageUrl && (
                  <img
                    src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                    alt={post.title}
                    className="iframe_preview"
                  />
                )}
              </div>
              <div className='preview_part_sub'>
                {post.contentURL && (
                  <iframe
                    src={getEmbedURL(post.contentURL)}
                    title={post.title}
                    className="iframe_preview"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="template_dis template-3">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
              </div>
              {post.postOwnerID === userId && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDeleteConfirmation(post.id)}
                    className='action_btn_icon' />
                </div>
              )}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="template template-default">
            <p>Unknown template ID: {post.templateID}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="continer">
          <LoadingSpinner size="large" text="Loading your learning plans..." />
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
        <div className='search-section'>
          <div className='search-controls'>
            <div className='searchinput'>
              <input
                type="text"
                placeholder="Search learning plans by title, description, or category"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className='view-toggle'>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <BsGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <BsListUl />
              </button>
            </div>
          </div>
        </div>

        <div className='continSection'>
          <div className='add_new_btn' onClick={() => navigate('/addLearningPlan')}>
            <IoIosCreate className='add_new_btn_icon' />
          </div>
          <div className={`post_card_continer ${viewMode}`}>
            {filteredPosts.length === 0 ? (
              <div className='not_found_box'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No learning plans found. Please create a new one.</p>
                <button className='not_found_btn' onClick={() => navigate('/addLearningPlan')}>
                  Create New Learning Plan
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className='post_card'>
                  {renderPostByTemplate(post)}
                </div>
              ))
            )}
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

// Wrapper component that provides the ToastProvider
function MyLearningPlan() {
  return (
    <ToastProvider>
      <MyLearningPlanContent />
    </ToastProvider>
  );
}

export default MyLearningPlan;
