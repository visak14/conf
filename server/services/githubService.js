const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

const getGithubClient = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Repository-Analytics-Dashboard',
  };

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '') {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN.trim()}`;
  }

  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers,
    timeout: 10000,
  });
};

const handleGithubError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data || {};
    const rateLimitRemaining = error.response.headers['x-ratelimit-remaining'];
    const rateLimitReset = error.response.headers['x-ratelimit-reset'];

    // 1. Rate-limit Handling (403 or 429)
    if (status === 403 || status === 429) {
      const resetTime = rateLimitReset
        ? new Date(Number(rateLimitReset) * 1000).toLocaleTimeString()
        : 'in a few minutes';
      const customErr = new Error(
        `GitHub API rate limit exceeded. Resets at ${resetTime}. Add a GITHUB_TOKEN in backend .env to increase the hourly limit to 5000.`
      );
      customErr.status = 429;
      customErr.rateLimitReset = rateLimitReset;
      customErr.rateLimitRemaining = rateLimitRemaining;
      return customErr;
    }

    // 2. Repository Not Found or Deleted (404)
    if (status === 404) {
      const customErr = new Error('Requested repository was not found or may be deleted/private.');
      customErr.status = 404;
      return customErr;
    }

    // 3. Other GitHub errors (e.g. 422 Unprocessable entity for invalid queries)
    const customErr = new Error(data.message || `GitHub API error with status ${status}`);
    customErr.status = status;
    return customErr;
  } else if (error.request) {
    // 4. GitHub API Unavailable / Network failure
    const customErr = new Error('GitHub API is currently unreachable. Please check your internet connection.');
    customErr.status = 503;
    return customErr;
  } else {
    // 5. Unexpected errors
    const customErr = new Error(error.message || 'An unexpected error occurred while communicating with GitHub.');
    customErr.status = 500;
    return customErr;
  }
};

module.exports = {
  getGithubClient,
  handleGithubError,
};
