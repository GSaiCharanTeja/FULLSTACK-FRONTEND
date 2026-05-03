import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { timeAgo, formatDate,} from '../utils/data';
export default function Citizen() {
    const { currentUser, setCurrentUser } = useAuth();
    const [activeSection, setActiveSection] = useState('feed');
    const [myIssuesFilter, setMyIssuesFilter] = useState('all');
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [openResponses, setOpenResponses] = useState(false);
    // Data state
    const [announcements, setAnnouncements] = useState([]);
    const [openCommentsId, setOpenCommentsId] = useState(null);
    // Modal state
    
    // Report form
    const [repTitle, setRepTitle] = useState('');
    const [repCat, setRepCat] = useState('Infrastructure');
    const [repUrg, setRepUrg] = useState('medium');
    const [repDesc, setRepDesc] = useState('');
    
    // Profile form
    const [profName, setProfName] = useState(currentUser?.name || '');
    const [profEmail, setProfEmail] = useState(currentUser?.email || '');
    const [profConst, setProfConst] = useState(currentUser?.constituency || '');
    const [profWard, setProfWard] = useState(currentUser?.wardNumber || '');
    const [profStreet, setProfStreet] = useState(currentUser?.street || '');
    const [profDistrict, setProfDistrict] = useState(currentUser?.district || '');
    const [profState, setProfState] = useState(currentUser?.state || '');
    const [profPassword, setProfPassword] = useState('');
    const [profPass, setProfPass] = useState('');
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [activeAnnId, setActiveAnnId] = useState(null);
    const [responses, setResponses] = useState([]);
    // ✅ THEN CONDITIONAL RETURN
    const submitIssue = async (e) => {
  e.preventDefault();

  if (!repTitle.trim() || !repDesc.trim()) {
    showToast('Please fill all fields.', 'error');
    return;
  }
  const issue = {
    title: repTitle.trim(),
    category: repCat,
    description: repDesc.trim(),
    urgency: repUrg,
    wardNumber: currentUser.wardNumber,   // ✅ auto
    citizenId: currentUser.id,
    citizenName: currentUser.name,
    constituency: currentUser.constituency || 'General',
    status: 'pending',   // 🔥 IMPORTANT
    votes: 0,
    flagged: false,
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(issue)
    });

    if (!res.ok) throw new Error();

    showToast('Issue reported successfully! 🎉', 'success');

    setRepTitle('');
    setRepDesc('');
    setRepCat('Infrastructure');
    setRepUrg('medium');

    refreshData();
    setActiveSection('myissues');

  } catch (err) {
    console.error(err);
  }
};
const selectedResponses = selectedIssue
  ? responses.filter(r =>
      String(
        r.issueId ||
        r.issueID ||
        r.issue_id ||
        r.issue?.id
      ) === String(selectedIssue.id)
    )
  : [];
  
const fetchResponses = async () => {
    const res = await fetch("https://backendfullstack-production.up.railway.app/responses");
    const data = await res.json();
    setResponses(Array.isArray(data)? data :[]);
};
useEffect(() => {
  fetchResponses();

  const interval = setInterval(() => {
    fetchResponses();   // 🔥 auto refresh every 3 sec
  }, 3000);

  return () => clearInterval(interval);
}, []);
const fetchComments = async (id) => {
  try {
    const res = await fetch(`https://backendfullstack-production.up.railway.app/comments/${id}`);
    const data = await res.json();

    setComments(data || []);
    setActiveAnnId(id);

  } catch (err) {
    console.error(err);
  }
};
const addComment = async () => {
  if (!commentText.trim()) return;

  try {
    await fetch("https://backendfullstack-production.up.railway.app/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        announcementId: activeAnnId,
        userName: currentUser.name,
        content: commentText
      })
    });

    setCommentText('');
    fetchComments(activeAnnId); // refresh

  } catch (err) {
    console.error(err);
  }
};
const fetchWardAnnouncements = async () => {
  try {
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

    const fetchAnnouncements = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/announcements");
    const data = await res.json();
    setAnnouncements(data || []);
  } catch (err) {
    console.error(err);
    setAnnouncements([]);
  }
};
const openIssue = async (id) => {
    await fetchResponses();   // 🔥 fetch latest BEFORE opening
    const issue = issues.find(i => i.id === id);
    setSelectedIssue(issue);
    setOpenResponses(true);
};
useEffect(() => {
  fetchWardAnnouncements();
  const interval = setInterval(() => {
    fetchWardAnnouncements();
  }, 10000); // every 10 sec

  return () => clearInterval(interval);
}, []);
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
    const navLinks = [
        { type: 'label', label: 'My Activity' },
        { id: 'feed', icon: '📰', label: 'Updates Feed' },
        { id: 'report', icon: '📢', label: 'Report an Issue' },
        { id: 'myissues', icon: '📋', label: 'My Issues', badge: issues.length },
        { type: 'label', label: 'Account' },
        { id: 'profile', icon: '👤', label: 'My Profile' }
    ];

    const getHeaderTitle = () => {
        return { feed: 'Updates Feed', report: 'Report an Issue', myissues: 'My Issues', profile: 'My Profile' }[activeSection] || activeSection;
    };

    const filteredIssues = myIssuesFilter === 'all' ? issues : issues.filter(i => i.status === myIssuesFilter);
    // ✅ FIRST define this
// ✅ 1. define functions FIRST
const fetchIssues = async () => {
    try {
        const res = await fetch(`https://backendfullstack-production.up.railway.app/issues/user?userId=${currentUser.id}`);
        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error(err);
        setIssues([]);
    }
};

const refreshData = () => {
    fetchIssues();
    fetchWardAnnouncements();
};

// ✅ 2. THEN useEffect
useEffect(() => {
    if (!currentUser?.id) return;
    refreshData();
}, [currentUser]);
    return (
        <DashboardLayout 
            navLinks={navLinks} 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            headerTitle={getHeaderTitle()}
            notifCount={0}
            notificationClick={() => { 
  setActiveSection('feed'); 
}}
        >
            {/* FEED */}
            {activeSection === 'feed' && (
                <section className="animate-in">
                    <div className="section-header" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Updates Feed</h1>
                            <p style={{ marginTop: '4px' }}>
                                {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} from your representatives
                            </p>
                        </div>
                    </div>
                    <div>
                        {announcements.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📰</div><p>No announcements yet. Check back soon!</p></div>
                        ) : (
                            announcements.map(a => (
                                <div key={a.id} className="announcement-card animate-in">
                                    <div className="ann-header">
                                            <div className="ann-avatar">{a.politicianName?.charAt(0)}</div>
                                        <div>
                                            <div className="ann-politician">{a.politicianName}</div>
                                            <div className="ann-constituency">📍 {a.constituency || 'All Wards'}</div>
                                        </div>
                                        <small style={{ marginLeft: 'auto' }}>{new Date(a.timestamp).toLocaleString("en-IN")}</small>
                                    </div>
                                    <div className="ann-title">{a.title}</div>
                                    <div className="ann-content">{a.content}</div>
                                    
                                    <div className="ann-actions">

                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => likeAnn(a.id)}
                                    >
                                        👍 {a.likes || 0}
                                    </button>

                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* REPORT */}
            {activeSection === 'report' && (
                <section className="animate-in">
                    <div className="section-header" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Report an Issue</h1>
                            <p style={{ marginTop: '4px' }}>Submit a concern directly to your representative</p>
                        </div>
                    </div>
                    <div className="card" style={{ maxWidth: '660px' }}>
                        <form onSubmit={submitIssue}>
                            <div className="form-group">
                                <label className="form-label">Issue Title</label>
                                <input className="form-control" placeholder="Brief description of the problem" value={repTitle} onChange={e => setRepTitle(e.target.value)} required />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-control" value={repCat} onChange={e => setRepCat(e.target.value)}>
                                        <option value="Infrastructure">🛣️ Infrastructure</option>
                                        <option value="Health">❤️ Health</option>
                                        <option value="Education">📚 Education</option>
                                        <option value="Safety">🛡️ Safety</option>
                                        <option value="Environment">🌿 Environment</option>
                                        <option value="Other">📌 Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Urgency</label>
                                    <select className="form-control" value={repUrg} onChange={e => setRepUrg(e.target.value)}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows="5" placeholder="Describe the issue in detail — location, impact, how long it's been a problem..." value={repDesc} onChange={e => setRepDesc(e.target.value)}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="btn btn-primary">📢 Submit Report</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setRepTitle(''); setRepDesc(''); }}>Clear</button>
                            </div>
                        </form>
                    </div>
                </section>
            )}
            {/* MY ISSUES */}
            {activeSection === 'myissues' && (
                <section className="animate-in">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1>My Issues</h1>
                            <p style={{ marginTop: '4px' }}>Track the status of your reported concerns</p>
                        </div>
                        <div className="filter-bar" style={{ marginBottom: 0 }}>
                            <select className="form-control" style={{ width: 'auto' }} value={myIssuesFilter} onChange={e => setMyIssuesFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        {Array.isArray(filteredIssues) && filteredIssues.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <p>No issues found.</p>
                                </div>
                            ) : (
                                Array.isArray(filteredIssues) && filteredIssues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        responses={responses}
                                        onClick={(id) => openIssue(id)}
                                        onCommentClick={(issue) => {
                                            setSelectedIssue(issue);
                                            setOpenResponses(true);
                                        }}
                                        />
                                ))
                            )}
                    </div>
                </section>
            )}

            {/* PROFILE */}
            {activeSection === 'profile' && (
                <section className="animate-in">
                    <div className="section-header" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>My Profile</h1>
                            <p style={{ marginTop: '4px' }}>Manage your account details</p>
                        </div>
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
                               <input
  type="email"
  className="form-control"
  value={profEmail}
  disabled
  onChange={e => setProfEmail(e.target.value)}
/>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ward</label>
                                <input className="form-control" placeholder="e.g. North Ward" value={profWard} onChange={e => setProfWard(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password <small style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(leave blank to keep current)</small></label>
                                <input type="password" className="form-control" placeholder="••••••••" value={profPass} onChange={e => setProfPass(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                        </form>
                    </div>
                </section>
            )}
            {openResponses && selectedIssue && (
  <IssueModal
    issue={selectedIssue}
    responses={selectedResponses}
    onClose={() => setOpenResponses(false)}
  />
)}
        </DashboardLayout>
    );
}
