export const API_BASE_URL = 'http://localhost:8080';

export const POST_CATEGORIES = {
  STREET_FOOD: 'Street Food',
  ONE_POT_MEALS: 'One-Pot Meals',
  MEAL_PREP: 'Meal Prep',
  BUDGET_FRIENDLY: 'Budget-Friendly',
  KID_FRIENDLY: 'Kid-Friendly',
  HEALTHY: 'Healthy Recipes',
  COMFORT: 'Comfort Food',
  TRADITIONAL: 'Traditional',
  FUSION: 'Fusion Recipes'
};

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/jpg'],
  SUPPORTED_VIDEO_FORMATS: ['video/mp4'],
  MAX_VIDEO_DURATION: 30, // seconds
  MAX_IMAGES_PER_POST: 3
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ALL_POSTS: '/allPost',
  MY_POSTS: '/myAllPost',
  ADD_POST: '/addNewPost',
  LEARNING_PLANS: '/allLearningPlan',
  MY_LEARNING_PLANS: '/myLearningPlan',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/userProfile'
};
