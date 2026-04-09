import React from 'react';
import { getStatusBadgeData, getCatIcon, getCatClass } from '../utils/helpers';
import { timeAgo } from '../utils/data';

export default function IssueCard({ issue, responses, onClick,onCommentClick }) {
    const badge = getStatusBadgeData(issue.status);

    // ✅ filter responses for this issue
   const issueResponses = Array.isArray(responses)
  ? responses.filter(
      (r) => String(r.issueId) === String(issue.id)
    )
  : [];
    // ✅ safely get latest response
    const latestResponse = issueResponses.length > 0
    ? [...issueResponses].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0]
    : null;
    return (
        <div
            className={`issue-card ${issue.flagged ? 'flagged' : ''}`}
            onClick={() => onClick && onClick(issue.id)}
            style={{ cursor: 'pointer' }}
        >
            <div className="issue-top">
                <div className={`issue-cat-icon ${getCatClass(issue.category)}`}>
                    {getCatIcon(issue.category)}
                </div>

                <div className="issue-meta">
                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-excerpt">{issue.description}</div>
                </div>

                <span className={`badge ${badge.class}`}>
                    {badge.name}
                </span>
            </div>
            <div className="issue-footer">

  <span className="issue-info">
    📍 Ward {issue.wardNumber || 'N/A'}
  </span>

  

  <span 
  className="issue-info"
  onClick={(e) => {
    e.stopPropagation(); // prevents card click
    onCommentClick && onCommentClick(issue); // 🔥 trigger parent
  }}
>
    💬 {issueResponses.length} response{issueResponses.length !== 1 ? 's' : ''}
  </span>
</div>
         </div>
    );
}