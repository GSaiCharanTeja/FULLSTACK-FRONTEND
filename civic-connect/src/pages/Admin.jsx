import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { getStatusBadgeData, getCatIcon, getCatClass } from '../utils/helpers';
export default function Admin() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    
    // Data state
    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [anns, setAnns] = useState([]);
    const [flags, setFlags] = useState([]);
    
    // Users Filter
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    
    // Issues Filter
    const [issSearch, setIssSearch] = useState('');
    const [issStatusFilter, setIssStatusFilter] = useState('all');

    // Edit User Modal
    const [editUser, setEditUser] = useState(null);
    const [euName, setEuName] = useState('');
    const [euEmail, setEuEmail] = useState('');
    const [euRole, setEuRole] = useState('citizen');
    const [euConst, setEuConst] = useState('');
    const [euActive, setEuActive] = useState(true);
    const [euPass, setEuPass] = useState('');
    const [auWardNumber, setAuWardNumber] = useState("");
    const [auStreet, setAuStreet] = useState("");
    const [auDistrict, setAuDistrict] = useState("");
    const [auState, setAuState] = useState("");
    const [auPincode,setAuPincode]=useState("");

    // Add User Modal
    const [showAddUser, setShowAddUser] = useState(false);
    const [auName, setAuName] = useState('');
    const [auEmail, setAuEmail] = useState('');
    const [auPass, setAuPass] = useState('');
    const [auRole, setAuRole] = useState('citizen');
    const [auConst, setAuConst] = useState('')
    const refreshData = async () => {
  try {
    const usersRes = await fetch("https://backendfullstack-production.up.railway.app/auth/users");
    const usersData = await usersRes.json();
    setUsers(usersData);

    const issuesRes = await fetch("https://backendfullstack-production.up.railway.app/issues");
    const issuesData = await issuesRes.json();
    setIssues(issuesData);

    const flagsRes = await fetch("https://backendfullstack-production.up.railway.app/flags");
    const flagsData = await flagsRes.json();
    setFlags(flagsData);

  } catch (err) {
    console.error(err);
  }
};
    useEffect(() => {
        refreshData();
        const handleUpdate = () => refreshData();
        window.addEventListener('local-storage-update', handleUpdate);
        return () => window.removeEventListener('local-storage-update', handleUpdate);
    }, []);

    // ... user mgmt
  const openEditModal = (u) => {
  setEditUser(u);

  setEuName(u.name || "");
  setEuEmail(u.email || "");
  setEuRole(u.role?.toLowerCase() || "citizen");
  setEuConst(u.constituency || "");
  setEuPass("");

  // 🔥 IMPORTANT FIX (handle string/boolean)
  setEuActive(u.active === true || u.active === "true");
};
    const navLinks = [
        { type: 'label', label: 'Platform' },
        { id: 'overview', icon: '📊', label: 'Overview' },
        { id: 'users', icon: '👥', label: 'User Management' },
        { id: 'issues', icon: '📋', label: 'All Issues' },
        { id: 'data', icon: '🗄️', label: 'Data Controls' }
    ];
    const fetchAnnouncements = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/announcements");
    const data = await res.json();
    setAnns(data);
  } catch (err) {
    console.error(err);
  }
};
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};
const exportData = () => {
  try {
    const data = {
      users: users,   // you can add more later (issues, etc.)
      exportedAt: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "civicconnect-data.json";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("Data exported successfully ✅");
  } catch (err) {
    console.error(err);
    alert("Export failed ❌");
  }
};
const clearAllData = async () => {
  const confirmDelete = window.confirm(
    "⚠️ This will DELETE ALL USERS permanently.\nAre you sure?"
  );

  if (!confirmDelete) return;

  try {
    await fetch("https://backendfullstack-production.up.railway.app/auth/users/clear-all", {
      method: "DELETE"
    });

    alert("All data cleared 💀");
    await refreshData(); // refresh UI
  } catch (err) {
    console.error(err);
    alert("Error clearing data ❌");
  }
};
const timeAgo = () => "Just now";
const resetData = async () => {
  try {
    await fetch("https://backendfullstack-production.up.railway.app/users/reset", {
      method: "POST"
    });

    alert("Data reset successfully ✅");
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert("Error resetting data ❌");
  }
};
const storageInfo = {
  rows: [],
  total: 0
};
    const fetchIssues = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/issues");
    const data = await res.json();
    setIssues(data);
  } catch (err) {
    console.error(err);
  }
};
    // Overview Stats
    const open = issues.filter(i => i.status === 'open').length;
    const res = issues.filter(i => i.status === 'resolved').length;
    const prog = issues.filter(i => i.status === 'in-progress').length;
    const roles = ['citizen', 'politician', 'moderator', 'admin'];

    const roleCounts = roles.map(r => ({ r, n: users.filter(u => u.role?.toLowerCase() === r).length }));
    const maxR = Math.max(...roleCounts.map(x => x.n), 1);
    const cats = ['Infrastructure', 'Health', 'Education', 'Safety', 'Environment', 'Other'];
    const catCounts = cats.map(c => ({ c, n: issues.filter(i => i.category === c).length }));
    const maxC = Math.max(...catCounts.map(x => x.n), 1);
    const maxIS = Math.max(open, prog, res, 1);

    // Filtered Users
    const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    const role = u.role?.toLowerCase();
    const filter = userRoleFilter?.toLowerCase();

    if (filter !== 'all' && role !== filter) return false;

    if (userSearch) {
        const ls = userSearch.toLowerCase();
        return (
            u.name?.toLowerCase().includes(ls) ||
            u.email?.toLowerCase().includes(ls)
        );
    }

    return true;
});
    // Data Stats
    const getStorageInfo = () => {
        let total = 0;
        const rows = keys.map(k => {
            const raw = localStorage.getItem(k) || '';
            total += raw.length;
            return { k, len: raw.length };
        });
        return { rows:[], total };
    };


    const getHeaderTitle = () => {
  switch (activeSection) {
    case "users":
      return "User Management";
    case "issues":
      return "All Issues";
    case "data":
      return "Data Controls";
    default:
      return "Overview";
  }
};
    const filteredIssues = issues.filter(i => {
  if (issStatusFilter !== 'all' && i.status !== issStatusFilter) return false;

  if (issSearch) {
    const ls = issSearch.toLowerCase();
    return i.title?.toLowerCase().includes(ls);
  }

  return true;
});
// 🔥 Calculate storage size of users data
const calculateStorage = () => {
  if (!users || users.length === 0) return "0.00";

  const data = JSON.stringify(users);
  const sizeInBytes = new Blob([data]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);

  return sizeInKB;
};
 const fetchUsers = async () => {
  try {
    const res = await fetch("https://backendfullstack-production.up.railway.app/auth/users");
    const data = await res.json();

    console.log("Users:", data);

    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setUsers([]);
    }

  } catch (err) {
    console.error(err);
    setUsers([]);
  }
};
const handleCreateUser = async () => {
  if (!auName.trim() || !auEmail.trim() || !auPass.trim()) {
    alert("Please fill all required fields");
    return;
  }

  try {
    const userData = {
      name: auName.trim(),
      email: auEmail.trim().toLowerCase(),
      password: auPass,
      role: auRole.toUpperCase(),
      wardNumber: auWardNumber ? Number(auWardNumber) : null,
      pincode: auPincode ? Number(auPincode) : null,
      street: auStreet || "",
      district: auDistrict || "",
      state: auState || "",
    };

    const res = await fetch(
      "https://backendfullstack-production.up.railway.app/auth/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      }
    );

   const data = await res.json();

if (!res.ok) {
  alert(data.message || "Failed to create user ❌");
  return;
}

    alert("User Created ✅");

    await refreshData();
    setShowAddUser(false);
    resetAddUserForm();

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
};
const deleteUser = async (id) => {
  const confirmDelete = window.confirm("Are you sure to delete this user?");
  if (!confirmDelete) return;

  try {
    await fetch(`https://backendfullstack-production.up.railway.app/auth/users/${id}`, {
      method: "DELETE"
    });

    alert("User deleted successfully ✅");
    await fetchUsers(); // refresh table
  } catch (err) {
    console.error(err);
    alert("Error deleting user ❌");
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
const saveUser = async () => {
  try {
    const res = await fetch(
      `https://backendfullstack-production.up.railway.app/auth/users/${editUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: euName,
          email: euEmail,
          role: euRole.toUpperCase(),
          wardNumber: euWardNumber ? Number(euWardNumber) : null,
          street: euStreet,
          district: euDistrict,
          state: euState
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Update failed ❌");
      return;
    }

    alert("User updated successfully ✅");

    setEditUser(null);
    await fetchUsers();

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
};
const adminDeleteIssue = async (id) => {
  try {
    await fetch(`https://backendfullstack-production.up.railway.app/issues/${id}`, {
      method: "DELETE"
    });

    alert("Issue deleted ✅");
    await fetchIssues();

  } catch (err) {
    console.error(err);
    alert("Error deleting issue ❌");
  }
};
const resetAddUserForm = () => {
  setAuName("");
  setAuEmail("");
  setAuPass("");
  setAuRole("citizen");
  setAuWardNumber("");
  setAuStreet("");
  setAuDistrict("");
  setAuState("");
  setAuPincode("");
};
    return (
        <DashboardLayout 
            navLinks={navLinks} 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            headerTitle={getHeaderTitle()}
        >
            {/* OVERVIEW */}
            {activeSection === 'overview' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Platform Overview</h1>
                            <p style={{ marginTop: '4px' }}>Real-time snapshot of CivicConnect</p>
                        </div>
                    </div>
                    <div className="stats-grid">
                        {[
                            { icon: '👥', val: users.length, label: 'Total Users', cls: 'blue' },
                            { icon: '📋', val: issues.length, label: 'Total Issues', cls: 'purple' },
                            { icon: '✅', val: res, label: 'Resolved', cls: 'green' },
                            { icon: '🔴', val: open, label: 'Open Issues', cls: 'red' },
                            { icon: '📣', val: anns.length, label: 'Announcements', cls: 'amber' },
                            { icon: '🚩', val: flags.length, label: 'Pending Flags', cls: 'red' },
                        ].map((s, idx) => (
                            <div key={idx} className="stat-card animate-in">
                                <div className={`card-icon ${s.cls}`} style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>{s.icon}</div>
                                <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Users by Role</span><div className="card-icon purple">👥</div></div>
                            <div className="bar-chart-wrap">
                                {roleCounts.map(({ r, n }) => (
                                    <div key={r} className="bar-chart-row">
                                        <div className="bar-chart-label" style={{ textTransform: 'capitalize' }}>{r}</div>
                                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxR) * 100}%` }}></div></div>
                                        <div className="bar-value">{n}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Issues by Category</span><div className="card-icon blue">🗂️</div></div>
                            <div className="bar-chart-wrap">
                                {catCounts.filter(x => x.n > 0).length > 0 ? catCounts.filter(x => x.n > 0).map(({ c, n }) => (
                                    <div key={c} className="bar-chart-row">
                                        <div className="bar-chart-label" style={{ fontSize: '0.75rem' }}>{c}</div>
                                        <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxC) * 100}%` }}></div></div>
                                        <div className="bar-value">{n}</div>
                                    </div>
                                )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px' }}>No data.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ marginTop: '16px' }}>
                        <div className="card-header"><span className="card-title">Issue Resolution Rate</span><div className="card-icon green">✅</div></div>
                        <div className="bar-chart-wrap">
                            {[
                                ['Open', open, '#f59e0b'], ['In Progress', prog, '#3b82f6'], ['Resolved', res, '#10b981']
                            ].map(([l, v, c]) => (
                                <div key={l} className="bar-chart-row">
                                    <div className="bar-chart-label">{l}</div>
                                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(v / maxIS) * 100}%`, background: c }}></div></div>
                                    <div className="bar-value">{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* USERS */}
            {activeSection === 'users' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1>User Management</h1>
                            <p style={{ marginTop: '4px' }}>Manage accounts, roles, and access</p>
                        </div>

                        <button
  onClick={() => {
    resetAddUserForm();
    setShowAddUser(true);
  }}
  style={{
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  ➕ Add User
</button>
                    </div>
                    <div className="filter-bar">
                        <div className="search-wrap" style={{ flex: 1 }}>
                            <span className="search-icon">🔍</span>
                            <input className="form-control" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                        </div>
                        <select className="form-control" style={{ width: 'auto' }} value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="citizen">Citizen</option>
                            <option value="politician">Politician</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="table-wrap">
                        <div className="responsive-table">
                            <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>   
                                    <th>WardNumber</th>
                                    <th>Street</th>
                                    <th>District</th>
                                    <th>State</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No users found.</td></tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.id}>
                                    {/* Name */}
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '0.75rem' }}>
                                            {u.name?.charAt(0)}
                                        </div>
                                        {u.name}
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td>{u.email}</td>

                                    {/* Role */}
                                    <td>
                                        <span className={`badge badge-${u.role?.toLowerCase()}`}>
                                        {u.role}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    
                                  
                                    {/* Ward */}
                                    <td>{u.wardNumber || "-"}</td>

                                    {/* Street */}
                                    <td>{u.street || "-"}</td>

                                    {/* District */}
                                    <td>{u.district || "-"}</td>

                                    {/* State */}
                                    <td>{u.state || "-"}</td>

                                    {/* Actions */}
                                    <td>
                                        

                                        <button
                                        className="btn btn-danger btn-xs"
                                        onClick={() => deleteUser(u.id)}
                                        >
                                        🗑️
                                        </button>
                                    </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </div>
                        
                    </div>
                </section>
            )}

            {/* ALL ISSUES */}
            {activeSection === 'issues' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div><h1>All Issues</h1></div>
                        <div className="filter-bar" style={{ marginBottom: 0 }}>
                            <div className="search-wrap">
                                <span className="search-icon">🔍</span>
                                <input className="form-control" placeholder="Search..." value={issSearch} onChange={e => setIssSearch(e.target.value)} />
                            </div>
                            <select className="form-control" style={{ width: 'auto' }} value={issStatusFilter} onChange={e => setIssStatusFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        {filteredIssues.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📋</div><p>No issues found.</p></div>
                        ) : (
                            filteredIssues.map(i => (
                                <div key={i.id} className="issue-card">
                                    <div className="issue-top">
                                        <div className={`issue-cat-icon ${getCatClass(i.category)}`}>{getCatIcon(i.category)}</div>
                                        <div className="issue-meta">
                                            <div className="issue-title">{i.title}</div>
                                            <div className="issue-excerpt">{i.description}</div>
                                        </div>
                                        <span className={`badge ${getStatusBadgeData(i.status).class}`}>{getStatusBadgeData(i.status).name}</span>
                                    </div>
                                    <div className="issue-footer">
                                        <span className="issue-info">👤 {i.citizenName}</span>
                                        <span className="issue-info">📍 {i.constituency}</span>
                                        <button className="btn btn-danger btn-xs" onClick={() => adminDeleteIssue(i.id)}>🗑️ Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* DATA */}
            {activeSection === 'data' && (
                <section className="animate-in">
                    <div className="section-header mb-6" style={{ marginBottom: '24px' }}>
                        <div>
                            <h1>Data Controls</h1>
                            <p style={{ marginTop: '4px' }}>Manage platform data integrity</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Export Data</span><div className="card-icon blue">📤</div></div>
                            <p style={{ marginBottom: '16px' }}>Download all platform data as a JSON file for backup or analysis.</p>
                            <button className="btn btn-primary" onClick={exportData}>
                            ⬇️ Export JSON
                            </button>
                        </div>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Reset Demo Data</span><div className="card-icon amber">🔄</div></div>
                            <p style={{ marginBottom: '16px' }}>Clear all data and reload the original demo seed data.</p>
                            <button className="btn btn-danger btn-sm" onClick={resetData}>⚠️ Reset to Demo</button>
                        </div>
                        <div className="card">
                            <div className="card-header"><span className="card-title">Clear All Data</span><div className="card-icon red">🗑️</div></div>
                            <p style={{ marginBottom: '16px' }}>Permanently delete all users, issues, and platform data.</p>
                            <button className="btn btn-danger btn-sm" onClick={clearAllData}>💀 Clear Everything</button>
                        </div>
                    </div>
                    <div className="card" style={{ marginTop: '16px' }}>
                        <div className="card-header"><span className="card-title">Storage Usage</span><div className="card-icon green">💾</div></div>
                        <div>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead><tr><th style={{ textAlign: 'left' }}>Key</th><th style={{ textAlign: 'left' }}>Size</th></tr></thead>
                                <tbody>
                                    {storageInfo.rows.map(r => (
                                        <tr key={r.k}><td>{r.k}</td><td style={{ color: 'var(--text-secondary)' }}>{r.len} chars</td></tr>
                                    ))}
                                </tbody>
                            </table>

                            <p style={{ marginTop: '12px' }}>Total: <strong>{(storageInfo.total / 1024).toFixed(2)} KB</strong></p>

                                <div className="text-muted">
                                Total: {calculateStorage()} KB
                                </div>
                        </div>
                    </div>
                </section>
            )}
            {/* Add User Modal */}
            {showAddUser && (
                <div className="modal-overlay open" onClick={(e) => {
  if (e.target === e.currentTarget) setShowAddUser(false);
}}>
  <div className="modal">

    {/* HEADER */}
    <div className="modal-header">
      <span className="modal-title">Add New User</span>
      <button className="modal-close" onClick={() => setShowAddUser(false)}>✕</button>
    </div>

    {/* BODY */}
    <div className="modal-body">

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className="form-control" value={auName} onChange={e => setAuName(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-control" type="email" value={auEmail} onChange={e => setAuEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input className="form-control" type="password" value={auPass} onChange={e => setAuPass(e.target.value)} />
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-control" value={auRole} onChange={e => setAuRole(e.target.value)}>
            <option value="politician">Politician</option>
            <option value="moderator">Moderator</option>
         
          </select>
        </div>
        <div className="form-group">
        <label className="form-label">Ward Number</label>
        <input className="form-control" value={auWardNumber} onChange={e => setAuWardNumber(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Street</label>
        <input className="form-control" value={auStreet} onChange={e => setAuStreet(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">District</label>
        <input className="form-control" value={auDistrict} onChange={e => setAuDistrict(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">State</label>
        <input className="form-control" value={auState} onChange={e => setAuState(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Pincode</label>
        <input className="form-control" value={auPincode} onChange={e => setAuPincode(e.target.value)} />
      </div>

      </div>
    </div>

    {/* FOOTER */}
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={() => setShowAddUser(false)}>
        Cancel
      </button>

      <button className="btn btn-primary" onClick={handleCreateUser}>
        ➕ Create User
      </button>
    </div>

  </div>
</div>
            )}
        </DashboardLayout>
    );
}
