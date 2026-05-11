import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { getAdminAnalytics, getAdminModelStatus, getAllUsers } from "../../services/api";
import Users from "./Users";               // 👈 Import Users component
import Analytics from "./Analytics";       // 👈 Import Analytics
import Logs from "./Logs";                 // 👈 Import Logs
import ModelControl from "./ModelControl"; // 👈 Import ModelControl
import Settings from "./Settings";         // 👈 Import Settings

const colors = {
  primary: '#001845',
  secondary: '#023E7D',
  accent: '#0466C8',
  muted: '#5C677D',
  white: '#ffffff',
  lightBg: '#f8fafc',
  border: '#e2e8f0'
};

const numberFormatter = new Intl.NumberFormat('en-US');

const emptyOverviewMetrics = {
  totalUsers: 0,
  totalPredictions: 0,
  modelAccuracy: null,
  pendingAdmins: 0,
  updatedAt: null
};

const formatCount = (value) => numberFormatter.format(Number(value) || 0);
const formatAccuracy = (value) => Number.isFinite(value) ? `${value.toFixed(1)}%` : 'N/A';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'users', 'analytics', 'logs', 'model', 'settings'
  const [overviewMetrics, setOverviewMetrics] = useState(emptyOverviewMetrics);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  useEffect(() => {
    if (activeSection !== 'overview') return undefined;

    let isMounted = true;

    const loadOverviewMetrics = async () => {
      if (isMounted) setOverviewError('');

      const [usersResult, analyticsResult, modelResult] = await Promise.allSettled([
        getAllUsers(),
        getAdminAnalytics('90d'),
        getAdminModelStatus()
      ]);

      if (!isMounted) return;

      const usersPayload = usersResult.status === 'fulfilled' ? usersResult.value.data : null;
      const users = Array.isArray(usersPayload?.users) ? usersPayload.users : [];
      const analyticsMetrics = analyticsResult.status === 'fulfilled'
        ? analyticsResult.value.data?.metrics
        : null;
      const modelStatus = modelResult.status === 'fulfilled'
        ? modelResult.value.data?.status
        : null;

      setOverviewMetrics({
        totalUsers: usersPayload?.count ?? (usersPayload ? users.length : analyticsMetrics?.totalUsers ?? 0),
        totalPredictions: modelStatus?.metadata?.totalPredictions ?? analyticsMetrics?.totalPredictions ?? 0,
        modelAccuracy: Number.isFinite(modelStatus?.accuracy) ? modelStatus.accuracy : null,
        pendingAdmins: users.filter((item) => item.role === 'admin' && !item.approved).length,
        updatedAt: new Date()
      });

      if ([usersResult, analyticsResult, modelResult].every((result) => result.status === 'rejected')) {
        setOverviewError('Could not refresh live overview metrics.');
      }

      setOverviewLoading(false);
    };

    loadOverviewMetrics();
    const timer = setInterval(loadOverviewMetrics, 15000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [activeSection]);

  // Only logout on explicit user action
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Prevent logout on browser back navigation
  // Remove any useEffect or logic that logs out on popstate or navigation
  // (No such logic found here, so nothing to remove)

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Manage Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'model', label: 'Model Control', icon: '🤖' },
    { id: 'logs', label: 'System Logs', icon: '📁' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const overviewCards = [
    {
      label: 'Total Users',
      value: formatCount(overviewMetrics.totalUsers),
      icon: '👥',
      note: 'Registered accounts'
    },
    {
      label: 'Predictions',
      value: formatCount(overviewMetrics.totalPredictions),
      icon: '📊',
      note: 'Stored prediction records'
    },
    {
      label: 'Model Accuracy',
      value: formatAccuracy(overviewMetrics.modelAccuracy),
      icon: '🎯',
      note: overviewMetrics.modelAccuracy === null ? 'Model not trained yet' : 'Latest trained model'
    },
    {
      label: 'Pending Admins',
      value: formatCount(overviewMetrics.pendingAdmins),
      icon: '⏳',
      note: 'Awaiting approval'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>FCCPS Admin</div>
        <div style={styles.userMenu}>
          <span style={styles.userName}>{user?.name}</span>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                backgroundColor: activeSection === item.id ? colors.accent : 'transparent'
              }}
              onClick={() => setActiveSection(item.id)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activeSection === item.id ? colors.accent : 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeSection === item.id ? colors.accent : 'transparent'}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main style={styles.content}>
          {activeSection === 'overview' && (
            <>
              <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>Dashboard Overview</h2>
                <p style={styles.pageSubtitle}>
                  {overviewMetrics.updatedAt
                    ? `Live metrics refreshed at ${overviewMetrics.updatedAt.toLocaleTimeString()}`
                    : 'Loading live metrics...'}
                </p>
              </div>
              {overviewError && <div style={styles.errorBanner}>{overviewError}</div>}
              <div style={styles.statsGrid}>
                {overviewCards.map((card) => (
                  <div key={card.label} style={styles.statCard}>
                    <div style={styles.statIcon}>{card.icon}</div>
                    <div>
                      <p style={styles.statLabel}>{card.label}</p>
                      <p style={styles.statValue}>{overviewLoading ? '...' : card.value}</p>
                      <p style={styles.statNote}>{card.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionTitle}>Quick Actions</div>
              <div style={styles.actionsGrid}>
                <div style={styles.actionCard}>
                  <h4 style={styles.actionTitle}>👥 Manage Bank Users</h4>
                  <p style={styles.actionDesc}>Create, update or delete bank accounts</p>
                  <button style={styles.actionBtn} onClick={() => setActiveSection('users')}>Go to Users</button>
                </div>
                <div style={styles.actionCard}>
                  <h4 style={styles.actionTitle}>📊 View Analytics</h4>
                  <p style={styles.actionDesc}>Check system usage and model performance</p>
                  <button style={styles.actionBtn} onClick={() => setActiveSection('analytics')}>View Reports</button>
                </div>
                <div style={styles.actionCard}>
                  <h4 style={styles.actionTitle}>🤖 Retrain Model</h4>
                  <p style={styles.actionDesc}>Update prediction model with new data</p>
                  <button style={styles.actionBtn} onClick={() => setActiveSection('model')}>Start Training</button>
                </div>
                <div style={styles.actionCard}>
                  <h4 style={styles.actionTitle}>📁 System Logs</h4>
                  <p style={styles.actionDesc}>Monitor admin activities and errors</p>
                  <button style={styles.actionBtn} onClick={() => setActiveSection('logs')}>View Logs</button>
                </div>
              </div>
            </>
          )}

          {/* Render the corresponding component based on activeSection */}
          {activeSection === 'users' && <Users />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'logs' && <Logs />}
          {activeSection === 'model' && <ModelControl />}
          {activeSection === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

// Styles (same as before, but we might need to ensure placeholder styling exists)
const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: colors.primary,
    color: colors.white,
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: colors.white,
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 6,
    color: colors.white,
    cursor: 'pointer',
    fontWeight: 600,
    transition: '0.2s',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: 260,
    background: colors.secondary,
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.1)',
  },
  navItem: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    color: colors.white,
    fontSize: '1rem',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: '0.2s',
    borderLeft: '4px solid transparent',
  },
  navIcon: {
    fontSize: '1.3rem',
    width: 28,
  },
  content: {
    flex: 1,
    padding: '32px',
    background: '#f1f5f9',
    overflowY: 'auto',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.primary,
    margin: 0,
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageSubtitle: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '0.95rem',
    color: colors.muted,
  },
  errorBanner: {
    marginBottom: '16px',
    padding: '10px 12px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#b91c1c',
    fontSize: '0.9rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: colors.white,
    borderRadius: 12,
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
  },
  statIcon: {
    fontSize: '2.5rem',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.primary,
    margin: 0,
  },
  statNote: {
    marginTop: '4px',
    marginBottom: 0,
    fontSize: '0.8rem',
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: colors.primary,
    marginBottom: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    background: colors.white,
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  actionTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: colors.primary,
    marginBottom: '8px',
  },
  actionDesc: {
    fontSize: '0.9rem',
    color: colors.muted,
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  actionBtn: {
    padding: '8px 16px',
    background: colors.accent,
    color: colors.white,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    transition: '0.2s',
  },
  placeholder: {
    background: colors.white,
    borderRadius: 12,
    padding: '48px',
    textAlign: 'center',
    color: colors.muted,
    border: `1px solid ${colors.border}`,
  }
};

export default AdminDashboard;
