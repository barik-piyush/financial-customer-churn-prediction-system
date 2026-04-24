import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import {
  changeAdminPassword,
  getAdminAnalytics,
  logoutAllDevices,
  updateAdminProfile,
} from '../../services/api';
import Users from './Users';
import Analytics from './Analytics';
import Logs from './Logs';
import ModelControl from './ModelControl';

const AdminDashboard = () => {
  const { user, logout, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [overview, setOverview] = useState({ totalUsers: 0, totalPredictions: 0, avgConfidence: 0, pendingAdmins: 0 });
  const [settingsMessage, setSettingsMessage] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    let timer;

    const fetchOverview = async () => {
      try {
        const res = await getAdminAnalytics('24h');
        setOverview(res.data.metrics || {});
      } catch {
        // silently ignore to keep UI responsive
      }
    };

    fetchOverview();
    timer = setInterval(fetchOverview, 10000); // real-time-ish polling

    return () => clearInterval(timer);
  }, []);

  const colors = useMemo(() => {
    if (isDarkMode) {
      return {
        bg: '#0f172a', panel: '#111827', text: '#f8fafc', subText: '#94a3b8', accent: '#3b82f6', border: '#1f2937'
      };
    }

    return {
      bg: '#f1f5f9', panel: '#ffffff', text: '#0f172a', subText: '#64748b', accent: '#2563eb', border: '#e2e8f0'
    };
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateAdminProfile(profileForm);
      updateUserProfile({ name: res.data.user.name, email: res.data.user.email });
      setSettingsMessage('Profile updated successfully.');
    } catch (error) {
      setSettingsMessage(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changeAdminPassword(passwordForm);
      setSettingsMessage('Password updated. Please login again.');
      logout();
      navigate('/login');
    } catch (error) {
      setSettingsMessage(error.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices();
      logout();
      navigate('/login');
    } catch (error) {
      setSettingsMessage(error.response?.data?.message || 'Failed to logout from all devices.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
        <strong>FCCPS Admin</strong>
        <div>
          <span style={{ marginRight: 12 }}>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        <aside style={{ width: 230, borderRight: `1px solid ${colors.border}`, padding: 12 }}>
          {['overview', 'users', 'analytics', 'model', 'logs', 'settings'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              style={{ display: 'block', width: '100%', marginBottom: 8, padding: 10, background: activeSection === item ? colors.accent : 'transparent', color: activeSection === item ? '#fff' : colors.text, border: `1px solid ${colors.border}`, borderRadius: 8 }}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: 20 }}>
          {activeSection === 'overview' && (
            <>
              <h2>Dashboard Overview</h2>
              <div style={{ marginBottom: 16 }}>
                <button onClick={() => setIsDarkMode((prev) => !prev)}>
                  Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 12 }}>
                <Card title="Total Users" value={overview.totalUsers} colors={colors} />
                <Card title="Predictions" value={overview.totalPredictions} colors={colors} />
                <Card title="Avg Confidence" value={`${overview.avgConfidence || 0}%`} colors={colors} />
                <Card title="Pending Admin Requests" value={overview.pendingAdmins} colors={colors} />
              </div>
              <small style={{ color: colors.subText }}>Pending Admin Requests updates every 10 seconds from backend analytics.</small>
            </>
          )}

          {activeSection === 'users' && <Users />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'logs' && <Logs />}
          {activeSection === 'model' && <ModelControl />}

          {activeSection === 'settings' && (
            <div>
              <h2>Admin Settings</h2>
              {settingsMessage && <p>{settingsMessage}</p>}

              <form onSubmit={handleProfileUpdate} style={panelStyle(colors)}>
                <h3>Update Admin Profile</h3>
                <input placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                <input placeholder="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} style={{ marginLeft: 8 }} />
                <button type="submit" style={{ marginLeft: 8 }}>Update Profile</button>
              </form>

              <form onSubmit={handlePasswordChange} style={panelStyle(colors)}>
                <h3>Change Password</h3>
                <input placeholder="Current Password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
                <input placeholder="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} style={{ marginLeft: 8 }} />
                <button type="submit" style={{ marginLeft: 8 }}>Change Password</button>
              </form>

              <div style={panelStyle(colors)}>
                <h3>Session Management</h3>
                <p>Logout from all devices.</p>
                <button onClick={handleLogoutAll}>Logout All Devices</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const panelStyle = (colors) => ({
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
});

const Card = ({ title, value, colors }) => (
  <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14 }}>
    <div style={{ color: colors.subText, fontSize: 13 }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: 700 }}>{value ?? 0}</div>
  </div>
);

export default AdminDashboard;
