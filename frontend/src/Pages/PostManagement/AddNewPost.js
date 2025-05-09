import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import LoadingSpinner from '../../Components/common/Components/LoadingSpinner';
import { ToastProvider, useToast } from '../../Components/common/Components/ToastContainer';
import { postService } from '../../services/api';
import { POST_CATEGORIES, FILE_LIMITS, ROUTES } from '../../constants';
import './AddNewPost.css';
import '../../styles/theme.css';

// Create a wrapper component that provides ToastContext
const AddNewPostWithToast = () => {
  return (
    <ToastProvider>
      <AddNewPostContent />
    </ToastProvider>
  );
};

// The main component content
function AddNewPostContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState({ title: 0, description: 0, ingredients: 0, recipe: 0 });
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const userID = localStorage.getItem('userID');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.length < 5 ? 'Title must be at least 5 characters' : '';
      case 'description':
        return value.length < 10 ? 'Description must be at least 10 characters' : '';
      case 'ingredients':
        return value.length < 5 ? 'Ingredients must be at least 5 characters' : '';
      case 'recipe':
        return value.length < 10 ? 'Recipe steps must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update char count
    setCharCount(prev => ({
      ...prev,
      [name]: value.length
    }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Update field value
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'category':
        setCategories(value);
        break;
      case 'ingredients':
        setIngredients(value);
        break;
      case 'recipe':
        setRecipe(value);
        break;
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const removeFile = (index) => {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setMedia([]);
    setMediaPreviews([]);
  };

  const handleFiles = (files) => {
    const hasVideo = media.some((file) => file.type.startsWith('video/'));
    
    for (const file of files) {
      if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
        showError(`File "${file.name}" exceeds the ${FILE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
        continue;
      }

      const isImage = FILE_LIMITS.SUPPORTED_IMAGE_FORMATS.includes(file.type);
      const isVideo = FILE_LIMITS.SUPPORTED_VIDEO_FORMATS.includes(file.type);
      
      if (!isImage && !isVideo) {
        showError(`File "${file.name}" has an unsupported format.`);
        continue;
      }

      if (isVideo) {
        // Create a video element to check its duration
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        
        videoElement.onloadedmetadata = () => {
          // Check if the video duration exceeds 30 seconds
          if (videoElement.duration > 30) {
            showError(`Video "${file.name}" exceeds the 30-second limit.`);
            return; // Don't proceed with adding the file if the duration is more than 30s
          }
          
          // Check for other conditions (one video or up to 3 images)
          if (hasVideo || media.length > 0) {
            showError("You can only upload one video OR up to 3 images.");
            return;
          }

          // If the file passes the checks, add it to the media array
          setMedia((prevMedia) => [...prevMedia, file]);
          
          const preview = {
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name,
            size: formatFileSize(file.size)
          };

          setMediaPreviews((prevPreviews) => [...prevPreviews, preview]);
        };

        videoElement.onerror = () => {
          showError(`Unable to read video file "${file.name}".`);
        };
      }

      if (isImage) {
        if (hasVideo) {
          showError("You can only upload one video OR up to 3 images.");
          continue;
        }
        
        if (media.length >= FILE_LIMITS.MAX_IMAGES_PER_POST) {
          showError(`You can only upload ${FILE_LIMITS.MAX_IMAGES_PER_POST} images maximum.`);
          continue;
        }

        setMedia((prevMedia) => [...prevMedia, file]);
        
        const preview = {
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
          size: formatFileSize(file.size)
        };
        
        setMediaPreviews((prevPreviews) => [...prevPreviews, preview]);
      }
    }
  };

  const handleMediaChange = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const titleError = validateField('title', title);
    const descriptionError = validateField('description', description);
    const ingredientsError = validateField('ingredients', ingredients);
    const recipeError = validateField('recipe', recipe);
    
    if (titleError || descriptionError || ingredientsError || recipeError) {
      setErrors({
        ...errors,
        title: titleError,
        description: descriptionError,
        ingredients: ingredientsError,
        recipe: recipeError
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    formData.append('ingredients', ingredients);
    formData.append('recipe', recipe);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      await postService.createPost(formData);
      showSuccess('Post created successfully!');
      navigate(ROUTES.MY_POSTS);
    } catch (error) {
      console.error(error);
      showError('Failed to create post: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="auth-container">
      <NavBar />
      <div className="content-wrapper">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-heading">Create New Post</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-sections two-column-layout">
              <div className="form-column">
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  <div className="form-group">
                    <label className="form-label">Title <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <input
                        className={`form-input ${errors.title ? 'error' : ''}`}
                        type="text"
                        name="title"
                        placeholder="Enter a descriptive title"
                        value={title}
                        onChange={handleInputChange}
                        maxLength="100"
                        required
                      />
                      <span className="char-count">{charCount.title}/100</span>
                    </div>
                    {errors.title && <span className="error-message">{errors.title}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select
                      className={`form-input ${errors.category ? 'error' : ''}`}
                      name="category"
                      value={categories}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {Object.values(POST_CATEGORIES).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-section">
                  <h3 className="section-title">Content</h3>
                  <div className="form-group">
                    <label className="form-label">Description <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <textarea
                        className={`form-input ${errors.description ? 'error' : ''}`}
                        name="description"
                        placeholder="Provide a detailed description of your post"
                        value={description}
                        onChange={handleInputChange}
                        maxLength="500"
                        required
                        rows={4}
                      />
                      <span className="char-count">{charCount.description}/500</span>
                    </div>
                    {errors.description && <span className="error-message">{errors.description}</span>}
                  </div>
                </div>
              </div>

              <div className="form-column full-width">
                <div className="form-section">
                  <h3 className="section-title">Food Recipe Details</h3>
                  <div className="form-group">
                    <label className="form-label">Ingredients <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <textarea
                        className={`form-input ${errors.ingredients ? 'error' : ''}`}
                        name="ingredients"
                        placeholder="List all ingredients (e.g. 1 cup flour, 2 eggs, etc.)"
                        value={ingredients}
                        onChange={handleInputChange}
                        maxLength="1000"
                        required
                        rows={4}
                      />
                      <span className="char-count">{charCount.ingredients}/1000</span>
                    </div>
                    {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipe Steps <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <textarea
                        className={`form-input ${errors.recipe ? 'error' : ''}`}
                        name="recipe"
                        placeholder="Explain step by step how to prepare the recipe"
                        value={recipe}
                        onChange={handleInputChange}
                        maxLength="2000"
                        required
                        rows={6}
                      />
                      <span className="char-count">{charCount.recipe}/2000</span>
                    </div>
                    {errors.recipe && <span className="error-message">{errors.recipe}</span>}
                  </div>
                </div>
              </div>

              <div className="form-column full-width">
                <div className="form-section">
                  <h3 className="section-title">Media</h3>
                  <p className="section-description">Add images or video to enhance your post</p>
                  <div className="form-group">
                    <label className="form-label">Media</label>
                    <div className="media-preview-container">
                      {mediaPreviews.length > 0 && (
                        <div className="media-controls">
                          <button type="button" className="clear-all-btn" onClick={clearAllFiles}>
                            Clear All Files
                          </button>
                          <span>{mediaPreviews.length} file(s) selected</span>
                        </div>
                      )}
                      <div className="media-preview-grid">
                        {mediaPreviews.map((preview, index) => (
                          <div key={index} className="preview-item">
                            {preview.type.startsWith('video/') ? (
                              <div className="preview-content">
                                <video controls className="media-item">
                                  <source src={preview.url} type={preview.type} />
                                </video>
                                <div className="media-info">
                                  <span>{preview.name} ({preview.size})</span>
                                  <button 
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeFile(index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="preview-content">
                                <img className="media-item" src={preview.url} alt={preview.name} />
                                <div className="media-info">
                                  <span>{preview.name} ({preview.size})</span>
                                  <button 
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeFile(index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`drop-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isLoading && uploadProgress > 0 && (
                        <div className="upload-progress">
                          <div 
                            className="progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                          />
                          <span>{uploadProgress}%</span>
                        </div>
                      )}
                      <div className="drop-zone-content">
                        {isLoading ? (
                          <div className="loading-spinner">Processing...</div>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or</p>
                            <input
                              type="file"
                              id="fileInput"
                              className="file-input"
                              accept="image/jpeg,image/png,image/jpg,video/mp4"
                              multiple
                              onChange={handleMediaChange}
                              disabled={isLoading}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="fileInput" className="browse-button">
                              Browse Files
                            </label>
                          </>
                        )}
                      </div>
                      <div className="file-limits">
                        <p>Maximum file size: {FILE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                        <p>Supported formats: JPG, PNG, MP4</p>
                        <p>Limits: {FILE_LIMITS.MAX_IMAGES_PER_POST} images or 1 video (max {FILE_LIMITS.MAX_VIDEO_DURATION} seconds)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading || Object.keys(errors).some(key => errors[key])}
              >
                {isLoading ? <LoadingSpinner size="small" text="Creating Post..." /> : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Original component now wraps the content with ToastProvider
function AddNewPost() {
  return <AddNewPostWithToast />;
}

export default AddNewPost;
