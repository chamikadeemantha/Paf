import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth endpoints
export const authService = {
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = new Error('Login failed');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = new Error('Registration failed');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  verifyEmail: async (email, code) => {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    
    if (!response.ok) {
      const error = new Error('Verification failed');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  uploadProfilePicture: async (userId, formData) => {
    const response = await fetch(`${BASE_URL}/user/${userId}/uploadProfilePicture`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const error = new Error('Upload failed');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  getUserDetails: async (userId) => {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    
    if (!response.ok) {
      const error = new Error('Failed to fetch user details');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  deleteUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = new Error('Failed to delete user');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  updateUser: async (userId, userData) => {
    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = new Error('Failed to update user');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  }
};

// Post endpoints
export const postService = {
  getAllPosts: async () => {
    const response = await fetch(`${BASE_URL}/posts`);
    
    if (!response.ok) {
      const error = new Error('Failed to fetch posts');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  getPostById: async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    
    if (!response.ok) {
      const error = new Error('Failed to fetch post');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  createPost: async (formData) => {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = new Error('Failed to create post');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  updatePost: async (id, formData) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const error = new Error('Failed to update post');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  deletePost: async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = new Error('Failed to delete post');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  likePost: async (id, userID) => {
    const response = await fetch(`${BASE_URL}/posts/${id}/like?userID=${userID}`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      const error = new Error('Failed to like post');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  addComment: async (postId, data) => {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = new Error('Failed to add comment');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  updateComment: async (postId, commentId, data) => {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comment/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = new Error('Failed to update comment');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  deleteComment: async (postId, commentId, userID) => {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comment/${commentId}?userID=${userID}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = new Error('Failed to delete comment');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  }
};

// Social endpoints
export const socialService = {
  followUser: async (userID, followUserID) => {
    const response = await fetch(`${BASE_URL}/user/${userID}/follow`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followUserID }),
    });
    
    if (!response.ok) {
      const error = new Error('Failed to follow user');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  unfollowUser: async (userID, unfollowUserID) => {
    const response = await fetch(`${BASE_URL}/user/${userID}/unfollow`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unfollowUserID }),
    });
    
    if (!response.ok) {
      const error = new Error('Failed to unfollow user');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  },
  
  getFollowedUsers: async (userID) => {
    const response = await fetch(`${BASE_URL}/user/${userID}/followedUsers`);
    
    if (!response.ok) {
      const error = new Error('Failed to fetch followed users');
      error.response = response;
      throw error;
    }
    
    return { data: await response.json() };
  }
};

// Utility function for handling YouTube URLs
export const getEmbedURL = (url) => {
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

export default api;
