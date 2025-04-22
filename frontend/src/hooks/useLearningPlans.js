import { useState, useEffect } from 'react';

export function useLearningPlans(filterByUser = false) {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/learningPlan');
        if (!response.ok) {
          throw new Error('Failed to fetch learning plans');
        }
        
        let plansData = await response.json();
        
        if (filterByUser && userId) {
          plansData = plansData.filter(plan => plan.postOwnerID === userId);
        }
        
        setPlans(plansData);
        setFilteredPlans(plansData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching learning plans:', err);
        setError('Failed to load learning plans. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlans();
  }, [filterByUser, userId]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPlans(plans);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = plans.filter(
      (plan) =>
        plan.title?.toLowerCase().includes(lowercaseQuery) ||
        plan.description?.toLowerCase().includes(lowercaseQuery) ||
        (plan.category && plan.category.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredPlans(filtered);
  };

  const deletePlan = async (planId) => {
    try {
      const response = await fetch(`http://localhost:8080/learningPlan/${planId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete learning plan');
      }
      setPlans(plans.filter(plan => plan.id !== planId));
      setFilteredPlans(filteredPlans.filter(plan => plan.id !== planId));
      return true;
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      setError('Failed to delete learning plan. Please try again.');
      return false;
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

  return {
    plans,
    filteredPlans,
    loading,
    error,
    searchQuery,
    handleSearch,
    deletePlan,
    getEmbedURL,
    setPlans,
    setFilteredPlans
  };
}
