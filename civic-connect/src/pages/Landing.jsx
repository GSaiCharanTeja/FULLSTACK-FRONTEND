import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import './Landing.css';
import { useLocation } from 'react-router-dom';

export default function Landing() {
    const { currentUser,setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [selectedRole, setSelectedRole] = useState('citizen');
    const location = useLocation();
    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeSection, setActiveSection] = useState('queue');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regConst, setRegConst] = useState('');
    const [regError, setRegError] = useState('');
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [ward, setWard] = useState("");
      const [street, setStreet] = useState("");
      const [district, setDistrict] = useState("");
      const [state, setState] = useState("");
              
    
    const fillDemo = (email, pass) => {
        setLoginEmail(email);
        setLoginPassword(pass);
        setLoginError('');
        showToast('Demo account filled — click Sign In!', 'info');
    };
const [stats, setStats] = useState({
    totalIssues: 0,
    pending: 0
});
const checkEmailExists = async (email) => {
  try {
    const res = await fetch(
      `https://backendfullstack-production.up.railway.app/auth/check-email?email=${email}`
    );

    const data = await res.json();

    return data.exists === true; // 🔥 IMPORTANT
  } catch (err) {
    console.error(err);
    return false;
  }
};
const [allIssues, setAllIssues] = useState([]);
  // ✅ REGISTER HANDLER (FINAL)
const handleRegister = async (e) => {
  e.preventDefault();

  if (!regEmail.trim()) {
    setRegError("Email is required ❌");
    return;
  }

  if (regPassword !== regConfirm) {
    setRegError("Passwords do not match ❌");
    return;
  }

  try {
    console.log("Checking email:", regEmail);

    const exists = await checkEmailExists(regEmail.trim().toLowerCase());

    console.log("Exists:", exists);

    // 🔴 CRITICAL STOP
    if (exists) {
      setRegError("Email already registered ❌");
      return;
    }

    // ✅ ONLY NEW EMAIL → SEND OTP
    const res = await fetch(
      "https://backendfullstack-production.up.railway.app/auth/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase()
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setRegError(data.message || "Failed to send OTP ❌");
      return;
    }

    setOtpSent(true);
    showToast("OTP Sent ✅", "success");

  } catch (err) {
    console.error(err);
    setRegError("Server error ❌");
  }
};
const isOtpValid = otp.trim().length === 6;
const handleVerifyOtp = async () => {
  try {
    const res = await fetch(
      "https://backendfullstack-production.up.railway.app/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase(),
          otp: otp,
          name: regName,
          password: regPassword,
          role: selectedRole,
          wardNumber: ward ? Number(ward) : null,
          street: street,
          district: district,
          state: state
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setRegError(data.message);
      return;
    }

    // ✅ SUCCESS
    setVerified(true);
    showToast("Account created 🎉", "success");

    // ✅ SAVE USER (IMPORTANT)
    setCurrentUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    // ✅ NAVIGATE
    navigate(`/${data.role.toLowerCase()}`);

    // ✅ RESET AFTER EVERYTHING
    setOtpSent(false);
    setOtp("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegName("");
    setWard("");
    setStreet("");
    setDistrict("");
    setState("");

  } catch (err) {
    console.error(err);
    setRegError("Verification failed ❌");
  }
};
const handleLogin = async (e) => {
  e.preventDefault();

  if (!loginEmail || !loginPassword) {
    setLoginError("Email & Password required ❌");
    return;
  }

  try {
    const res = await fetch(
      "https://backendfullstack-production.up.railway.app/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        })
      }
    );

    const data = await res.json();

    // 🔥 HANDLE DEACTIVATED USER
    if (res.status === 403) {
      setLoginError(data.message || "Account is deactivated by admin ❌");
      return;
    }

    // 🔥 HANDLE WRONG CREDENTIALS
    if (res.status === 401) {
      setLoginError(data.message || "Invalid credentials ❌");
      return;
    }

    // 🔥 OTHER ERRORS
    if (!res.ok) {
      setLoginError("Something went wrong ❌");
      return;
    }

    // ✅ SUCCESS LOGIN
    const role = (data.role || "citizen").toLowerCase();

    setCurrentUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    navigate(`/${role}`);

  } catch (err) {
    console.error(err);
    setLoginError("Server error ❌");
  }
};
return (
        <>
            <div className="hero-bg"></div>
            <div className="grid-overlay"></div>

            <div className="landing">
                <div className="hero-left animate-in">
                    <div className="hero-logo">
                        <div className="hero-logo-icon">🏛️</div>
                        <span className="hero-logo-text">CivicConnect</span>
                    </div>
                    <div className="hero-tag">🔥 Civic Engagement Platform</div>
                    <h1 className="hero-h1">
                        Your Voice<br /><span>Shapes</span> Your<br />Community
                    </h1>
                    <p className="hero-p">
                        CivicConnect bridges the gap between citizens and elected representatives. Report issues, track
                        progress, and hold your government accountable — all in one transparent platform.
                    </p>
                    <div className="hero-features">
                        <div className="hero-feature">
                            <div className="hero-feature-dot" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>📢</div>
                            Report local issues directly to your representative
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-dot" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>💬</div>
                            Get real responses and track resolution status
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-dot" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>📊</div>
                            Stay informed with official announcements & updates
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-dot" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>🛡️</div>
                            Moderated platform ensuring respectful dialogue
                        </div>
                    </div>
                    <div className="hero-roles">
                        <div className="role-pill">👤 Citizen</div>
                        <div className="role-pill">🏛️ Politician</div>
                        <div className="role-pill">🛡️ Moderator</div>
                        <div className="role-pill">⚙️ Admin</div>
                    </div>
                </div>

                <div className="auth-panel">
                    <div className="auth-box">
                        <div className="mobile-logo animate-in">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div className="hero-logo-icon" style={{ width: '40px', height: '40px', fontSize: '20px' }}>🏛️</div>
                                <span className="hero-logo-text">CivicConnect</span>
                            </div>
                            <p style={{ margin: 0 }}>Bridging Citizens &amp; Representatives</p>
                        </div>

                        <div className="auth-tabs">
                            <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Sign In</button>
                            <button className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Create Account</button>
                        </div>

                        <div className="auth-card animate-in animate-in-delay-1">
                            {/* LOGIN */}
                            {activeTab === 'login' && (
                                <div className="auth-form active">
                                    <h2 className="auth-title">Welcome back 👋</h2>
                                    <p className="auth-subtitle">Sign in to your CivicConnect account</p>

                                    <div className="demo-accounts">
                                        <div className="demo-label">⚡ Quick Demo Login</div>
                                        
                                        <form onSubmit={handleLogin}>
  <div className="form-group">
    <label className="form-label">Email</label>
    <input
      type="email"
      className="form-control"
      placeholder="Enter your email"
      value={loginEmail}
      onChange={(e) => setLoginEmail(e.target.value)}
      required
    />
  </div>

  <div className="form-group">
    <label className="form-label">Password</label>
    <input
      type="password"
      className="form-control"
      placeholder="Enter your password"
      value={loginPassword}
      onChange={(e) => setLoginPassword(e.target.value)}
      required
    />
  </div>

  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
    🔓 Sign In
  </button>
</form>
                                    </div>

                                    {loginError && <div className="auth-error" style={{ display: 'block' }}>{loginError}</div>}
                                </div>
                            )}

                            {/* REGISTER */}
                            {activeTab === 'register' && (
                                <div className="auth-form active">
                                    <h2 className="auth-title">Join CivicConnect 🏛️</h2>
                                    <p className="auth-subtitle">Create your account and start engaging</p>

                                    {regError && <div className="auth-error" style={{ display: 'block' }}>{regError}</div>}
                                    <form onSubmit={handleRegister}>
                            
                                      

                                      {/* FULL NAME */}
                                      <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Your full name"
                                          value={regName}
                                          onChange={e => setRegName(e.target.value)}
                                          required
                                        />
                                      </div>

                                      {/* EMAIL */}
                                      <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                          type="email"
                                          className="form-control"
                                          placeholder="you@example.com"
                                          value={regEmail}
                                          onChange={(e) => setRegEmail(e.target.value)}
                                          disabled={otpSent}
                                          required
                                        />
                                      </div>

                                      {/* OTP */}
                                      {otpSent && (
                                        <div className="form-group">
                                          <label className="form-label">Enter OTP</label>
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                          />
                                        </div>
                                      )}

                                      {/* ROLE */}
                                      <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <div className="role-select-grid">
                                          <div
                                            className={`role-option ${selectedRole === 'citizen' ? 'selected' : ''}`}
                                            onClick={() => setSelectedRole('citizen')}
                                          >
                                            <span className="role-emoji">👤</span>
                                            <span className="role-name">Citizen</span>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Row 1 */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                      
                                      <div className="form-group">
                                        <label className="form-label">Ward</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Ward No"
                                          value={ward}
                                          onChange={(e) => setWard(e.target.value)}
                                        />
                                      </div>

                                      <div className="form-group">
                                        <label className="form-label">Street</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Street Name"
                                          value={street}
                                          onChange={(e) => setStreet(e.target.value)}
                                        />
                                      </div>

                                    </div>

                                    {/* Row 2 */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>

                                      <div className="form-group">
                                        <label className="form-label">District</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="District"
                                          value={district}
                                          onChange={(e) => setDistrict(e.target.value)}
                                        />
                                      </div>

                                      <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="State"
                                          value={state}
                                          onChange={(e) => setState(e.target.value)}
                                        />
                                      </div>

                                    </div>

                                      {/* PASSWORD */}
                                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Password</label>
                                          <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Min. 6 chars"
                                            value={regPassword}
                                            onChange={e => setRegPassword(e.target.value)}
                                            required
                                          />
                                        </div>

                                        <div className="form-group">
                                          <label className="form-label">Confirm Password</label>
                                          <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Repeat password"
                                            value={regConfirm}
                                            onChange={e => setRegConfirm(e.target.value)}
                                            required
                                          />
                                        </div>
                                      </div>

                                      {/* 🔥 BUTTON FLOW */}
                                      {!otpSent ? (
                                        <button
                                          type="button"
                                          className="btn btn-primary"
                                          style={{ width: "100%" }}
                                          onClick={handleRegister}
                                        >
                                          Send OTP
                                        </button>
                                      ) : !verified ? (
                                        <button
                                      type="button"
                                      className="btn btn-warning"
                                      style={{ width: "100%" }}
                                      onClick={handleVerifyOtp}
                                      disabled={!isOtpValid}
                                    >
                                      Verify OTP
                                    </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn btn-success"
                                          style={{ width: "100%", marginTop: "10px" }}
                                         
                                        >
                                          Create Account
                                        </button>
                                      )}

                                    </form>
                                    
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
