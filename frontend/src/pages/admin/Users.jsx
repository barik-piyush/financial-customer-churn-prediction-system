import React, { useEffect, useMemo, useState } from 'react';
import {
  approveUser,
  assignUserRole,
  deleteUser,
  getAllUsers,
  resetUserPassword,
  updateUserStatus,
} from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const pendingCount = useMemo(() => users.filter((u) => u.role === 'admin' && !u.approved).length, [users]);

  const onApprove = async (userId) => {
    try {
      await approveUser(userId);
      setMessage({ type: 'success', text: 'User approved successfully.' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Approval failed.' });
    }
  };

  const onToggleStatus = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, !isActive);
      setMessage({ type: 'success', text: `User ${isActive ? 'deactivated' : 'activated'} successfully.` });
      loadUsers();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update user status.' });
    }
  };

  const onDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      await deleteUser(userId);
      setMessage({ type: 'success', text: 'User deleted successfully.' });
      loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Delete failed.' });
    }
  };

  const onResetPassword = async (userId) => {
    const newPassword = window.prompt('Enter new password (min 6 chars)', 'Temp@123456');
    if (!newPassword) return;

    try {
      await resetUserPassword(userId, newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Password reset failed.' });
    }
  };

  const onAssignRole = async (userId, accessRole) => {
    try {
      await assignUserRole(userId, accessRole);
      setMessage({ type: 'success', text: `Role updated to ${accessRole}.` });
      loadUsers();
    } catch {
      setMessage({ type: 'error', text: 'Failed to assign role.' });
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>Manage Users</h2>
      <p>View all users, activate/deactivate, delete, reset password, and assign roles.</p>
      <p><strong>Pending admin approvals:</strong> {pendingCount}</p>

      {message.text && (
        <div style={{ padding: 10, marginBottom: 12, borderRadius: 8, background: message.type === 'success' ? '#dcfce7' : '#fee2e2' }}>
          {message.text}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Status</th>
              <th style={th}>Approval</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={td}>{user.name}</td>
                <td style={td}>{user.email}</td>
                <td style={td}>
                  <select
                    value={user.accessRole || (user.role === 'admin' ? 'Admin' : 'Viewer')}
                    onChange={(e) => onAssignRole(user._id, e.target.value)}
                  >
                    <option>Admin</option>
                    <option>Analyst</option>
                    <option>Viewer</option>
                  </select>
                </td>
                <td style={td}>{user.isActive === false ? 'Inactive' : 'Active'}</td>
                <td style={td}>{user.approved ? 'Approved' : 'Pending'}</td>
                <td style={td}>
                  {!user.approved && user.role === 'admin' && <button onClick={() => onApprove(user._id)}>Approve</button>}
                  <button onClick={() => onToggleStatus(user._id, user.isActive !== false)} style={{ marginLeft: 8 }}>
                    {user.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button onClick={() => onResetPassword(user._id)} style={{ marginLeft: 8 }}>Reset Password</button>
                  <button onClick={() => onDelete(user._id)} style={{ marginLeft: 8, color: '#b91c1c' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const th = { textAlign: 'left', padding: '12px', borderBottom: '1px solid #ddd' };
const td = { padding: '12px', borderBottom: '1px solid #eee' };

export default Users;
