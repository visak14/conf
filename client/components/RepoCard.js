'use client';

import Link from 'next/link';
import { Star, GitFork, AlertCircle, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { formatNumber, formatDate, getLanguageColor } from '@/lib/utils';

export default function RepoCard({
  repo,
  isFavorite = false,
  onToggleFavorite,
  isSaving = false,
  isSavedPage = false,
}) {
  const ownerLogin = repo.owner?.login || repo.fullName?.split('/')[0] || 'unknown';
  const repoName = repo.name || repo.fullName?.split('/')[1] || '';
  const avatarUrl = repo.owner?.avatarUrl || repo.owner?.avatar_url || 'https://github.com/identicons/default.png';
  const starsCount = repo.stars !== undefined ? repo.stars : repo.stargazers_count;
  const forksCount = repo.forks !== undefined ? repo.forks : repo.forks_count;
  const openIssues = repo.openIssues !== undefined ? repo.openIssues : repo.open_issues_count;
  const lang = repo.language || 'Unknown';
  const updatedAt = repo.updated_at || repo.updatedAt;

  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all duration-300 p-5 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-indigo-500/5">
      <div>
        {/* Header: Owner Avatar & Title + Favorite Action */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={ownerLogin}
              className="w-9 h-9 rounded-full ring-2 ring-slate-800 flex-shrink-0 bg-slate-800"
              loading="lazy"
            />
            <div className="min-w-0">
              <span className="text-xs text-slate-400 font-mono block truncate">
                {ownerLogin}
              </span>
              <Link
                href={`/repo/${ownerLogin}/${repoName}`}
                className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors truncate block"
                title={repo.full_name || repo.fullName}
              >
                {repoName}
              </Link>
            </div>
          </div>

          {/* Save / Remove Action Button */}
          <button
            onClick={() => onToggleFavorite(repo)}
            disabled={isSaving}
            className={`p-2 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
              isFavorite
                ? 'bg-amber-500/15 text-amber-400 hover:bg-rose-500/15 hover:text-rose-400 border border-amber-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-700/50'
            }`}
            title={
              isFavorite
                ? isSavedPage
                  ? 'Remove from saved favorites'
                  : 'Saved in favorites (click to remove)'
                : 'Save to favorites'
            }
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300/80 line-clamp-2 mb-4 leading-relaxed h-10">
          {repo.description || 'No description provided for this repository.'}
        </p>
      </div>

      {/* Meta & Stats Footer */}
      <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Language */}
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: getLanguageColor(lang) }}
            />
            <span className="truncate max-w-[80px]">{lang}</span>
          </span>

          {/* Stars */}
          <span className="flex items-center gap-1" title={`${starsCount} stars`}>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{formatNumber(starsCount)}</span>
          </span>

          {/* Forks */}
          <span className="flex items-center gap-1" title={`${forksCount} forks`}>
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatNumber(forksCount)}</span>
          </span>

          {/* Open Issues */}
          {openIssues !== undefined && (
            <span className="hidden sm:flex items-center gap-1" title={`${openIssues} open issues`}>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400/70" />
              <span>{openIssues}</span>
            </span>
          )}
        </div>

        {/* External Link */}
        <div className="flex items-center gap-2">
          {updatedAt && (
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Updated {formatDate(updatedAt)}
            </span>
          )}
          <a
            href={repo.html_url || repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-200 p-1 rounded transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
