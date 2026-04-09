import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { getStatusBadgeData, getCatIcon, getCatClass } from '../utils/helpers';
export default function Moderator() {
    const { currentUser, setCurrentUser } = useAuth();
    const [activeSection, setActiveSection] = useState('queue');
    
    // Data state
    const [flags, setFlags] = useState([]);
    const [allIssues, setAllIssues] = useState([]);
    const [allResp, setAllResp] = useState([]);
    const [allAnn, setAllAnn] = useState([]);
    
    // All Issues filter
    const [issSearch, setIssSearch] = useState('');
    const [issStatus, setIssStatus] = useState('all');

    // Profile form
    const [profName, setProfName] = useState(currentUser?.name || '');
    const [profEmail, setProfEmail] = useState(currentUser?.email || '');
    const [profPass, setProfPass] = useState('');
    
    // Flag modal
    const [flagTargetId, setFlagTargetId] = useState(null);
    const [flagTargetType, setFlagTargetType] = useState(null);
    const [flagReason, setFlagReason] = useState('Inappropriate language');
    const [flagNotes, setFlagNotes] = useState('');

    const fetchAllIssues = async () => {
  try {
    const res = await fetch("http://localhost:3103/issues");
    const data = await res.json();
    setAllIssues(data);
  } catch (err) {
    console.error(err);
  }
};
    useEffect(() => {
        const handleUpdate = () => refreshData();
        return () => window.removeEventListener('local-storage-update', handleUpdate);
    }, []);

    const resolveFlag = (flagId, action) => {
        const flag = flags.find(f => f.id === flagId);
        if (!flag) return;
        if (action === 'remove') {
            if (flag.targetType === 'issue') Issues.update(flag.targetId, { flagged: true });
            else {
                import('../utils/data').then(({ DB, DB_KEYS }) => {
                    const resps = Responses.all().filter(r => r.id !== flag.targetId);
                    DB.set(DB_KEYS.responses, resps);
                });
            }
        }
        showToast(action === 'approve' ? 'Content approved and kept.' : 'Content removed.', action === 'approve' ? 'success' : 'info');
    };
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingIssues, setPendingIssues] = useState([]);
    useEffect(() => {
        fetchAllIssues();
        fetchFlags();
        fetchPendingIssues();
    }, []);
const submitFlag = async () => {
  try {
    await fetch("http://localhost:3103/flags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        issueId: selectedIssueId,
        reason: flagReason,
        notes: flagNotes
      })
    });

    showToast("Flag submitted", "success");
    setIsModalOpen(false);

  } catch (err) {
    showToast("Error submitting flag", "error");
  }
};
const fetchPendingIssues = async () => {
  const res = await fetch("http://localhost:3103/issues/pending");
  const data = await res.json();

  setPendingIssues(Array.isArray(data) ? data : []);
};
const fetchIssues = async () => {
  const res = await fetch("http://localhost:3103/issues");
  const data = await res.json();
  setAllIssues(data);
};
const removeIssue = async (id) => {
  if (!window.confirm("Remove this issue?")) return;

  await fetch(`http://localhost:3103/issues/${id}`, {
    method: "DELETE"
  });

  showToast("Issue removed", "info");
  fetchAllIssues();
};
const fetchFlags = async () => {
  try {
    const res = await fetch("http://localhost:3103/flags");

    if (!res.ok) throw new Error("Failed to fetch flags");
    const data = await res.json();
    setFlags(data);
  } catch (err) {
    console.error(err);
  }
};
    const saveProfile = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`http://localhost:3103/users/${currentUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: profName,
        email: profEmail,
        password: profPass || undefined
      })
    });

    const updatedUser = await res.json();
    setCurrentUser(updatedUser);

    showToast("Profile updated", "success");

  } catch (err) {
    showToast("Error updating profile", "error");
  }
};


    const navLinks = [
        { type: 'label', label: 'Moderation' },
        { id: 'queue', icon: '🚩', label: 'Content Queue', badge: flags.length },
        { id: 'monitor', icon: '👁️', label: 'Activity Monitor' },
        { id: 'allissues', icon: '📋', label: 'All Issues' },
        { type: 'label', label: 'Account' },
        { id: 'profile', icon: '👤', label: 'My Profile' }
    ];


    // ✅ PUT HERE (top of component)

const timeAgo = (date) => {
  if (!date) return "";

  const diff = Date.now() - new Date(date).getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;

  return "Just now";
};


    const getHeaderTitle = () => {
        return { queue: 'Content Queue', monitor: 'Activity Monitor', allissues: 'All Issues', profile: 'My Profile' }[activeSection] || activeSection;
    };

    const filteredIssues = allIssues.filter(i => {
        if (issStatus !== 'all' && i.status !== issStatus) return false;
        if (issSearch) {
            const ls = issSearch.toLowerCase();

            return i.title.toLowerCase().includes(ls) || i.description.toLowerCase().includes(ls) || i.citizenName.toLowerCase().includes(ls);
        }
        return true;
    });
    const activities = [
        ...allIssues.map(i => ({ ts: i.timestamp, icon: '📢', text: `<strong>${i.citizenName}</strong> reported: "${i.title}"`, type: 'issue', id: i.id })),
        ...allResp.map(r => ({ ts: r.timestamp, icon: '💬', text: `<strong>${r.authorName}</strong> (${r.authorRole}) responded to an issue`, type: 'response', id: r.id })),
        ...allAnn.map(a => ({ ts: a.timestamp, icon: '📣', text: `<strong>${a.politicianName}</strong> posted: "${a.title}"`, type: 'ann', id: a.id })),

    ].sort((a, b) => b.ts - a.ts).slice(0, 30);
    return (
        <DashboardLayout 
            navLinks={navLinks} 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            headerTitle={getHeaderTitle()}
        >
            {/* QUEUE */}
            {activeSection === 'queue' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Content Queue</h1>
                            <p style={{ marginTop: '4px' }}>Flagged issues and responses awaiting review</p>
                        </div>
                    </div>
                    <div>

                        {flags.length === 0 && pendingIssues===0 ? (
                            <div className="empty-state"><div className="empty-icon">✅</div><p>No flagged content. Everything looks clean!</p></div>
                        ) : (
                            flags.map(flag => {
                                let content = '', targetTitle = '';
                                if (flag.targetType === 'issue') {
                                    const issue = allIssues.find(i=>i.id===flag.targetId);
                                    if (issue) { targetTitle = issue.title; content = issue.description; }
                                } else {
                                    const resp = Responses.all().find(r => r.id === flag.targetId);
                                    if (resp) { targetTitle = `Response by ${resp.authorName}`; content = resp.content; }
                                }
                                const raiser = Users.find(flag.raisedBy);
                                return (
                                    <div key={flag.id} className="issue-card flagged animate-in">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span className="badge badge-flagged">🚩 Flagged {flag.targetType}</span>
                                            <small>Reason: <strong>{flag.reason}</strong></small>
                                            <small>Raised by: {raiser ? raiser.name : 'Unknown'}</small>
                                            <small style={{ marginLeft: 'auto' }}>{timeAgo(flag.raisedAt)}</small>
                                        </div>
                                        <h4 style={{ marginBottom: '6px' }}>{targetTitle}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{content}</p>
                                        <div className="issue-footer" style={{ marginTop: '14px' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => resolveFlag(flag.id, 'approve')}>✅ Approve (Keep)</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => resolveFlag(flag.id, 'remove')}>🗑️ Remove Content</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {pendingIssues.length === 0 ? (
  <div className="empty-state">
    <p>No pending issues</p>
  </div>
) : (
  pendingIssues.map(issue => (
    <div key={issue.id} className="issue-card">

      <h4>{issue.title}</h4>
      <p>{issue.description}</p>

      <div className="issue-footer">
        <span>👤 {issue.citizenName}</span>
        <span>📍 Ward {issue.wardNumber}</span>
        <span>🕐 {timeAgo(issue.timestamp)}</span>

        {/* ✅ APPROVE */}
        <button
          className="btn btn-success"
          onClick={async () => {
            await fetch(`http://localhost:3103/issues/${issue.id}/approve`, {
              method: "PUT"
            });

            showToast("Approved", "success");
            fetchPendingIssues(); // refresh
          }}
        >
          ✅ Approve
        </button>

        {/* ❌ REJECT */}
        <button
          className="btn btn-danger"
          onClick={() => removeIssue(issue.id)}
        >
          🗑 Reject
        </button>

      </div>
    </div>
  ))
)}
                    </div>
                </section>
            )}

            {/* MONITOR */}
            {activeSection === 'monitor' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Activity Monitor</h1>
                            <p style={{ marginTop: '4px' }}>Recent platform interactions in real time</p>
                        </div>
                    </div>
                    <div className="stats-grid">
                        {[
                            { icon: '📋', val: allIssues.length, label: 'Total Issues', cls: 'blue' },
                            { icon: '💬', val: allResp.length, label: 'Total Responses', cls: 'purple' },
                            { icon: '📣', val: allAnn.length, label: 'Announcements', cls: 'green' },
                            { icon: '🚩', val: flags.length, label: 'Pending Flags', cls: 'red' },
                        ].map((s, idx) => (
                            <div key={idx} className="stat-card animate-in">
                                <div className={`card-icon ${s.cls}`} style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>{s.icon}</div>
                                <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ marginTop: '16px' }}>
                        <div className="card-header"><span className="card-title">Recent Activity</span></div>
                        {activities.map(a => (
                            <div key={`${a.type}-${a.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }} dangerouslySetInnerHTML={{ __html: a.text }}></p>
                                    <small>{timeAgo(a.ts)}</small>
                                </div>
                                {a.type === 'issue' && (
                                    <button className="flag-btn" onClick={() => { setFlagTargetId(a.id); setFlagTargetType('issue'); }}>🚩 Flag</button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ALL ISSUES */}
            {activeSection === 'allissues' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <div><h1>All Issues</h1></div>
                        <div className="filter-bar" style={{ marginBottom: 0 }}>
                            <div className="search-wrap">
                                <span className="search-icon">🔍</span>
                                <input className="form-control" placeholder="Search issues..." value={issSearch} onChange={e => setIssSearch(e.target.value)} />
                            </div>
                            <select className="form-control" style={{ width: 'auto' }} value={issStatus} onChange={e => setIssStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        {filteredIssues.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📋</div><p>No issues match.</p></div>
                        ) : (
                            filteredIssues.map(issue => (
                                <div key={issue.id} className={`issue-card ${issue.flagged ? 'flagged' : ''}`}>
                                    <div className="issue-top">
                                        <div className={`issue-cat-icon ${getCatClass(issue.category)}`}>{getCatIcon(issue.category)}</div>
                                        <div className="issue-meta">
                                            <div className="issue-title">{issue.title}</div>
                                            <div className="issue-excerpt">{issue.description}</div>
                                        </div>
                                        <span className={`badge ${getStatusBadgeData(issue.status).class}`}>{getStatusBadgeData(issue.status).name}</span>
                                    </div>
                                    <div className="issue-footer">
                                        <span className="issue-info">👤 {issue.citizenName}</span>
                                        <span className="issue-info">📍 {issue.constituency}</span>
                                        <span className="issue-info">🕐 {timeAgo(issue.timestamp)}</span>
                                        <button className="flag-btn" onClick={() => { setFlagTargetId(issue.id); setFlagTargetType('issue'); }}>🚩 Flag</button>
                                        <button className="btn btn-danger btn-xs" onClick={() => removeIssue(issue.id)}>🗑️ Remove</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* PROFILE */}
            {activeSection === 'profile' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px' }}>
                        <div><h1>My Profile</h1></div>
                    </div>
                    <div className="card" style={{ maxWidth: '500px' }}>
                        <form onSubmit={saveProfile}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-control" value={profName} onChange={e => setProfName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" value={profEmail} onChange={e => setProfEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-control" placeholder="Leave blank to keep current" value={profPass} onChange={e => setProfPass(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                        </form>
                    </div>
                </section>
            )}

            {/* FLAG MODAL */}
            {flagTargetId && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setFlagTargetId(null); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <span className="modal-title">Flag Content</span>
                            <button className="modal-close" onClick={() => setFlagTargetId(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Reason for Flagging</label>
                                <select className="form-control" value={flagReason} onChange={e => setFlagReason(e.target.value)}>
                                    <option>Inappropriate language</option>
                                    <option>Misinformation</option>
                                    <option>Spam or duplicate</option>
                                    <option>Off-topic content</option>
                                    <option>Harassment</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes (optional)</label>
                                <textarea className="form-control" rows="3" placeholder="Any additional context..." value={flagNotes} onChange={e => setFlagNotes(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setFlagTargetId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={submitFlag}>🚩 Submit Flag</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
