// A utility file to hold common user-related functions

export const fetchUserDetails = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};
