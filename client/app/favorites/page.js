'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, FolderSearch, RefreshCw, ArrowLeft } from 'lucide-react';
import { getFavorites, removeFavorite } from '@/lib/api';
import RepoCard from '@/components/RepoCard';
import AlertBanner from '@/components/AlertBanner';
import { RepoCardSkeleton } from '@/components/LoadingSkeleton';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchSavedFavorites = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await getFavorites();
      if (res.success && Array.isArray(res.data)) {
        setFavorites(res.data);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to fetch saved repositories from MongoDB.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedFavorites();
  }, [fetchSavedFavorites]);

  const handleRemoveFavorite = async (repo) => {
    const mongoId = repo._id;
    setRemovingId(repo.githubId);
    setFeedback(null);

    try {
      await removeFavorite(mongoId || repo.githubId);
      setFavorites((prev) => prev.filter((item) => item.githubId !== repo.githubId));
      setFeedback({
        type: 'info',
        message: `Removed "${repo.fullName || repo.name}" from your saved repositories.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Could not remove repository.',
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-2 group transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Saved Repositories
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Repositories saved to your personal MongoDB database collection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSavedFavorites}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold">
            {favorites.length} {favorites.length === 1 ? 'Repository' : 'Repositories'} Saved
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Grid of Saved Repositories */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((repo) => (
            <RepoCard
              key={repo.githubId || repo._id}
              repo={repo}
              isFavorite={true}
              onToggleFavorite={handleRemoveFavorite}
              isSaving={removingId === repo.githubId}
              isSavedPage={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 max-w-lg mx-auto">
          <FolderSearch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">No saved repositories yet</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            You haven't bookmarked any repositories yet. Search for repositories and click the bookmark
            icon to save them here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            Explore Repositories
          </Link>
        </div>
      )}
    </div>
  );
}
