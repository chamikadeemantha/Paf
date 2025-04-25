import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css';
import '../PostManagement/AddNewPost.css';
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo, FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function UpdateLearningPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

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

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
    if (files.length > 0) {
      handleImageChange({ target: { files: [files[0]] } });
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

    

    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <NavBar />
      <div className="content-wrapper">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-heading">Update Learning Plan</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-column full-width">
              <div className="form-section">
                <h3 className="section-title">Select Template</h3>
                <p className="section-description">Click on a template to select it for your learning plan</p>
                <div className="template-preview-container">
                  <div className={`template template-1 ${templateID === 1 ? 'selected' : ''}`} onClick={() => setTemplateID(1)}>
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
                    {imagePreview ? (
                      <div className="image-preview-achi">
                        <img src={imagePreview} alt="Preview" className="iframe_preview" />
                      </div>
                    ) : existingImage && (
                      <div className="image-preview-achi">
                        <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
                      </div>
                    )}
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
                  <div className={`template template-2 ${templateID === 2 ? 'selected' : ''}`} onClick={() => setTemplateID(2)}>
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
                        {imagePreview ? (
                          <div className="image-preview-achi">
                            <img src={imagePreview} alt="Preview" className="iframe_preview_new" />
                          </div>
                        ) : existingImage && (
                          <div className="image-preview-achi">
                            <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview_new" />
                          </div>
                        )}
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
                  <div className={`template template-3 ${templateID === 3 ? 'selected' : ''}`} onClick={() => setTemplateID(3)}>
                    <p className='template_id_one'>template 3</p>
                    {imagePreview ? (
                      <div className="image-preview-achi">
                        <img src={imagePreview} alt="Preview" className="iframe_preview" />
                      </div>
                    ) : existingImage && (
                      <div className="image-preview-achi">
                        <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
                      </div>
                    )}
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
                  <h3 className="section-title">Content Details</h3>
                  <div className="form-group">
                    <label className="form-label">Description <span className="required">*</span></label>
                    <textarea
                      className={`form-input ${errors.description ? 'error' : ''}`}
                      name="description"
                      value={description}
                      onChange={handleInputChange}
                      maxLength="500"
                      required
                      rows={4}
                    />
                    <span className="char-count">{charCount.description}/500</span>
                    {errors.description && <span className="error-message">{errors.description}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date <span className="required">*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date <span className="required">*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <div className='skil_dis_con'>
                      {tags.map((tag, index) => (
                        <p className='skil_name' key={index}>
                          #{tag} <span onClick={() => handleDeleteTag(index)} className='dlt_bnt'>x</span>
                        </p>
                      ))}
                    </div>
                    <div className='skil_addbtn'>
                      <input
                        className="form-input"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                      />
                      <IoMdAdd onClick={handleAddTag} className="add_s_btn" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-column full-width">
              <div className="form-section">
                <h3 className="section-title">Media</h3>
                <p className="section-description">Add an image or video URL to enhance your plan</p>
                
                <div className="form-group">
                  <div className="media-controls">
                    <div className="media-buttons">
                      {!imagePreview && !existingImage ? (
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
                            setExistingImage('');
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
                      <label htmlFor="fileInput" className="drop-zone-content">
                        <FaImage size={24} />
                        <p>Drag and drop an image or click to browse</p>
                        <span>Maximum file size: 10MB</span>
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
                    {(imagePreview || existingImage) && (
                      <div className="preview-item">
                        <img 
                          src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                          alt="Preview" 
                          className="media-item" 
                        />
                        <button 
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                            setExistingImage('');
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

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key])}
              >
                {isSubmitting ? 'Updating Plan...' : 'Update Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
