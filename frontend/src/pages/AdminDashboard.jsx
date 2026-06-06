import React, { useEffect, useState } from 'react';
import { getOrganizers, createOrganizer } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formContact, setFormContact] = useState('');
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        organizationName: formName,
        email: formEmail,
        password: formPassword,
        contactNumber: formContact
      };
      
      const res = await createOrganizer(payload);
      if (res && res.success) {
        setModalSuccess(true);
        // Reset form
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormContact('');
        
        // Refresh organizer list
        fetchOrganizers();
        
        // Auto close modal after 1.5s
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess(false);
        }, 1500);
      } else {
        setModalError(res.message || "Failed to create organizer");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Event Portal Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Welcome back, <strong style={{ color: '#fff' }}>{user?.username || 'Super Admin'}</strong>
          </p>
        </div>
        
        <button className="btn-secondary" onClick={handleLogout} style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', transition: 'var(--transition-smooth)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          Sign Out
        </button>
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
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem' }}>Organization</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>Contact Number</th>
                  <th style={{ padding: '1rem' }}>Assigned Role</th>
                  <th style={{ padding: '1rem' }}>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>{org.organizationName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{org.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{org.contactNumber || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-indigo">{org.role || 'Organizer'}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Register Event Partner
            </h3>
            
            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                ✔ Organizer credentials registered successfully!
              </div>
            )}

            <form onSubmit={handleCreateOrganizer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
    </div>
  );
};

export default AdminDashboard;
