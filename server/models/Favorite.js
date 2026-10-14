const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: [true, 'GitHub Repository ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      login: { type: String, required: true },
      avatarUrl: { type: String, default: '' },
      htmlUrl: { type: String, default: '' },
    },
    description: {
      type: String,
      default: '',
    },
    htmlUrl: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'Unknown',
    },
    openIssues: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Favorite', FavoriteSchema);
