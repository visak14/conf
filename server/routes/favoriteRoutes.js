const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorite,
} = require('../controllers/favoriteController');

// List all favorites and save new favorite
router.route('/').get(getFavorites).post(addFavorite);

// Check if a repository is already saved
router.get('/check/:githubId', checkIsFavorite);

// Delete favorite repository by MongoDB ID or githubId
router.delete('/:id', removeFavorite);

module.exports = router;
