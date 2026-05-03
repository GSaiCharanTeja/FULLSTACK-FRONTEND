import React from 'react';
import { getStatusBadgeData, getCatIcon, getCatClass } from '../utils/helpers';
import { timeAgo } from '../utils/data';
const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d)) return "";

  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};
export default function IssueModal({ issue, responses = [], onClose }) {
    if (!issue) return null;

    const badge = getStatusBadgeData(issue.status);

    return (
        <div className="modal-overlay open" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">Issue Details</span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            
                            <span className={`issue-cat-icon ${getCatClass(issue.category)}`}>
                                {getCatIcon(issue.category)}
                            </span>

                            <span className={`badge ${badge.class}`}>{badge.name}</span>

                            {/* ✅ Ward */}
                            <small>📍 Ward {issue.wardNumber || 'N/A'}</small>

                            {/* ✅ Safe time */}
                            
                        </div>

                        <p>{issue.description}</p>
                    </div>

                    {/* ✅ Responses */}
                    <div 
                        className="responses-thread"
                        style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                        <h4>💬 Responses ({responses.length})</h4>

                        {responses.length > 0 ? (
                            responses.map(r => (
                                <div key={r.id} className="response-item">
                                    
                                    <div className={`response-avatar ${r.authorRole}`}>
                                        {r.authorName?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="response-bubble">

                                <div className="response-header">
                                    <div>
                                    <span className="response-author">{r.authorName}</span>
                                    <span className="response-role">{r.authorRole}</span>
                                    </div>

                                    <span className="response-time">
                                    {formatDateTime(r.timestamp)}
                                    </span>
                                </div>

                                <div className="response-text">{r.content}</div>

                                </div>

                                </div>
                            ))
                        ) : (
                            <p>No responses yet. Your representative will reply soon.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}