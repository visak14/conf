const express = require('express');
const router = express.Router();
const {
  searchRepositories,
  getRepositoryDetails,
  getRepositoryCommits,
  getRepositoryContributors,
} = require('../controllers/githubController');

// Search repositories
router.get('/search', searchRepositories);

// Repository details
router.get('/repos/:owner/:repo', getRepositoryDetails);

// Repository commits (latest 5)
router.get('/repos/:owner/:repo/commits', getRepositoryCommits);

// Repository contributors (top 5)
router.get('/repos/:owner/:repo/contributors', getRepositoryContributors);

module.exports = router;
