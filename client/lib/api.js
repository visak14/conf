import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 12000,
});

// Interceptor to format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    let isRateLimit = false;
    let isNotFound = false;
    let rateLimitReset = null;

    if (error.response) {
      message = error.response.data?.message || message;
      if (error.response.status === 429 || error.response.status === 403) {
        isRateLimit = true;
        rateLimitReset = error.response.data?.rateLimitReset;
      }
      if (error.response.status === 404) {
        isNotFound = true;
      }
    } else if (error.request) {
      message = 'Backend server is unreachable. Please ensure the Node.js backend is running on port 5000.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.isRateLimit = isRateLimit;
    enhancedError.isNotFound = isNotFound;
    enhancedError.rateLimitReset = rateLimitReset;
    return Promise.reject(enhancedError);
  }
);

// 1. Search Repositories
export const searchRepositories = async ({ q, page = 1, per_page = 10, sort = '', order = 'desc' }) => {
  const params = { q, page, per_page, order };
  if (sort) params.sort = sort;
  const res = await apiClient.get('/github/search', { params });
  return res.data;
};

// 2. Repository Details
export const getRepositoryDetails = async (owner, repo) => {
  const res = await apiClient.get(`/github/repos/${owner}/${repo}`);
  return res.data;
};

// 3. Repository Commits (Latest 5)
export const getRepositoryCommits = async (owner, repo) => {
  const res = await apiClient.get(`/github/repos/${owner}/${repo}/commits`);
  return res.data;
};

// 4. Repository Contributors (Top 5)
export const getRepositoryContributors = async (owner, repo) => {
  const res = await apiClient.get(`/github/repos/${owner}/${repo}/contributors`);
  return res.data;
};

// 5. Get Saved Favorites
export const getFavorites = async () => {
  const res = await apiClient.get('/favorites');
  return res.data;
};

// 6. Save to Favorites
export const addFavorite = async (repoData) => {
  const res = await apiClient.post('/favorites', repoData);
  return res.data;
};

// 7. Remove Favorite (by MongoDB _id or githubId)
export const removeFavorite = async (id) => {
  const res = await apiClient.delete(`/favorites/${id}`);
  return res.data;
};

// 8. Check if repo is saved
export const checkIsFavorite = async (githubId) => {
  const res = await apiClient.get(`/favorites/check/${githubId}`);
  return res.data;
};

export default apiClient;
