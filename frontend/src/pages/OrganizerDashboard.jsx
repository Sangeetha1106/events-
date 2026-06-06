import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getOwnEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventBookings,
  getOrganizerBookings
} from '../api/event.api';

// --- INLINE SVG ICONS FOR SIDEBAR & BUTTONS ---
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
);
const IconEvents = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconParticipants = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const OrganizerDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, events, create-event, update-event, participants, settings
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [eventSearch, setEventSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [filterEventId, setFilterEventId] = useState('all');

  // Form states for Create/Edit
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
    ticketPrice: '',
    seatLimit: ''
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Modals / Details view
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Load dashboard data (events and bookings)
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsResponse = await getOwnEvents();
      const bookingsResponse = await getOrganizerBookings();
      
      if (eventsResponse.success) {
        setEvents(eventsResponse.data || []);
      }
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetching error:", err);
      setError("Failed to fetch dashboard data. Please reload the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- METRICS CALCULATIONS ---
  const totalEvents = events.length;
  
  const activeEvents = events.filter(e => {
    if (!e.date) return false;
    const eventDate = new Date(e.date + 'T23:59:59'); // end of day
    const today = new Date();
    today.setHours(0,0,0,0);
    return eventDate >= today;
  }).length;

  const totalRegistrations = bookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);

  // --- CRUD OPERATORS ---
  const handleOpenCreateForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      image: '',
      ticketPrice: '0.00',
      seatLimit: '100'
    });
    setEditingEventId(null);
    setFormError(null);
    setFormSuccess(false);
    setActiveView('create-event');
  };

  const handleOpenEditForm = (evt) => {
    setEventForm({
      title: evt.title || '',
      description: evt.description || '',
      date: evt.date || '',
      time: evt.time || '',
      location: evt.location || '',
      image: evt.image || '',
      ticketPrice: evt.ticketPrice || '0.00',
      seatLimit: evt.seatLimit || '100'
    });
    setEditingEventId(evt.id);
    setFormError(null);
    setFormSuccess(false);
    setActiveView('update-event');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setFormSubmitting(true);

    try {
      const payload = {
        ...eventForm,
        ticketPrice: parseFloat(eventForm.ticketPrice) || 0,
        seatLimit: parseInt(eventForm.seatLimit) || 0
      };

      let response;
      if (editingEventId) {
        response = await updateEvent(editingEventId, payload);
      } else {
        response = await createEvent(payload);
      }

      if (response.success) {
        setFormSuccess(true);
        setTimeout(() => {
          setActiveView('events');
          loadDashboardData();
        }, 1200);
      } else {
        setFormError(response.message || "Failed to save event information.");
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Error submitting form");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEventClick = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deleteEvent(deleteTargetId);
      if (res.success) {
        setDeleteTargetId(null);
        loadDashboardData();
      } else {
        alert("Failed to delete event: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred deleting event");
    }
  };

  // --- FILTERS & SEARCHES ---
  const filteredEvents = events.filter(evt => {
    const term = eventSearch.toLowerCase();
    return (
      evt.title?.toLowerCase().includes(term) ||
      evt.location?.toLowerCase().includes(term) ||
      evt.description?.toLowerCase().includes(term)
    );
  });

  const filteredBookings = bookings.filter(book => {
    const term = participantSearch.toLowerCase();
    const matchesSearch = 
      book.Attender?.fullName?.toLowerCase().includes(term) ||
      book.Attender?.email?.toLowerCase().includes(term) ||
      book.Event?.title?.toLowerCase().includes(term);

    const matchesEventFilter = filterEventId === 'all' || book.eventId === filterEventId;
    return matchesSearch && matchesEventFilter;
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))',
      color: '#f3f4f6'
    }}>
      
      {/* SIDEBAR PANEL */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--panel-border)',
        background: 'rgba(15, 17, 28, 0.7)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)',
              boxShadow: '0 0 10px var(--primary-color)'
            }}></span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              XTOWN Event
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>Org</span>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                background: activeView === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeView === 'dashboard' ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', transition: 'var(--transition-smooth)',
                borderLeft: activeView === 'dashboard' ? '3px solid var(--primary-color)' : '3px solid transparent'
              }}
            >
              <IconDashboard /> Dashboard
            </button>

            <button 
              onClick={() => setActiveView('events')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                background: (activeView === 'events' || activeView === 'create-event' || activeView === 'update-event') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: (activeView === 'events' || activeView === 'create-event' || activeView === 'update-event') ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', transition: 'var(--transition-smooth)',
                borderLeft: (activeView === 'events' || activeView === 'create-event' || activeView === 'update-event') ? '3px solid var(--primary-color)' : '3px solid transparent'
              }}
            >
              <IconEvents /> Events Directory
            </button>

            <button 
              onClick={() => setActiveView('participants')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                background: activeView === 'participants' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeView === 'participants' ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', transition: 'var(--transition-smooth)',
                borderLeft: activeView === 'participants' ? '3px solid var(--primary-color)' : '3px solid transparent'
              }}
            >
              <IconParticipants /> Registrations
            </button>

            <button 
              onClick={() => setActiveView('bookings')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                background: activeView === 'bookings' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeView === 'bookings' ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', transition: 'var(--transition-smooth)',
                borderLeft: activeView === 'bookings' ? '3px solid var(--primary-color)' : '3px solid transparent'
              }}
            >
              <IconParticipants /> Bookings
            </button>

            <button 
              onClick={() => setActiveView('settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                background: activeView === 'settings' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeView === 'settings' ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                textAlign: 'left', cursor: 'pointer', transition: 'var(--transition-smooth)',
                borderLeft: activeView === 'settings' ? '3px solid var(--primary-color)' : '3px solid transparent'
              }}
            >
              <IconSettings /> Profile Settings
            </button>
          </nav>
        </div>

        {/* Profile / Logout area */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organizer Portal</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username || 'Event Partner'}
            </p>
          </div>
          <button 
            className="btn-secondary" 
            onClick={handleLogout}
            style={{
              padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#fca5a5', transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <IconLogout /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT VIEW */}
      <main style={{
        flex: 1,
        padding: '2.5rem 3rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: 'calc(100% - 260px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        
        {/* Header Block */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Organizer Mode</span>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(to right, #ffffff, #9ca3af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {activeView === 'dashboard' && 'Dashboard Overview'}
              {activeView === 'events' && 'Events Inventory'}
              {activeView === 'create-event' && 'Create Event'}
              {activeView === 'update-event' && 'Edit Event Properties'}
              {activeView === 'participants' && 'Participant Registry'}
              {activeView === 'bookings' && 'Bookings Overview'}
              {activeView === 'settings' && 'Organizer Settings'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage scheduling, bookings, pricing, and details
            </p>
          </div>

          {activeView === 'events' && (
            <button className="btn-primary" onClick={handleOpenCreateForm}>
              + Create New Event
            </button>
          )}
        </header>

        {error && (
          <div style={{
            padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '5rem', gap: '1rem', color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)',
              borderTopColor: 'var(--primary-color)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Synching secure organizer records...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* VIEW 1: DASHBOARD HOME */}
            {activeView === 'dashboard' && (
              <>
                {/* Metric grid */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Managed Events</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>{totalEvents}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created via this portal</span>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active & Upcoming</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>{activeEvents}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✔ Date is in future or today</span>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid var(--accent-pink)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>{totalRegistrations}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tickets sold across events</span>
                  </div>
                </section>

                {/* Main panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                  {/* Recent Events */}
                  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upcoming Events Portfolio</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Overview of scheduled meetings, gigs, and conferences</p>
                      </div>
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setActiveView('events')}>
                        View All
                      </button>
                    </div>

                    {events.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No events registered yet.</p>
                        <button className="btn-primary" onClick={handleOpenCreateForm}>+ Create First Event</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.slice(0, 4).map(evt => {
                          const eventBookings = bookings.filter(b => b.eventId === evt.id);
                          const seatsFilled = eventBookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
                          
                          return (
                            <div key={evt.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {evt.image ? (
                                  <img src={evt.image} alt={evt.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                                       onError={e => e.currentTarget.style.display = 'none'} />
                                ) : (
                                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}>
                                    {evt.title ? evt.title.substring(0, 2).toUpperCase() : 'EV'}
                                  </div>
                                )}
                                <div>
                                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evt.title}</h4>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    📅 {evt.date} {evt.time ? `• ⏰ ${evt.time}` : ''} • 📍 {evt.location}
                                  </span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                                  {seatsFilled} / {evt.seatLimit || '∞'} Booked
                                </span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                  Price: ${Number(evt.ticketPrice).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* System Information / Statistics panel */}
                  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button className="btn-primary" style={{ width: '100%' }} onClick={handleOpenCreateForm}>
                        + Add New Event
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActiveView('participants')}>
                        Export Booking Data
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActiveView('settings')}>
                        View Profile Credentials
                      </button>
                    </div>

                    <div style={{
                      marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                    }}>
                      <p>🚀 <strong>Status</strong>: Online</p>
                      <p>🛡 <strong>Authentication</strong>: JWT Protected</p>
                      <p>📁 <strong>Database State</strong>: Synced</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: EVENTS INVENTORY LIST */}
            {activeView === 'events' && (
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Event Database</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Filter, view, edit or delete events</p>
                  </div>
                  
                  <div style={{ width: '100%', maxWidth: '350px' }}>
                    <input 
                      type="text" 
                      placeholder="Search event name, location..." 
                      value={eventSearch}
                      onChange={e => setEventSearch(e.target.value)}
                    />
                  </div>
                </div>

                {filteredEvents.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '5rem 2rem', gap: '1rem', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '12px'
                  }}>
                    <p style={{ color: 'var(--text-muted)' }}>No matching events found.</p>
                    <button className="btn-primary" onClick={handleOpenCreateForm}>Create An Event Now</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredEvents.map(evt => {
                      const eventBookings = bookings.filter(b => b.eventId === evt.id);
                      const registrations = eventBookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
                      
                      return (
                        <div key={evt.id} className="glass-panel" style={{
                          overflow: 'hidden', display: 'flex', flexDirection: 'column',
                          background: 'rgba(26, 27, 46, 0.4)', transition: 'var(--transition-smooth)'
                        }}>
                          {evt.image ? (
                            <img src={evt.image} alt={evt.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                                 onError={e => e.currentTarget.style.display = 'none'} />
                          ) : (
                            <div style={{
                              width: '100%', height: '160px',
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.15)' }}>XTOWN</span>
                            </div>
                          )}

                          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>{evt.title}</h4>
                                <span className="badge badge-indigo" style={{ whiteSpace: 'nowrap' }}>${Number(evt.ticketPrice).toFixed(2)}</span>
                              </div>
                              <p style={{
                                color: 'var(--text-muted)', fontSize: '0.85rem', display: '-webkit-box',
                                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.6rem',
                                lineHeight: '1.2rem', marginBottom: '0.8rem'
                              }}>
                                {evt.description || "No description provided."}
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <div>📅 <strong>Date</strong>: {evt.date}</div>
                                <div>⏰ <strong>Time</strong>: {evt.time || 'N/A'}</div>
                                <div>📍 <strong>Venue</strong>: {evt.location}</div>
                                <div>🎟 <strong>Registrations</strong>: {registrations} / {evt.seatLimit || 'Unlimited'}</div>
                              </div>
                            </div>

                            <div style={{
                              display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                              paddingTop: '1rem', marginTop: 'auto'
                            }}>
                              <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                                      onClick={() => setSelectedEventDetails(evt)}>
                                <IconInfo /> Details
                              </button>
                              <button className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      onClick={() => handleOpenEditForm(evt)}>
                                <IconEdit />
                              </button>
                              <button className="btn-secondary" style={{ padding: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      onClick={() => handleDeleteEventClick(evt.id)}>
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3 & 4: CREATE / EDIT EVENT FORM */}
            {(activeView === 'create-event' || activeView === 'update-event') && (
              <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  {editingEventId ? 'Modify Event Settings' : 'Schedule New Public Event'}
                </h3>

                {formError && (
                  <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    ✔ Event information updated and saved successfully! Redirecting...
                  </div>
                )}

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Name *</label>
                      <input 
                        type="text" 
                        name="title" 
                        value={eventForm.title} 
                        onChange={handleFormChange} 
                        placeholder="e.g. Annual Tech Symposium" 
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location / Venue *</label>
                      <input 
                        type="text" 
                        name="location" 
                        value={eventForm.location} 
                        onChange={handleFormChange} 
                        placeholder="e.g. Auditorium Hall B / Online" 
                        required 
                      />
                    </div>

                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date *</label>
                      <input 
                        type="date" 
                        name="date" 
                        value={eventForm.date} 
                        onChange={handleFormChange} 
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Time</label>
                      <input 
                        type="text" 
                        name="time" 
                        value={eventForm.time} 
                        onChange={handleFormChange} 
                        placeholder="e.g. 18:00 or 2:00 PM" 
                      />
                    </div>

                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket Price ($) *</label>
                      <input 
                        type="number" 
                        name="ticketPrice" 
                        step="0.01" 
                        value={eventForm.ticketPrice} 
                        onChange={handleFormChange} 
                        placeholder="0.00" 
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capacity / Seat Limit *</label>
                      <input 
                        type="number" 
                        name="seatLimit" 
                        value={eventForm.seatLimit} 
                        onChange={handleFormChange} 
                        placeholder="e.g. 100" 
                        required 
                      />
                    </div>

                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Banner/Image URL</label>
                    <input 
                      type="text" 
                      name="image" 
                      value={eventForm.image} 
                      onChange={handleFormChange} 
                      placeholder="e.g. https://images.unsplash.com/photo-..." 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Description</label>
                    <textarea 
                      name="description" 
                      rows="4" 
                      value={eventForm.description} 
                      onChange={handleFormChange} 
                      placeholder="Provide detailed description of the sessions, requirements, and information..." 
                      style={{
                        width: '100%', padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff',
                        fontFamily: 'var(--font-family)', fontSize: '0.95rem', resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setActiveView('events')} disabled={formSubmitting}>
                      Discard
                    </button>
                    <button type="submit" className="btn-primary" disabled={formSubmitting}>
                      {formSubmitting ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 5: PARTICIPANTS / BOOKINGS REGISTRY */}
            {activeView === 'participants' && (
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Attendees</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full record of ticket sales and bookings</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', flexWrap: 'wrap' }}>
                    {/* Event Filter */}
                    <select
                      value={filterEventId}
                      onChange={e => setFilterEventId(e.target.value)}
                      style={{
                        padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px',
                        color: '#fff', fontSize: '0.9rem', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="all" style={{ background: '#111322' }}>All Events</option>
                      {events.map(e => (
                        <option key={e.id} value={e.id} style={{ background: '#111322' }}>{e.title}</option>
                      ))}
                    </select>

                    {/* Participant Search */}
                    <input 
                      type="text" 
                      placeholder="Search attendee email, name, event..." 
                      value={participantSearch}
                      onChange={e => setParticipantSearch(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px'
                  }}>
                    <p style={{ color: 'var(--text-muted)' }}>No registration records matches this criteria.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <th style={{ padding: '1rem' }}>Attendee Name</th>
                          <th style={{ padding: '1rem' }}>Email Address</th>
                          <th style={{ padding: '1rem' }}>Event Name</th>
                          <th style={{ padding: '1rem' }}>Tickets</th>
                          <th style={{ padding: '1rem' }}>Total Paid</th>
                          <th style={{ padding: '1rem' }}>Booking Date</th>
                          <th style={{ padding: '1rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((book) => (
                          <tr key={book.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition-smooth)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>
                              {book.Attender?.fullName || 'Guest Attendee'}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                              {book.Attender?.email || 'N/A'}
                            </td>
                            <td style={{ padding: '1rem', color: '#fff' }}>
                              {book.Event?.title || 'Unknown Event'}
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>
                              {book.quantity}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                              ${Number(book.totalPrice).toFixed(2)}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`badge ${book.status === 'Confirmed' ? 'badge-cyan' : 'badge-indigo'}`}>
                                {book.status || 'Confirmed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5.5: BOOKINGS OVERVIEW */}
            {activeView === 'bookings' && (
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ticket Bookings</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View live bookings and registration details for your events</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px', flexWrap: 'wrap' }}>
                    {/* Event Filter */}
                    <select
                      value={filterEventId}
                      onChange={e => setFilterEventId(e.target.value)}
                      style={{
                        padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px',
                        color: '#fff', fontSize: '0.9rem', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="all" style={{ background: '#111322' }}>All Events</option>
                      {events.map(e => (
                        <option key={e.id} value={e.id} style={{ background: '#111322' }}>{e.title}</option>
                      ))}
                    </select>

                    {/* Participant Search */}
                    <input 
                      type="text" 
                      placeholder="Search bookings..." 
                      value={participantSearch}
                      onChange={e => setParticipantSearch(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px'
                  }}>
                    <p style={{ color: 'var(--text-muted)' }}>No bookings matches this criteria.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <th style={{ padding: '1rem' }}>Attendee Name</th>
                          <th style={{ padding: '1rem' }}>Email Address</th>
                          <th style={{ padding: '1rem' }}>Location</th>
                          <th style={{ padding: '1rem' }}>Event Name</th>
                          <th style={{ padding: '1rem' }}>Total Cost</th>
                          <th style={{ padding: '1rem' }}>Booking Date</th>
                          <th style={{ padding: '1rem' }}>Payment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((book) => (
                          <tr key={book.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition-smooth)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>
                              {book.fullName || book.Attender?.fullName || 'Guest Attendee'}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                              {book.email || book.Attender?.email || 'N/A'}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                              {book.location || 'N/A'}
                            </td>
                            <td style={{ padding: '1rem', color: '#fff' }}>
                              {book.Event?.title || 'Unknown Event'}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                              ${Number(book.totalPrice || book.Event?.ticketPrice || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`badge ${book.paymentStatus === 'Paid' ? 'badge-cyan' : 'badge-indigo'}`}>
                                {book.paymentStatus || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 6: PROFILE SETTINGS */}
            {activeView === 'settings' && (
              <div className="glass-panel animate-scale" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  Account Profile
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                      width: '70px', height: '70px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--accent-pink))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', fontWeight: 800
                    }}>
                      {user?.username ? user.username.substring(0, 2).toUpperCase() : 'OP'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{user?.username || 'Partner Account'}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registered XTOWN Event Manager</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account Role</span>
                      <span className="badge badge-indigo">{user?.role || 'Organizer'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Login Identifier / Email</span>
                      <span style={{ color: '#fff', fontSize: '0.9rem' }}>{user?.username || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Security Policy</span>
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>JWT Authenticated Token</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      To update your organization credentials or contact info, please contact the system administrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* --- EVENT DETAILS MODAL --- */}
      {selectedEventDetails && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 6, 15, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem', position: 'relative' }}>
            <button 
              onClick={() => setSelectedEventDetails(null)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent',
                border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer'
              }}
            >
              ×
            </button>

            {selectedEventDetails.image && (
              <img src={selectedEventDetails.image} alt={selectedEventDetails.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />
            )}

            <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Event Specs</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
              {selectedEventDetails.title}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5rem', marginBottom: '1.5rem' }}>
              {selectedEventDetails.description || "No description provided."}
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
              background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', marginBottom: '1.5rem'
            }}>
              <div>📅 <strong>Date</strong>: {selectedEventDetails.date}</div>
              <div>⏰ <strong>Time</strong>: {selectedEventDetails.time || 'N/A'}</div>
              <div>📍 <strong>Location</strong>: {selectedEventDetails.location}</div>
              <div>🎟 <strong>Ticket Price</strong>: ${Number(selectedEventDetails.ticketPrice).toFixed(2)}</div>
              <div>👥 <strong>Max Capacity</strong>: {selectedEventDetails.seatLimit || 'Unlimited'}</div>
              <div>🛠 <strong>Created On</strong>: {new Date(selectedEventDetails.createdAt).toLocaleDateString()}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setSelectedEventDetails(null)}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const target = selectedEventDetails;
                  setSelectedEventDetails(null);
                  handleOpenEditForm(target);
                }}
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG MODAL --- */}
      {deleteTargetId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 6, 15, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '440px', padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.2rem auto'
            }}>
              ⚠
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Confirm Event Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              Are you sure you want to delete this event? This action cannot be undone. All active registrations and booking records related to this event will be impacted.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ background: 'var(--error)', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }} onClick={confirmDeleteEvent}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizerDashboard;
