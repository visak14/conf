'use client';

import { useState, useEffect, useCallback, use, Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  GitCommit,
  Users,
  ExternalLink,
  Bookmark,
  Calendar,
  Code2,
  Scale,
  Loader2,
  FolderX,
} from 'lucide-react';
import {
  getRepositoryDetails,
  getRepositoryCommits,
  getRepositoryContributors,
  checkIsFavorite,
  addFavorite,
  removeFavorite,
} from '@/lib/api';
import { formatNumber, formatDate, getLanguageColor } from '@/lib/utils';
import AlertBanner from '@/components/AlertBanner';
import { RepoDetailSkeleton } from '@/components/LoadingSkeleton';

function RepoDetailContent({ paramsPromise }) {
  const params = use(paramsPromise);
  const { owner, name } = params;

  const [details, setDetails] = useState(null);
  const [commits, setCommits] = useState([]);
  const [contributors, setContributors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const [errorState, setErrorState] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Fetch repository data, commits, contributors, and favorite status
  const fetchAllRepoData = useCallback(async () => {
    setLoading(true);
    setErrorState(null);

    try {
      // 1. Fetch Repository Details
      const repoDetails = await getRepositoryDetails(owner, name);
      setDetails(repoDetails);

      // 2. Concurrently fetch commits, contributors, and favorite status
      const [commitsRes, contributorsRes, favoriteRes] = await Promise.allSettled([
        getRepositoryCommits(owner, name),
        getRepositoryContributors(owner, name),
        checkIsFavorite(repoDetails.id),
      ]);

      if (commitsRes.status === 'fulfilled') {
        setCommits(commitsRes.value || []);
      }
      if (contributorsRes.status === 'fulfilled') {
        setContributors(contributorsRes.value || []);
      }
      if (favoriteRes.status === 'fulfilled') {
        setIsFavorite(favoriteRes.value.isFavorite);
        setFavoriteId(favoriteRes.value.favoriteId);
      }
    } catch (err) {
      setErrorState({
        type: err.isRateLimit ? 'rateLimit' : 'error',
        isNotFound: err.isNotFound,
        message: err.message || 'Failed to load repository details.',
      });
    } finally {
      setLoading(false);
    }
  }, [owner, name]);

  useEffect(() => {
    fetchAllRepoData();
  }, [fetchAllRepoData]);

  // Handle Save / Remove Favorite
  const handleToggleFavorite = async () => {
    if (!details) return;
    setSavingFavorite(true);
    setFeedback(null);

    try {
      if (isFavorite) {
        await removeFavorite(favoriteId || details.id);
        setIsFavorite(false);
        setFavoriteId(null);
        setFeedback({
          type: 'info',
          message: `Removed "${details.full_name}" from favorites.`,
        });
      } else {
        const payload = {
          githubId: details.id,
          name: details.name,
          fullName: details.full_name,
          owner: {
            login: details.owner.login,
            avatarUrl: details.owner.avatar_url,
            htmlUrl: details.owner.html_url,
          },
          description: details.description,
          htmlUrl: details.html_url,
          stars: details.stargazers_count,
          forks: details.forks_count,
          language: details.language || 'Unknown',
          openIssues: details.open_issues_count || 0,
        };

        const res = await addFavorite(payload);
        setIsFavorite(true);
        setFavoriteId(res.data?._id || true);
        setFeedback({
          type: 'info',
          message: `Repository "${details.full_name}" saved to favorites!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update favorite status.',
      });
    } finally {
      setSavingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RepoDetailSkeleton />
      </div>
    );
  }

  // Handle 404 / Invalid or Deleted Repository
  if (errorState && errorState.isNotFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <FolderX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Repository Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The repository <span className="font-mono text-slate-300">"{owner}/{name}"</span> does not
          exist, might have been deleted, or is set to private on GitHub.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </Link>
        <AlertBanner type={errorState.type} message={errorState.message} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white font-medium group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Search
        </Link>
        <a
          href={details?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <span>View on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Main Repository Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-black/20 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={details?.owner.avatar_url}
              alt={details?.owner.login}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-slate-800 bg-slate-800 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-mono text-indigo-400">{details?.owner.login}</span>
                <span className="text-slate-600">/</span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{details?.name}</h1>
                {details?.default_branch && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {details.default_branch}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mt-1">
                {details?.description || 'No description provided.'}
              </p>

              {/* Topics / Tags */}
              {details?.topics && details.topics.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {details.topics.slice(0, 6).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-indigo-300 border border-slate-700/60 font-medium"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleToggleFavorite}
              disabled={savingFavorite}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {savingFavorite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              )}
              <span>{isFavorite ? 'Saved in Favorites' : 'Save to Favorites'}</span>
            </button>
          </div>
        </div>

        {/* Analytics Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>Total Stars</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(details?.stargazers_count)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>Total Forks</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(details?.forks_count)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Open Issues</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(details?.open_issues_count)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Watchers</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(details?.watchers_count)}
            </div>
          </div>
        </div>

        {/* Secondary Info Badges */}
        <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 flex-wrap">
          {details?.language && (
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: getLanguageColor(details.language) }}
              />
              <span>{details.language}</span>
            </span>
          )}

          {details?.license && (
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              <span>{details.license}</span>
            </span>
          )}

          {details?.created_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Created {formatDate(details.created_at)}</span>
            </span>
          )}

          {details?.pushed_at && (
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Last pushed {formatDate(details.pushed_at)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Two Column Grid: Top Contributors & Latest Commits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section B.1: Top 5 Contributors */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Top 5 Contributors</h2>
            </div>
            <span className="text-xs text-slate-500">Sorted by commits</span>
          </div>

          {contributors.length > 0 ? (
            <div className="space-y-3">
              {contributors.map((user, idx) => (
                <div
                  key={user.id || user.login}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 w-4">
                      #{idx + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-9 h-9 rounded-full ring-1 ring-slate-800 bg-slate-800"
                    />
                    <div>
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
                      >
                        {user.login}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <span className="text-xs text-slate-400">
                        {user.contributions} contributions
                      </span>
                    </div>
                  </div>

                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    Profile
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              No contributor information available or single maintainer.
            </div>
          )}
        </div>

        {/* Section B.2: Latest 5 Commits */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <GitCommit className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Latest 5 Commits</h2>
            </div>
            <span className="text-xs text-slate-500">Most recent activity</span>
          </div>

          {commits.length > 0 ? (
            <div className="space-y-3">
              {commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-relaxed mb-2">
                    {commit.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {commit.author.avatar_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.name}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="truncate max-w-[120px] font-medium text-slate-300">
                        {commit.author.name || commit.author.login}
                      </span>
                      {commit.author.date && (
                        <span className="text-slate-500">
                          {formatDate(commit.author.date)}
                        </span>
                      )}
                    </div>

                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      title="View commit diff on GitHub"
                    >
                      {commit.sha.substring(0, 7)}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              No recent commits found for this repository.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RepoDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RepoDetailSkeleton />
        </div>
      }
    >
      <RepoDetailContent paramsPromise={params} />
    </Suspense>
  );
}
