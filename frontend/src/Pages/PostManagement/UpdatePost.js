import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import LoadingSpinner from '../../Components/common/Components/LoadingSpinner';
import { ToastProvider, useToast } from '../../Components/common/Components/ToastContainer';
import { POST_CATEGORIES, FILE_LIMITS, ROUTES } from '../../constants';
import '../PostManagement/AddNewPost.css';
import '../../styles/theme.css';

// Create a wrapper component that provides ToastContext
const UpdatePostWithToast = () => {
  return (
    <ToastProvider>
      <UpdatePostContent />
    </ToastProvider>
  );
};

// The main component content
function UpdatePostContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState({
    title: 0,
    description: 0,
    ingredients: 0,
    recipe: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showSuccess, showError } = useToast();
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setDescription(post.description || '');
        setCategory(post.category || '');
        setIngredients(post.ingredients || '');
        setRecipe(post.recipe || '');
        setExistingMedia(post.media || []);
        setCharCount({
          title: (post.title || '').length,
          description: (post.description || '').length,
          ingredients: (post.ingredients || '').length,
          recipe: (post.recipe || '').length
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        showError('Failed to fetch post details.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, showError]);

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
        setCategory(value);
        break;
      case 'ingredients':
        setIngredients(value);
        break;
      case 'recipe':
        setRecipe(value);
        break;
    }
  };

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl));
      showSuccess('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      showError('Failed to delete media file.');
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > FILE_LIMITS.MAX_VIDEO_DURATION) {
          reject(`Video ${file.name} exceeds the maximum duration of ${FILE_LIMITS.MAX_VIDEO_DURATION} seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
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
    setNewMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNewFiles = () => {
    setNewMedia([]);
    setNewMediaPreviews([]);
  };

  const handleFiles = async (files) => {
    const hasVideo = [...existingMedia, ...newMedia].some((file) => 
      typeof file === 'string' ? file.endsWith('.mp4') : file.type.startsWith('video/')
    );
    
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

      const existingImages = existingMedia.filter(url => !url.endsWith('.mp4')).length;
      const newImages = newMedia.filter(file => file.type && file.type.startsWith('image/')).length;
      
      if (isVideo) {
        if (hasVideo || existingImages + newImages > 0) {
          showError("You can only upload one video OR up to 3 images.");
          continue;
        }
        
        try {
          await validateVideoDuration(file);
        } catch (error) {
          showError(error);
          continue;
        }
      }

      if (isImage) {
        if (hasVideo) {
          showError("You can only upload one video OR up to 3 images.");
          continue;
        }
        
        if (existingImages + newImages >= FILE_LIMITS.MAX_IMAGES_PER_POST) {
          showError(`You can only upload ${FILE_LIMITS.MAX_IMAGES_PER_POST} images maximum.`);
          continue;
        }
      }

      setNewMedia((prevMedia) => [...prevMedia, file]);
      
      const preview = {
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: formatFileSize(file.size)
      };
      
      setNewMediaPreviews((prevPreviews) => [...prevPreviews, preview]);
    }
  };

  const handleNewMediaChange = (e) => {
    const files = Array.from(e.target.files);
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
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('ingredients', ingredients);
    formData.append('recipe', recipe);
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      showSuccess('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      showError('Failed to update post: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <NavBar />
        <div className="content-wrapper">
          <div className="post-card">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <NavBar />
      <div className="content-wrapper">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-heading">Update Post</h1>
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
                      value={category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {Object.values(POST_CATEGORIES).map(categoryOption => (
                        <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
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
                  <p className="section-description">Update images or video for your post</p>
                  <div className="form-group">
                    <label className="form-label">Current Media</label>
                    {existingMedia.length > 0 && (
                      <div className="media-preview-container">
                        <div className="media-preview-grid">
                          {existingMedia.map((mediaUrl, index) => (
                            <div key={index} className="preview-item">
                              <div className="preview-content">
                                {mediaUrl.endsWith('.mp4') ? (
                                  <video controls className="media-item">
                                    <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                                  </video>
                                ) : (
                                  <img className="media-item" src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                                )}
                                <button 
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => handleDeleteMedia(mediaUrl)}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="form-label">New Media</label>
                    <div className="media-preview-container">
                      {newMediaPreviews.length > 0 && (
                        <div className="media-controls">
                          <button type="button" className="clear-all-btn" onClick={clearAllNewFiles}>
                            Clear All Files
                          </button>
                          <span>{newMediaPreviews.length} file(s) selected</span>
                        </div>
                      )}
                      <div className="media-preview-grid">
                        {newMediaPreviews.map((preview, index) => (
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
                      {isLoading && uploadProgress > 0 ? (
                        <div className="upload-progress">
                          <div 
                            className="progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                          />
                          <span>{uploadProgress}%</span>
                        </div>
                      ) : (
                        <div className="drop-zone-content">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <p>Drag and drop files here or</p>
                          <input
                            type="file"
                            id="fileInput"
                            className="file-input"
                            accept="image/jpeg,image/png,image/jpg,video/mp4"
                            multiple
                            onChange={handleNewMediaChange}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="fileInput" className="browse-button">
                            Browse Files
                          </label>
                        </div>
                      )}
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
                {isLoading ? <LoadingSpinner size="small" text="Updating Post..." /> : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Original component now wraps the content with ToastProvider
function UpdatePost() {
  return <UpdatePostWithToast />;
}

export default UpdatePost;
