import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import '../../styles/theme.css';
import '../PostManagement/AddNewPost.css';

function UpdateMealProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchMealProgress = async () => {
      try {
        const response = await fetch(`http://localhost:8080/mealprogress/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch meal progress');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/mealprogress/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Meal Progress data:', error);
        alert('Error loading meal progress data');
      }
    };
    fetchMealProgress();
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
    setFormData(prev => ({ ...prev, [name]: value }));

    setCharCount(prev => ({
      ...prev,
      [name]: value.length
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
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
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      alert('Please drop an image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/mealprogress/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update meal progress data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/mealprogress/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Meal Progress updated successfully!');
        navigate('/allMealProgress');
      } else {
        throw new Error('Failed to update meal progress');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <NavBar />
      <div className="content-wrapper">
        <div className="post-card">
          <div className="post-header">
            <h1 className="post-heading">Update Meal Progress</h1>
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
                        name="title"
                        placeholder="Enter meal progress title"
                        value={formData.title}
                        onChange={handleInputChange}
                        maxLength="100"
                        required
                        style={{ color: '#FFFFFF' }}
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
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={{ color: '#FFFFFF' }}
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="Street Food">Street Food</option>
                      <option value="One-Pot Meals">One-Pot Meals</option>
                      <option value="Meal Prep / Batch Cooking">Meal Prep / Batch Cooking</option>
                      <option value="Budget-Friendly">Budget-Friendly</option>
                      <option value="Kid-Friendly">Kid-Friendly</option>
                      <option value="Healthy Recipes">Healthy Recipes</option>
                      <option value="Comfort Food">Comfort Food</option>
                      <option value="Traditional / Cultural Recipes">Traditional / Cultural Recipes</option>
                      <option value="Fusion Recipes">Fusion Recipes</option>
                    </select>
                  </div>

                  <div className="form-group">
                  <div className="input-wrapper date-input-wrapper">
                    <label className="form-label">Date <span className="required">*</span></label>
                    <input
                      className="form-input"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      style={{ color: '#FFFFFF' }}
                    />
                  </div></div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-section">
                  <h3 className="section-title">Meal Progress Details</h3>
                  <div className="form-group">
                    <label className="form-label">Meal Progress Details <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <textarea
                        className={`form-input ${errors.description ? 'error' : ''}`}
                        name="description"
                        placeholder="Describe your meal progress"
                        value={formData.description}
                        onChange={handleInputChange}
                        maxLength="500"
                        required
                        rows={4}
                        style={{ color: '#FFFFFF' }}
                      />
                      <span className="char-count">{charCount.description}/500</span>
                    </div>
                    {errors.description && <span className="error-message">{errors.description}</span>}
                  </div>
                </div>
              </div>

              <div className="form-column full-width">
                <div className="form-section">
                  <h3 className="section-title">Meal Progress Image</h3>
                  <p className="section-description">Update the image for your meal progress</p>
                  <div className="form-group">
                    <div 
                      className={`drop-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {previewImage ? (
                        <div className="media-preview-container">
                          <div className="media-preview-grid">
                            <div className="preview-item">
                              <div className="preview-content">
                                <img src={previewImage} alt="Meal Progress Preview" className="media-item" />
                                <button 
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => { 
                                    setSelectedFile(null);
                                    setPreviewImage('');
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="drop-zone-content">
                          <i className="fas fa-cloud-upload-alt" style={{ color: '#FFFFFF' }}></i>
                          <p style={{ color: '#FFFFFF' }}>Drag and drop image here or</p>
                          <input
                            type="file"
                            id="fileInput"
                            className="file-input"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="fileInput" className="browse-button">
                            Browse Files
                          </label>
                        </div>
                      )}
                      <div className="file-limits">
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Maximum file size: 10MB</p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Supported formats: JPG, PNG</p>
                      </div>
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
                disabled={isLoading || Object.keys(errors).some(key => errors[key])}
              >
                {isLoading ? 'Updating Meal Progress...' : 'Update Meal Progress'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateMealProgress;