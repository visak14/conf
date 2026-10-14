const { getGithubClient, handleGithubError } = require('../services/githubService');
const searchCache = require('../config/cache');

// @desc    Search public GitHub repositories (Cached for 5 minutes)
// @route   GET /api/github/search
// @access  Public
const searchRepositories = async (req, res, next) => {
  try {
    const { q, page = 1, per_page = 10, sort, order = 'desc' } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        total_count: 0,
        items: [],
        page: Number(page),
        per_page: Number(per_page),
        cached: false,
        message: 'No search query provided',
      });
    }

    const trimmedQuery = q.trim();
    // Cache Key combining query, pagination, and sorting
    const cacheKey = `search:${trimmedQuery.toLowerCase()}:p${page}:pp${per_page}:s${sort || 'default'}:o${order}`;

    // 1. Check in-memory Cache
    const cachedData = searchCache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        cached: true,
      });
    }

    // 2. Fetch from GitHub REST API
    const client = getGithubClient();
    const params = {
      q: trimmedQuery,
      page: Number(page),
      per_page: Number(per_page),
      order,
    };

    if (sort && (sort === 'stars' || sort === 'updated')) {
      params.sort = sort;
    }

    const response = await client.get('/search/repositories', { params });

    const result = {
      total_count: response.data.total_count,
      incomplete_results: response.data.incomplete_results,
      page: Number(page),
      per_page: Number(per_page),
      items: response.data.items.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
        },
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
      })),
    };

    // 3. Save into Cache for 5 minutes (300 seconds)
    searchCache.set(cacheKey, result);

    return res.status(200).json({
      ...result,
      cached: false,
    });
  } catch (error) {
    const parsedError = handleGithubError(error);
    return next(parsedError);
  }
};

// @desc    Get detailed repository information
// @route   GET /api/github/repos/:owner/:repo
// @access  Public
const getRepositoryDetails = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      return res.status(400).json({ success: false, message: 'Owner and repository name are required.' });
    }

    const client = getGithubClient();
    const response = await client.get(`/repos/${owner}/${repo}`);
    const data = response.data;

    return res.status(200).json({
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      owner: {
        login: data.owner.login,
        avatar_url: data.owner.avatar_url,
        html_url: data.owner.html_url,
      },
      description: data.description,
      html_url: data.html_url,
      homepage: data.homepage,
      stargazers_count: data.stargazers_count,
      watchers_count: data.watchers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count,
      language: data.language,
      default_branch: data.default_branch,
      topics: data.topics || [],
      license: data.license ? data.license.name : null,
      created_at: data.created_at,
      updated_at: data.updated_at,
      pushed_at: data.pushed_at,
    });
  } catch (error) {
    const parsedError = handleGithubError(error);
    return next(parsedError);
  }
};

// @desc    Get latest 5 commits for a repository
// @route   GET /api/github/repos/:owner/:repo/commits
// @access  Public
const getRepositoryCommits = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const client = getGithubClient();

    const response = await client.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: 5 },
    });

    const commits = response.data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      html_url: c.html_url,
      author: {
        name: c.commit.author?.name || 'Unknown',
        email: c.commit.author?.email || '',
        date: c.commit.author?.date || null,
        login: c.author?.login || null,
        avatar_url: c.author?.avatar_url || null,
      },
    }));

    return res.status(200).json(commits);
  } catch (error) {
    const parsedError = handleGithubError(error);
    return next(parsedError);
  }
};

// @desc    Get top 5 contributors for a repository
// @route   GET /api/github/repos/:owner/:repo/contributors
// @access  Public
const getRepositoryContributors = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const client = getGithubClient();

    const response = await client.get(`/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 5 },
    });

    // In some edge cases (e.g. empty repos), contributors might be 204 No Content or not an array
    if (!Array.isArray(response.data)) {
      return res.status(200).json([]);
    }

    const contributors = response.data.map((user) => ({
      id: user.id,
      login: user.login,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      contributions: user.contributions,
    }));

    return res.status(200).json(contributors);
  } catch (error) {
    const parsedError = handleGithubError(error);
    return next(parsedError);
  }
};

module.exports = {
  searchRepositories,
  getRepositoryDetails,
  getRepositoryCommits,
  getRepositoryContributors,
};
