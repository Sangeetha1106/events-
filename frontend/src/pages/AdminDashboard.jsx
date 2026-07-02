import React, { useEffect, useState } from 'react';
import { getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formOrganizerName, setFormOrganizerName] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formContact, setFormContact] = useState('');
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editOrganizerName, setEditOrganizerName] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const response = await getOrganizers(); 
      // The response structure is { success: true, message: "...", data: [...] }
      if (response && response.success) {
        setOrganizers(response.data || []);
      } else {
        setOrganizers([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch admin data. Are you sure you're authorized?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(false);
    setSubmitting(true);

    try {
      const payload = {
        organizerName: formOrganizerName,
        organizationName: formName,
        email: formEmail,
        password: formPassword,
        contactNumber: formContact
      };
      
      const res = await createOrganizer(payload);
      if (res && res.success) {
        setModalSuccess(true);
        // Reset form
        setFormOrganizerName('');
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormContact('');
        
        // Refresh organizer list
        fetchOrganizers();
        
        // Auto close modal after 3s
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess(false);
        }, 3000);
      } else {
        setModalError(res.message || "Failed to create organizer");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (org) => {
    setEditError(null);
    setEditSuccess(false);
    setEditId(org.id);
    setEditOrganizerName(org.organizerName || '');
    setEditName(org.organizationName || '');
    setEditEmail(org.email || '');
    setEditContact(org.contactNumber || '');
    setEditStatus(org.status || 'Active');
    setIsEditModalOpen(true);
  };

  const handleEditOrganizer = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);
    setEditSubmitting(true);

    try {
      const payload = {
        organizerName: editOrganizerName,
        organizationName: editName,
        email: editEmail,
        contactNumber: editContact,
        status: editStatus
      };

      const res = await updateOrganizer(editId, payload);
      if (res && res.success) {
        setEditSuccess(true);
        fetchOrganizers();
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(false);
        }, 2000);
      } else {
        setEditError(res.message || "Failed to update organizer");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteError(null);
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOrganizer = async () => {
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      const res = await deleteOrganizer(deleteId);
      if (res && res.success) {
        fetchOrganizers();
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        setDeleteError(res.message || "Failed to delete organizer");
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filter list by searchQuery
  const filteredOrganizers = organizers.filter(org => {
    const term = searchQuery.toLowerCase();
    return (
      org.organizationName?.toLowerCase().includes(term) ||
      org.email?.toLowerCase().includes(term) ||
      org.contactNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER SECTION */}
      <header className="glass-panel animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', gap: '1rem' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Admin Area</span>
          <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Event Portal Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Welcome back, <strong style={{ color: 'var(--text-title)' }}>{user?.username || 'Super Admin'}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <button className="btn-secondary" onClick={handleLogout} style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', transition: 'var(--transition-smooth)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            Sign Out
          </button>
        </div>
      </header>

      {/* METRIC CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel animate-fade" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Organizers</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            {loading ? '...' : organizers.length}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✔ Sync with DB Successful</span>
        </div>

        <div className="glass-panel animate-fade" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Security Policy</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0' }}>Role-Based Access</h2>
          <span className="badge badge-cyan" style={{ alignSelf: 'flex-start' }}>Admin Authorization</span>
        </div>

        <div className="glass-panel animate-fade" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--accent-pink)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Platform Actions</span>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
            + Register Organizer
          </button>
        </div>

      </section>

      {/* ORGANIZERS TABLE SECTION */}
      <main className="glass-panel animate-fade" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Authorized Partners</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View and manage registered event managers & organizers</p>
          </div>
          
          <div style={{ width: '100%', maxWidth: '350px' }}>
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading Partner Accounts...
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No organizer accounts found</p>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Create One Now</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-strong)' }}>
                  <th style={{ padding: '1rem' }}>Organizer Name</th>
                  <th style={{ padding: '1rem' }}>Organization</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>Phone Number</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Created Date</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td data-label="Organizer Name" style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-title)' }}>{org.organizerName}</td>
                    <td data-label="Organization" style={{ padding: '1rem', color: 'var(--text-muted)' }}>{org.organizationName}</td>
                    <td data-label="Email Address" style={{ padding: '1rem', color: 'var(--text-muted)' }}>{org.email}</td>
                    <td data-label="Phone Number" style={{ padding: '1rem', color: 'var(--text-muted)' }}>{org.contactNumber || 'N/A'}</td>
                    <td data-label="Status" style={{ padding: '1rem' }}>
                      <span className={`badge ${org.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{
                        background: org.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: org.status === 'Active' ? '#10b981' : '#ef4444',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {org.status || 'Active'}
                      </span>
                    </td>
                    <td data-label="Created Date" style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td data-label="Actions" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => openEditModal(org)} 
                          title="Edit Organizer"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => openDeleteModal(org.id)} 
                          title="Delete Organizer"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREATE ORGANIZER DIALOG MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 6, 15, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '480px', padding: '2rem', position: 'relative' }}>
            <h3 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Create Organizer Account
            </h3>
            
            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Organizer account created successfully. Login credentials have been sent to the organizer's email address.
              </div>
            )}

            <form onSubmit={handleCreateOrganizer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Organizer Name</label>
                <input 
                  type="text" 
                  value={formOrganizerName} 
                  onChange={e => setFormOrganizerName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Organization Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  placeholder="e.g. Dream Events Corp" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Primary Email Address</label>
                <input 
                  type="email" 
                  value={formEmail} 
                  onChange={e => setFormEmail(e.target.value)} 
                  placeholder="e.g. partner@dreamevents.com" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Default Password</label>
                <input 
                  type="password" 
                  value={formPassword} 
                  onChange={e => setFormPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Contact Number (Optional)</label>
                <input 
                  type="tel" 
                  value={formContact} 
                  onChange={e => setFormContact(e.target.value)} 
                  placeholder="e.g. +1 (555) 019-2834" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORGANIZER DIALOG MODAL */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 6, 15, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '480px', padding: '2rem', position: 'relative' }}>
            <h3 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Edit Organizer Settings
            </h3>
            
            {editError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}

            {editSuccess && (
              <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Organizer updated successfully.
              </div>
            )}

            <form onSubmit={handleEditOrganizer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Organizer Name</label>
                <input 
                  type="text" 
                  value={editOrganizerName} 
                  onChange={e => setEditOrganizerName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Organization Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Contact Number</label>
                <input 
                  type="tel" 
                  value={editContact} 
                  onChange={e => setEditContact(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</label>
                <select 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-title)',
                    outline: 'none',
                  }}
                >
                  <option value="Active" style={{ background: '#0f172a' }}>Active</option>
                  <option value="Inactive" style={{ background: '#0f172a' }}>Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={editSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 6, 15, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-title)' }}>
              Delete Organizer
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this organizer account? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteSubmitting}>
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDeleteOrganizer} 
                disabled={deleteSubmitting}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: deleteSubmitting ? 0.7 : 1
                }}
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
