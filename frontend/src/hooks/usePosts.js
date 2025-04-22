import { useState, useEffect } from 'react';
import { postService } from '../services/api';

export function usePosts(filterByUser = false) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        let postsData = await response.json();
        
        if (filterByUser && userID) {
          postsData = postsData.filter(post => post.userID === userID);
        }
        
        setPosts(postsData);
        setFilteredPosts(postsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filterByUser, userID]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(lowercaseQuery) ||
        post.description?.toLowerCase().includes(lowercaseQuery) ||
        (post.category && post.category.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredPosts(filtered);
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/posts/${postId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts(posts.filter(post => post.id !== postId));
      setFilteredPosts(filteredPosts.filter(post => post.id !== postId));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
      return false;
    }
  };

  return {
    posts,
    filteredPosts,
    loading,
    error,
    searchQuery,
    handleSearch,
    deletePost,
    setPosts,
    setFilteredPosts
  };
}
