import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { getStatusBadgeData, getCatIcon, getCatClass } from '../utils/helpers';
import { timeAgo, formatDate,} from '../utils/data';
import { useNavigate } from "react-router-dom";
export default function Politician() {
    const { currentUser, setCurrentUser } = useAuth();
    const [activeSection, setActiveSection] = useState('inbox'); 
    // Data state
    const [issues, setIssues] = useState([]);
    const [myAnns, setMyAnns] = useState([]);
    const [allResponses, setAllResponses] = useState([]);
    
    // Filters
    const [inboxFilter, setInboxFilter] = useState('all');
    
    // Announce form
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    
    // Respond Modal
    const [respondIssueId, setRespondIssueId] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [responseStatus, setResponseStatus] = useState('open');

    // Profile form
    const [profName, setProfName] = useState(currentUser?.name || '');
    const [profEmail, setProfEmail] = useState(currentUser?.email || '');
    const [profConst, setProfConst] = useState(currentUser?.constituency || '');
    const [profPass, setProfPass] = useState('');
    const [profWard, setProfWard] = useState(currentUser?.wardNumber || '');
  const [profStreet, setProfStreet] = useState(currentUser?.street || '');
  const [profDistrict, setProfDistrict] = useState(currentUser?.district || '');
  const [profState, setProfState] = useState(currentUser?.state || '');


    useEffect(() => {
    if (!currentUser?.id) return;

    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener('local-storage-update', handleUpdate);

    return () => window.removeEventListener('local-storage-update', handleUpdate);
}, [currentUser?.id]);
    const [announcements, setAnnouncements] = useState([]);
   const filtered = (announcements|| []).filter(a => 
  a.wardNumber === currentUser?.wardNumber
);
const updateStatus = async (id, status) => {
    try {
        await fetch(
            `https://backendfullstack-production.up.railway.app/issues/${id}/status?status=${status}`,
            { method: "PUT" }
        );
        fetchWardIssues();
    } catch (err) {
        console.error(err);
    }
};
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
const refreshData = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/announcements");
    const data = await res.json();
    setAnnouncements(data || []);
  } catch (err) {
    console.error(err);
  }
};
const fetchResponses = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/responses");
    const data = await res.json();

    setAllResponses(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
  }
};
    const postAnnouncement = async (e) => {
  e.preventDefault();

  if (!annTitle.trim() || !annContent.trim()) {
    showToast('Fill all fields.', 'error');
    return;
  }

  try {
    await fetch("https://backendfullstack-production.up.railway.app/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  title: annTitle,
  content: annContent,
  politicianName: currentUser.name,
  constituency: currentUser.constituency,
  wardNumber: currentUser.wardNumber,
  timestamp: new Date().toISOString()   // 🔥 IMPORTANT
})
    });

    showToast('Announcement published! 📣', 'success');

    setAnnTitle('');
    setAnnContent('');
    refreshData();

  } catch (err) {
    console.error(err);
  }
};

const respondIssueResponses = allResponses.filter(
  r => Number(r.issueId) === Number(respondIssueId)
);
const fetchWardAnnouncements = async () => {
  try {
    if (!currentUser?.wardNumber) return;

    const res = await fetch(
      `https://backendfullstack-production.up.railway.app/announcements/ward?wardNumber=${currentUser.wardNumber}`
    );

    const data = await res.json();

    setAnnouncements(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error(err);
    setAnnouncements([]);
  }
};
const fetchWardIssues = async () => {
  try {
    if (!currentUser?.wardNumber) return;

    const res = await fetch(
      `https://backendfullstack-production.up.railway.app/issues/ward?wardNumber=${currentUser.wardNumber}`
    );

    const data = await res.json();

    setIssues(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error(err);
    setIssues([]);
  }
};  
useEffect(() => {
  if (!currentUser) return;

  fetchWardIssues();
  fetchWardAnnouncements();
  fetchResponses();
  refreshData();
}, [currentUser?.id]);
   const deleteAnn = async (id) => {
  try {
    await fetch(`https://backendfullstack-production.up.railway.app/announcements/${id}`, {
      method: "DELETE"
    });
    refreshData();
  } catch (err) {
    console.error(err);
  }
};
  const submitResponse = async () => {
  console.log("🔥 submit clicked");

  if (!responseText.trim()) {
    console.log("❌ Empty response");
    return;
  }

  console.log("✅ Sending:", respondIssueId, responseText);

  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        issueId: respondIssueId,
        content: responseText,
        authorName: currentUser.name,
        authorRole: "politician",
        timestamp: new Date().toISOString()
      })
    });

    console.log("Response status:", res.status);

  } catch (err) {
    console.error(err);
  }
};
const saveProfile = async () => {
  try {
    const bodyData = {
      name: profName,
      street: profStreet,
      district: profDistrict,
      state: profState,
      wardNumber: profWard ? Number(profWard) : null
    };

    // 🔥 ONLY send password if user typed it
    if (profPass && profPass.trim() !== "") {
      bodyData.password = profPass;
    }

    const res = await fetch(
      `https://backendfullstack-production.up.railway.app/auth/users/${currentUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      }
    );

    const data = await res.json();

    console.log("UPDATE RESPONSE:", data); // 🔍 DEBUG

    if (!res.ok) {
      alert(data.message || "Update failed ❌");
      return;
    }

    // update state
    const updatedUser = {
      ...currentUser,
      ...data
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Profile updated ✅");

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
};
const openCount = issues.filter(i => i.status === 'open').length;

    const navLinks = [
        { type: 'label', label: 'Engagement' },
        { id: 'inbox', icon: '📥', label: 'Issue Inbox', badge: openCount },
        { id: 'announce', icon: '📣', label: 'Post Announcement' },
        { id: 'myann', icon: '📋', label: 'My Announcements' },
        { type: 'label', label: 'Insights' },
        { id: 'stats', icon: '📊', label: 'Engagement Stats' },
        { type: 'label', label: 'Account' },
        { id: 'profile', icon: '👤', label: 'My Profile' }
    ];

    const getHeaderTitle = () => {
        return { inbox: 'Issue Inbox', announce: 'Post Announcement', myann: 'My Announcements', stats: 'Engagement Stats', profile: 'My Profile' }[activeSection] || activeSection;
    };
    const filteredIssues = inboxFilter === 'all' ? issues : issues.filter(i => i.status === inboxFilter);
    const respondIssue = respondIssueId ? issues.find(i => i.id === respondIssueId) : null;
    // Stats calculations
    const prog = issues.filter(i => i.status === 'in-progress').length;
    const res = issues.filter(i => i.status === 'resolved').length;
    const totalResponses = allResponses.filter(
  r => r.authorName === currentUser.name
).length;
    // Stats calculations

    const resRate = issues.length ? Math.round((res / issues.length) * 100) : 0;
    const maxS = Math.max(openCount, prog, res, 1);
    const cats = ['Infrastructure', 'Health', 'Education', 'Safety', 'Environment', 'Other'];
    const catCounts = cats.map(c => ({ c, n: issues.filter(i => i.category === c).length }));
    const maxC = Math.max(...catCounts.map(x => x.n), 1);

    return (
        <DashboardLayout 
            navLinks={navLinks} 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            headerTitle={getHeaderTitle()}

            notifCount={0}
            notificationClick={() => { setActiveSection('inbox');}}
        >
            {/* INBOX */}
            {activeSection === 'inbox' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1>Issue Inbox</h1>
                            <p style={{ marginTop: '4px' }}>{issues.length} issue{issues.length !== 1 ? 's' : ''} in {currentUser.constituency || 'your constituency'}</p>
                        </div>
                        <select className="form-control" style={{ width: 'auto' }} value={inboxFilter} onChange={e => setInboxFilter(e.target.value)}>
                            <option value="all">All Issues</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div>
                        {filteredIssues.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📥</div><p>No issues match this filter.</p></div>
                        ) : (
                            filteredIssues.map(issue => (
                                <div key={issue.id} className="issue-card">
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

                                        {issue.timestamp && (
  <span className="issue-info">🕐 {timeAgo(issue.timestamp)}</span>
)}
                                        <span className="issue-info">
  💬 {
    allResponses.filter(r =>
      String(r.issueId) === String(issue.id)
    ).length
  }
</span>
                                        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => {
                                            setRespondIssueId(issue.id);
                                            setResponseStatus(issue.status);
                                            setResponseText('');
                                        }}>💬 Respond</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* ANNOUNCE */}
            {activeSection === 'announce' && (
                <section className="animate-in">
                    <div className="section-header mb-6">
                        <div>
                            <h1>Post Announcement</h1>
                            <p style={{ marginTop: '4px' }}>Share updates with your constituents</p>
                        </div>
                    </div>
                    <div className="card" style={{ maxWidth: '660px' }}>
                        <form onSubmit={postAnnouncement}>
                            <div className="form-group">
                                <label className="form-label">Announcement Title</label>
                                <input className="form-control" placeholder="Clear, descriptive headline" value={annTitle} onChange={e => setAnnTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content</label>
                                <textarea className="form-control" rows="7" placeholder="Share your update, decision, event, or progress report..." value={annContent} onChange={e => setAnnContent(e.target.value)}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">📣 Publish Announcement</button>
                        </form>
                    </div>
                </section>
            )}

            {/* MY ANNOUNCEMENTS */}
            {activeSection === 'myann' && (
                <section className="animate-in">
                    <div className="section-header mb-6">
                        <h1>My Announcements</h1>
                    </div>
                    <div>
  {filtered.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">📣</div>
      <p>No announcements yet. Post your first update!</p>
    </div>
  ) : (
    filtered.map(a => (
      <div key={a.id} className="announcement-card">
        <div className="ann-title">{a.title}</div>

        <div className="ann-content" style={{ marginTop: '8px' }}>
          {a.content}
        </div>

        <div className="ann-footer" style={{ marginTop: '12px' }}>
          <span className="issue-info">
            📍 {a.constituency || 'All'}
          </span>

          <span className="issue-info">
            👍 {a.likes || 0} likes
          </span>

          <small>{new Date(a.timestamp).toLocaleDateString()}</small>


          <button
            className="btn btn-danger btn-xs"
            onClick={() => deleteAnn(a.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    ))
  )}
</div>
                </section>
            )}

            {/* STATS */}
            {activeSection === 'stats' && (
                <section className="animate-in">
                    <div className="section-header mb-6">
                        <div>
                            <h1>Engagement Stats</h1>
                            <p style={{ marginTop: '4px' }}>Your impact at a glance</p>
                        </div>
                    </div>
                    <div className="stats-grid">
                        {[
                            { icon: '📋', label: 'Total Issues', val: issues.length, cls: 'blue' },
                            { icon: '✅', label: 'Resolved', val: res, cls: 'green' },
                            { icon: '🕒', label: 'In Progress', val: prog, cls: 'amber' },
                            { icon: '🔴', label: 'Open', val: openCount, cls: 'red' },
                            { icon: '💬', label: 'My Responses', val: totalResponses, cls: 'purple' },
                            { icon: '📊', label: 'Resolution Rate', val: `${resRate}%`, cls: 'blue' },
                        ].map((s, idx) => (
                            <div key={idx} className="stat-card animate-in">
                                <div className={`card-icon ${s.cls}`} style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>{s.icon}</div>
                                <div>
                                    <div className="stat-value">{s.val}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Issues by Status</span><div className="card-icon blue">📊</div></div>
                            <div className="bar-chart-wrap">
                                {[
                                    ['Open', openCount, '#f59e0b'], ['In Progress', prog, '#3b82f6'], ['Resolved', res, '#10b981']
                                ].map(([l, v, c]) => (
                                    <div key={l} className="bar-chart-row">
                                        <div className="bar-chart-label">{l}</div>
                                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(v / maxS) * 100}%`, background: c }}></div></div>
                                        <div className="bar-value">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Issues by Category</span><div className="card-icon purple">🗂️</div></div>
                            <div className="bar-chart-wrap">
                                {catCounts.filter(x => x.n > 0).length > 0 ? catCounts.filter(x => x.n > 0).map(({ c, n }) => (
                                    <div key={c} className="bar-chart-row">
                                        <div className="bar-chart-label" style={{ fontSize: '0.75rem' }}>{c}</div>
                                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxC) * 100}%` }}></div></div>
                                        <div className="bar-value">{n}</div>
                                    </div>
                                )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>No issues yet.</p>}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* PROFILE */}
            {activeSection === 'profile' && (
                <section className="animate-in">
                    <div className="section-header mb-6">
                        <div><h1>My Profile</h1></div>
                    </div>
                    <div className="card" style={{ maxWidth: '500px' }}>
                        <form onSubmit={(e) => {
                        e.preventDefault();
                        saveProfile();
                      }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-control" value={profName} onChange={e => setProfName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" value={profEmail} disabled onChange={e => setProfEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ward Number</label>
                                <input 
  className="form-control"
  value={profWard}
  onChange={e => setProfWard(e.target.value)}
/>
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

            {/* RESPOND MODAL */}
            {respondIssue && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setRespondIssueId(null); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <span className="modal-title">Respond to Issue</span>
                            <button className="modal-close" onClick={() => setRespondIssueId(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <span className={`badge ${getStatusBadgeData(respondIssue.status).class}`}>{getStatusBadgeData(respondIssue.status).name}</span>
                                <small>📍 {respondIssue.constituency}</small>
                                <small>👤 {respondIssue.citizenName}</small>
                                <small>🕐 {timeAgo(respondIssue.timestamp)}</small>
                            </div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.8' }}>{respondIssue.description}</p>
                            <hr className="divider" />
                            <div className="form-group">
                                <label className="form-label">Your Response</label>
                                <textarea className="form-control" rows="4" placeholder="Write your official response..." value={responseText} onChange={e => setResponseText(e.target.value)}></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Status</label>
                                <select className="form-control" value={responseStatus} onChange={e => setResponseStatus(e.target.value)}>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                            {respondIssueResponses.length > 0 && (
                                <div className="responses-thread">
                                    <h4 style={{ marginBottom: '12px' }}>Previous Responses ({respondIssueResponses.length})</h4>
                                    {respondIssueResponses.map(r => (
                                        <div key={r.id} className="response-item">
                                            <div className={`response-avatar ${r.authorRole}`}>{r.authorName.charAt(0)}</div>
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
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setRespondIssueId(null)}>Cancel</button>
                            <button 
  className="btn btn-primary" 
  onClick={async () => {
  await submitResponse();  

  // 🔥 ADD THIS LINE
  await updateStatus(respondIssueId, responseStatus);

  await fetchResponses();
  await fetchWardIssues(); 

  setRespondIssueId(null);
}}
>
    📤 Send Response
</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
