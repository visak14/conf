const Favorite = require('../models/Favorite');

// @desc    Get all saved favourite repositories
// @route   GET /api/favorites
// @access  Public
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Save a repository to favourites (Prevent duplicate entries)
// @route   POST /api/favorites
// @access  Public
const addFavorite = async (req, res, next) => {
  try {
    const {
      githubId,
      name,
      fullName,
      owner,
      description,
      htmlUrl,
      stars,
      forks,
      language,
      openIssues,
    } = req.body;

    if (!githubId || !name || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: githubId, name, and fullName are required.',
      });
    }

    // Check for duplicate saved repository
    const existing = await Favorite.findOne({ githubId: Number(githubId) });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Repository "${fullName}" is already saved in your favorites.`,
        data: existing,
      });
    }

    // Create and save new favorite
    const favorite = await Favorite.create({
      githubId: Number(githubId),
      name,
      fullName,
      owner: {
        login: owner?.login || 'unknown',
        avatarUrl: owner?.avatarUrl || owner?.avatar_url || '',
        htmlUrl: owner?.htmlUrl || owner?.html_url || '',
      },
      description: description || '',
      htmlUrl: htmlUrl || '',
      stars: Number(stars) || 0,
      forks: Number(forks) || 0,
      language: language || 'Unknown',
      openIssues: Number(openIssues) || 0,
    });

    return res.status(201).json({
      success: true,
      message: `Repository "${fullName}" saved to favorites successfully.`,
      data: favorite,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000) as safety check
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This repository is already in your favorites.',
      });
    }
    return next(error);
  }
};

// @desc    Remove repository from favourites (by MongoDB ID or githubId)
// @route   DELETE /api/favorites/:id
// @access  Public
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    let deletedDoc = null;

    // Check if parameter is a valid numeric GitHub ID or MongoDB ObjectId
    if (!isNaN(id)) {
      deletedDoc = await Favorite.findOneAndDelete({ githubId: Number(id) });
    } else {
      deletedDoc = await Favorite.findByIdAndDelete(id);
    }

    if (!deletedDoc) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found in favorites.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Repository "${deletedDoc.fullName}" removed from favorites.`,
      data: deletedDoc,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Check if a repository is already saved by githubId
// @route   GET /api/favorites/check/:githubId
// @access  Public
const checkIsFavorite = async (req, res, next) => {
  try {
    const { githubId } = req.params;
    const favorite = await Favorite.findOne({ githubId: Number(githubId) });
    return res.status(200).json({
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite._id : null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorite,
};
