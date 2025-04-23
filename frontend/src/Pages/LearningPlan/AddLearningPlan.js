import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css';
import '../PostManagement/AddNewPost.css';
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.length < 5 ? 'Title must be at least 5 characters' : '';
      case 'description':
        return value.length < 10 ? 'Description must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCharCount(prev => ({
      ...prev,
      [name]: value.length
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

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
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
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
    if (files.length > 0) {
      handleImageChange({ target: { files: [files[0]] } });
    }
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTemplateSelect = (id) => {
    setTemplateID(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate,
        endDate,
        category
      };

      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  return (
    <div className="auth-container">
      <NavBar />
      <div className="content-wrapper">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-heading">Create Learning Plan</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-column full-width">
              <div className="form-section">
                <h3 className="section-title">Select Template</h3>
                <p className="section-description">Click on a template to select it for your learning plan</p>
                <div className="template-preview-container">
                  <div 
                    className={`template template-1 ${templateID === '1' ? 'selected' : ''}`} 
                    onClick={() => handleTemplateSelect('1')}
                  >
                    <div className="template-overlay">
                      <span className="template-select-text">
                        {templateID === '1' ? 'Selected' : 'Click to Select'}
                      </span>
                    </div>
                    <p className='template_id_one'>template 1</p>
                    <p className='template_title'>{title || "Title Preview"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                    <p className='template_description'>{category}</p>
                    <hr></hr>
                    <p className='template_description'>{description || "Description Preview"}</p>
                    <div className="tags_preview">
                      {tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      ))}
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
                    {contentURL && (
                      <iframe
                        src={getEmbedURL(contentURL)}
                        title="Content Preview"
                        className="iframe_preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>

                  <div 
                    className={`template template-2 ${templateID === '2' ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect('2')}
                  >
                    <div className="template-overlay">
                      <span className="template-select-text">
                        {templateID === '2' ? 'Selected' : 'Click to Select'}
                      </span>
                    </div>
                    <p className='template_id_one'>template 2</p>
                    <p className='template_title'>{title || "Title Preview"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                    <p className='template_description'>{category}</p>
                    <hr></hr>
                    <p className='template_description'>{description || "Description Preview"}</p>
                    <div className="tags_preview">
                      {tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      ))}
                    </div>
                    <div className='preview_part'>
                      <div className='preview_part_sub'>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
                      </div>
                      <div className='preview_part_sub'>
                        {contentURL && (
                          <iframe
                            src={getEmbedURL(contentURL)}
                            title="Content Preview"
                            className="iframe_preview_new"
                            frameBorder="0"
                            allowFullScreen
                          ></iframe>
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`template template-3 ${templateID === '3' ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect('3')}
                  >
                    <div className="template-overlay">
                      <span className="template-select-text">
                        {templateID === '3' ? 'Selected' : 'Click to Select'}
                      </span>
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
                    {contentURL && (
                      <iframe
                        src={getEmbedURL(contentURL)}
                        title="Content Preview"
                        className="iframe_preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    )}
                    <p className='template_title'>{title || "Title Preview"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                    <p className='template_description'>{category}</p>
                    <hr></hr>
                    <p className='template_description'>{description || "Description Preview"}</p>
                    <div className="tags_preview">
                      {tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                      <option value="Street Food">Street Food</option>
                      <option value="One-Pot Meals">One-Pot Meals</option>
                      <option value="Meal Prep">Meal Prep / Batch Cooking</option>
                      <option value="Budget-Friendly">Budget-Friendly</option>
                      <option value="Kid-Friendly">Kid-Friendly</option>
                      <option value="Healthy Recipes">Healthy Recipes</option>
                      <option value="Comfort Food">Comfort Food</option>
                      <option value="Traditional">Traditional / Cultural Recipes</option>
                      <option value="Fusion">Fusion Recipes</option>
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
                        placeholder="Provide a detailed description"
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

                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="input-wrapper date-input-wrapper">
                        <input
                          className="form-input"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="input-wrapper date-input-wrapper">
                        <input
                          className="form-input"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <div className="input-wrapper">
                      <input
                        className="form-input"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tags"
                      />
                      <button type="button" className="browse-button" onClick={handleAddTag}>
                        Add Tag
                      </button>
                    </div>
                    <div className="tags_preview">
                      {tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-column full-width">
                <div className="form-section" >
                  <h3 className="section-title">Media</h3>
                  <p className="section-description" >Add an image or video URL to enhance your plan</p>
                  
                  <div className="form-group">
                    <div className="media-controls">
                      <div className="media-buttons">
                        {!imagePreview ? (
                          <button 
                            type="button" 
                            className={`media-btn ${showImageUploadInput ? 'active' : ''}`}
                            onClick={() => {
                              setShowImageUploadInput(!showImageUploadInput);
                              setShowContentURLInput(false);
                            }}
                          >
                            <FaImage /> Add Image
                          </button>
                        ) : (
                          <button 
                            type="button"
                            className="media-btn remove"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                              setShowImageUploadInput(false);
                            }}
                          >
                            <FaImage /> Remove Image
                          </button>
                        )}

                        {!contentURL ? (
                          <button 
                            type="button" 
                            className={`media-btn ${showContentURLInput ? 'active' : ''}`}
                            onClick={() => {
                              setShowContentURLInput(!showContentURLInput);
                              setShowImageUploadInput(false);
                            }}
                          >
                            <FaVideo /> Add Video
                          </button>
                        ) : (
                          <button 
                            type="button"
                            className="media-btn remove"
                            onClick={() => {
                              setContentURL('');
                              setShowContentURLInput(false);
                            }}
                          >
                            <FaVideo /> Remove Video
                          </button>
                        )}
                      </div>
                    </div>

                    {showImageUploadInput && (
                      <div 
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="fileInput"
                          className="file-input"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="fileInput" className="drop-zone-content" >
                          <FaImage size={24} />
                          <p >Drag and drop an image or click to browse</p>
                          <span >Maximum file size: 10MB</span>
                        </label>
                      </div>
                    )}

                    {showContentURLInput && (
                      <div className="input-wrapper">
                        <input
                          className="form-input"
                          type="url"
                          value={contentURL}
                          onChange={(e) => setContentURL(e.target.value)}
                          placeholder="Enter YouTube video URL"
                        />
                      </div>
                    )}

                    <div className="media-preview-grid">
                      {imagePreview && (
                        <div className="preview-item">
                          <img src={imagePreview} alt="Preview" className="media-item" />
                          <button 
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      
                      {contentURL && (
                        <div className="preview-item">
                          <iframe
                            src={getEmbedURL(contentURL)}
                            title="Video Preview"
                            className="media-item"
                            frameBorder="0"
                            allowFullScreen
                          />
                          <button 
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              setContentURL('');
                              setShowContentURLInput(false);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key])}
              >
                {isSubmitting ? 'Creating Plan...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;