'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, SlidersHorizontal, RefreshCw, FolderSearch } from 'lucide-react';
import { searchRepositories, getFavorites, addFavorite, removeFavorite } from '@/lib/api';
import RepoCard from '@/components/RepoCard';
import Pagination from '@/components/Pagination';
import AlertBanner from '@/components/AlertBanner';
import { RepoCardSkeleton } from '@/components/LoadingSkeleton';

const POPULAR_TOPICS = ['react', 'nextjs', 'nodejs', 'tailwindcss', 'express', 'typescript'];

export default function SearchPage() {
  const [query, setQuery] = useState('react');
  const [searchInput, setSearchInput] = useState('react');
  const [sort, setSort] = useState(''); // '' (default), 'stars', 'updated'
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [results, setResults] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState({}); // { [githubId]: mongoId }
  const [errorState, setErrorState] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Load saved favorites from MongoDB to identify existing saved cards
  const loadFavorites = useCallback(async () => {
    try {
      const res = await getFavorites();
      if (res.success && Array.isArray(res.data)) {
        const map = {};
        res.data.forEach((fav) => {
          map[fav.githubId] = fav._id;
        });
        setFavoriteMap(map);
      }
    } catch (err) {
      console.warn('Could not load favorites for star states:', err.message);
    }
  }, []);

  // Fetch search results from Backend (which proxies GitHub REST API & handles 5m cache)
  const handleSearch = useCallback(
    async (targetQuery = query, targetPage = page, targetSort = sort) => {
      if (!targetQuery.trim()) {
        setResults({ total_count: 0, items: [] });
        return;
      }

      setLoading(true);
      setErrorState(null);

      try {
        const data = await searchRepositories({
          q: targetQuery.trim(),
          page: targetPage,
          per_page: perPage,
          sort: targetSort,
          order: 'desc',
        });

        setResults(data);
        setIsCached(Boolean(data.cached));
      } catch (err) {
        setResults(null);
        setErrorState({
          type: err.isRateLimit ? 'rateLimit' : 'error',
          message: err.message || 'Failed to search repositories.',
          details: err.rateLimitReset
            ? `Limit reset time: ${new Date(Number(err.rateLimitReset) * 1000).toLocaleTimeString()}`
            : null,
        });
      } finally {
        setLoading(false);
      }
    },
    [query, page, sort, perPage]
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    handleSearch(query, page, sort);
  }, [query, page, sort, handleSearch]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setPage(1);
    setQuery(searchInput.trim());
  };

  const handleTopicClick = (topic) => {
    setSearchInput(topic);
    setPage(1);
    setQuery(topic);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleToggleFavorite = async (repo) => {
    const githubId = repo.id || repo.githubId;
    const existingMongoId = favoriteMap[githubId];

    setSavingId(githubId);
    setFeedbackMessage(null);

    try {
      if (existingMongoId) {
        // Remove from Favorites
        await removeFavorite(existingMongoId);
        setFavoriteMap((prev) => {
          const next = { ...prev };
          delete next[githubId];
          return next;
        });
        setFeedbackMessage({
          type: 'info',
          message: `Removed "${repo.name || repo.full_name}" from favorites.`,
        });
      } else {
        // Save to Favorites in MongoDB
        const payload = {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: {
            login: repo.owner.login,
            avatarUrl: repo.owner.avatar_url,
            htmlUrl: repo.owner.html_url,
          },
          description: repo.description,
          htmlUrl: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language || 'Unknown',
          openIssues: repo.open_issues_count || 0,
        };

        const res = await addFavorite(payload);
        setFavoriteMap((prev) => ({
          ...prev,
          [githubId]: res.data?._id || true,
        }));
        setFeedbackMessage({
          type: 'info',
          message: `Saved "${repo.full_name}" to your favorites!`,
        });
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        message: err.message || 'Could not update favorites.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Explore & Analyze{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            GitHub Repositories
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Search millions of open-source projects, analyze repository statistics, view recent
          commits & contributors, and bookmark your favorites.
        </p>

        {/* Quick Topic Chips */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Popular:
          </span>
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicClick(topic)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                query.toLowerCase() === topic
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              #{topic}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={onSearchSubmit} className="max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search repositories (e.g. express, next.js, kubernetes)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm sm:text-base shadow-xl shadow-black/30 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Sorting & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            Results for <span className="text-white font-semibold">"{query}"</span>
          </span>
          {results && results.total_count !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {results.total_count.toLocaleString()} repos
            </span>
          )}
          {isCached && (
            <span
              className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1"
              title="Backend cached this search response for 5 minutes"
            >
              ⚡ 5m Cache
            </span>
          )}
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Best Match (Default)</option>
            <option value="stars">Most Stars</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Global Alerts / Feedback */}
      {errorState && (
        <AlertBanner
          type={errorState.type}
          message={errorState.message}
          details={errorState.details}
          onClose={() => setErrorState(null)}
        />
      )}

      {feedbackMessage && (
        <AlertBanner
          type={feedbackMessage.type}
          message={feedbackMessage.message}
          onClose={() => setFeedbackMessage(null)}
        />
      )}

      {/* Results Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      ) : results && results.items && results.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.items.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                isFavorite={Boolean(favoriteMap[repo.id])}
                onToggleFavorite={handleToggleFavorite}
                isSaving={savingId === repo.id}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalCount={results.total_count || 0}
            perPage={perPage}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
            isLoading={loading}
          />
        </>
      ) : (
        !errorState && (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40">
            <FolderSearch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200">No repositories found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
              We couldn't find any public repositories matching "{query}". Try checking your
              spelling or search for different keywords.
            </p>
          </div>
        )
      )}
    </div>
  );
}
