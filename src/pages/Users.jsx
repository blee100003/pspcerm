import React, { useState, useEffect } from 'react';
import { User, Shield, Trash2, Key, Clock, Plus, X, UserCog, Eye, EyeOff, Info } from 'lucide-react';
import '../styles/hr.css'; // Reusing HR styles for consistent modal/table look
import API_BASE_URL from '../config';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Selected User for actions
    const [selectedUser, setSelectedUser] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);

    // Forms
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const loadUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/users/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to create user');

            setShowAddModal(false);
            setFormData({ username: '', password: '', role: 'user', fullName: '', email: '', phone: '', dob: '' });
            setShowPassword(false);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete user');
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setShowPassword(false);
        setShowPasswordModal(true);
        setShowPasswordModal(true);
    };

    const openDetailsModal = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/password/`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ password: newPassword })
            });
            if (!res.ok) throw new Error('Failed to change password');

            alert('Password changed successfully');
            setShowPasswordModal(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChangeRole = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/role/`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) throw new Error('Failed to change role');

            alert('Role updated successfully');
            setShowRoleModal(false);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const openActivityModal = async (user) => {
        setSelectedUser(user);
        setShowActivityModal(true);
        setActivityLogs([]); // Clear previous
        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}/activity/`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setActivityLogs(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="page-content">Loading...</div>;
    if (error) return <div className="page-content" style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>User Management</h2>
                <button className="btn btn-primary" onClick={() => { setShowAddModal(true); setShowPassword(false); }}>
                    <Plus size={16} /> Add User
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {user.username}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.role === 'admin' ? 'active' : 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                        {user.role === 'admin' && <Shield size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="action-btn" title="Activity Log" onClick={() => openActivityModal(user)}>
                                            <Clock size={16} />
                                        </button>
                                        <button className="action-btn" title="View Details" onClick={() => openDetailsModal(user)}>
                                            <Info size={16} />
                                        </button>
                                        <button className="action-btn" title="Change Role" onClick={() => openRoleModal(user)}>
                                            <UserCog size={16} />
                                        </button>
                                        <button className="action-btn" title="Change Password" onClick={() => openPasswordModal(user)}>
                                            <Key size={16} />
                                        </button>
                                        <button className="action-btn delete" title="Delete User" onClick={() => handleDelete(user.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', margin: '1.5rem', padding: '30px', borderRadius: '12px' }}>
                        <div className="modal-header" style={{ marginBottom: '20px' }}>
                            <h3>Add New User</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" value={formData.dob || ''} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ margin: '1.5rem', padding: '30px', borderRadius: '12px' }}>
                        <div className="modal-header" style={{ marginBottom: '20px' }}>
                            <h3>Change Password for {selectedUser?.username}</h3>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>New Password</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showRoleModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ margin: '1.5rem' }}>
                        <div className="modal-header">
                            <h3>Change Role for {selectedUser?.username}</h3>
                            <button className="close-btn" onClick={() => setShowRoleModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleChangeRole}>
                            <div className="form-group">
                                <label>Select Role</label>
                                <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activity Log Modal */}
            {showActivityModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', margin: '1.5rem', padding: '30px', borderRadius: '12px' }}>
                        <div className="modal-header" style={{ marginBottom: '20px' }}>
                            <h3>Activity Log: {selectedUser?.username}</h3>
                            <button className="close-btn" onClick={() => setShowActivityModal(false)}><X size={20} /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {activityLogs.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No activity recorded.</p>
                            ) : (
                                <table className="data-table" style={{ fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Details</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs.map(log => (
                                            <tr key={log.id}>
                                                <td><span className="status-badge" style={{ background: '#f0f0f0', color: '#333' }}>{log.action}</span></td>
                                                <td>{log.details}</td>
                                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowActivityModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px', margin: '1.5rem', padding: '30px', borderRadius: '12px' }}>
                        <div className="modal-header" style={{ marginBottom: '20px' }}>
                            <h3>User Details</h3>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}><X size={20} /></button>
                        </div>
                        <div className="details-grid" style={{ display: 'grid', gap: '15px' }}>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Username</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedUser.username}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Full Name</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedUser.fullName || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Email</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedUser.email || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Role</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500', textTransform: 'capitalize' }}>{selectedUser.role}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Phone</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedUser.phone || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Date of Birth</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px', display: 'block' }}>Date Joined</label>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{new Date(selectedUser.date_joined).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
