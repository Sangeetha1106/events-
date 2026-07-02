import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicEvents } from '../api/event.api';
import ThemeToggle from '../components/ThemeToggle';
import {
  getAttenderProfile,
  updateAttenderProfile,
  getAttenderBookingHistory,
  bookTickets,
  getAttenderOrganizers
} from '../api/attender.api';

// Custom inline SVG icons for sidebar and UI
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
);
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path></svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const IconTicket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path><line x1="13" y1="5" x2="13" y2="19"></line></svg>
);

const AttenderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, organizers, events, bookings, profile

  // Core Data States
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({ fullName: '', email: '', phoneNumber: '' });
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search Filter Queries
  const [eventSearch, setEventSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');

  // Modals & Detail Overlays
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

  // Booking Flow Controls
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Profile Form Edit States
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Carousel State & Data
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselSlides = [
    {
      image: '/banners/banner1.png',
      title: 'Discover Amazing Events',
      subtitle: 'Find and book the best events happening around you. From concerts to conferences, we have it all.',
      cta: 'Book Now',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(6,182,212,0.85))'
    },
    {
      image: '/banners/banner2.png',
      title: 'Live Music & Concerts',
      subtitle: 'Experience electrifying performances from top artists. Get your tickets before they sell out!',
      cta: 'Get Tickets',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.85), rgba(6,182,212,0.85))'
    },
    {
      image: '/banners/banner3.png',
      title: 'Premium Weddings & Galas',
      subtitle: 'Celebrate life\'s most beautiful moments at exclusive venues with world-class hospitality.',
      cta: 'Reserve Seats',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.85), rgba(245,158,11,0.85))'
    },
    {
      image: '/banners/banner4.png',
      title: 'Tech Conferences 2026',
      subtitle: 'Connect with industry leaders, explore innovations, and shape the future of technology.',
      cta: 'Register Now',
      gradient: 'linear-gradient(135deg, rgba(79,70,229,0.85), rgba(147,51,234,0.85))'
    }
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % carouselSlides.length);

  // Security check: redirect immediately if not authorized
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load all initial stats and records
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Profile
      const profileRes = await getAttenderProfile();
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        setProfileForm({
          fullName: profileRes.data.fullName || '',
          email: profileRes.data.email || '',
          phoneNumber: profileRes.data.phoneNumber || '',
          password: '',
          confirmPassword: ''
        });
      }

      // Fetch Organizers
      const orgsRes = await getAttenderOrganizers();
      if (orgsRes.success) {
        setOrganizers(orgsRes.data || []);
      }

      // Fetch Events
      const eventsRes = await getPublicEvents();
      if (eventsRes.success) {
        setEvents(eventsRes.data || []);
      }

      // Fetch Bookings
      const bookingsRes = await getAttenderBookingHistory();
      if (bookingsRes.success) {
        setBookings(bookingsRes.data || []);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Logout Handler
  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const payload = {
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber
      };

      if (profileForm.password) {
        payload.password = profileForm.password;
      }

      const res = await updateAttenderProfile(payload);
      if (res.success) {
        setProfileSuccess(true);
        setProfile(res.data);
        setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setProfileError(res.message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || "Error saving changes.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Booking Checkout Submission (Navigates to Payment Page)
  const handleBookingConfirm = (e) => {
    e.preventDefault();
    if (!selectedEvent || ticketQuantity < 1) return;
    
    // Navigate to payment page with booking details in state
    navigate(`/attender/payment/${selectedEvent.id}`, {
      state: {
        eventId: selectedEvent.id,
        ticketQuantity: ticketQuantity,
        attendeeName: profileForm.fullName,
        attendeeEmail: profileForm.email,
        eventDetails: selectedEvent
      }
    });
  };

  // Filters
  const filteredEvents = events.filter(evt => {
    const term = eventSearch.toLowerCase();
    return (
      evt.title?.toLowerCase().includes(term) ||
      evt.location?.toLowerCase().includes(term) ||
      evt.description?.toLowerCase().includes(term)
    );
  });

  const filteredOrganizers = organizers.filter(org => {
    const term = orgSearch.toLowerCase();
    return (
      org.organizationName?.toLowerCase().includes(term) ||
      org.email?.toLowerCase().includes(term) ||
      org.contactNumber?.toLowerCase().includes(term)
    );
  });

  // Calculate dynamic stats
  const activeOffersCount = events.filter(evt => Number(evt.ticketPrice) > 50).length; // Mock criterion for offers

  return (
    <div className="dashboard-container">
      {/* 1. LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <IconTicket />
          </div>
          <span className="logo-name">EventHub</span>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-info">
            <h4 className="user-name">{profile.fullName || 'Attender User'}</h4>
            <span className="user-role">Attendee Portal</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <IconDashboard /> <span>Dashboard</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'organizers' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizers')}
          >
            <IconUsers /> <span>Organizer Explorer</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <IconCalendar /> <span>Browse Events</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <IconHistory /> <span>Booking History</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <IconUser /> <span>Profile</span>
          </button>

          <div className="menu-divider"></div>

          <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <ThemeToggle />
          </div>

          <button 
            className="menu-item menu-item-logout"
            onClick={handleLogoutClick}
          >
            <IconLogout /> <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="content-area">
        {error && (
          <div className="dashboard-error-banner animate-fade">
            <span>⚠️ {error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="dashboard-spinner"></div>
            <span>Synchronizing database records...</span>
          </div>
        ) : (
          <div className="tab-view-wrapper animate-fade">
            
            {/* ==================== TAB: DASHBOARD OVERVIEW ==================== */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <header className="page-header">
                  <div>
                    <span className="section-badge">Platform Overview</span>
                    <h1 className="page-title">Attender Dashboard</h1>
                    <p className="page-desc">Overview of available events, host organizers, and personal ticket bookings.</p>
                  </div>
                </header>

                {/* ===== AUTO-SLIDING CAROUSEL BANNER ===== */}
                <div className="carousel-container">
                  <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {carouselSlides.map((slide, idx) => (
                      <div className="carousel-slide" key={idx}>
                        <img src={slide.image} alt={slide.title} className="carousel-bg-image" />
                        <div className="carousel-overlay" style={{ background: slide.gradient }}></div>
                        <div className="carousel-content">
                          <div className="carousel-text">
                            <h2 className="carousel-title">{slide.title}</h2>
                            <p className="carousel-subtitle">{slide.subtitle}</p>
                            <button className="carousel-cta-btn" onClick={() => setActiveTab('events')}>
                              {slide.cta}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nav Arrows */}
                  <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>

                  {/* Dot Indicators */}
                  <div className="carousel-dots">
                    {carouselSlides.map((_, idx) => (
                      <button
                        key={idx}
                        className={`carousel-dot ${currentSlide === idx ? 'active' : ''}`}
                        onClick={() => goToSlide(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* Metric grid */}
                <div className="metrics-grid">
                  <div className="metric-card cyan-border">
                    <span className="metric-title">Total Organizers</span>
                    <h3 className="metric-value">{organizers.length}</h3>
                    <span className="metric-footer">Active event managers</span>
                  </div>

                  <div className="metric-card indigo-border">
                    <span className="metric-title">Available Events</span>
                    <h3 className="metric-value">{events.length}</h3>
                    <span className="metric-footer">Live schedules listing</span>
                  </div>

                  <div className="metric-card pink-border">
                    <span className="metric-title">My Bookings</span>
                    <h3 className="metric-value">{bookings.length}</h3>
                    <span className="metric-footer">Reserved reservations</span>
                  </div>

                  <div className="metric-card green-border">
                    <span className="metric-title">Active Offers</span>
                    <h3 className="metric-value">{activeOffersCount}</h3>
                    <span className="metric-footer">Premium ticket deals</span>
                  </div>
                </div>

                {/* Recent actions / Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 700 }}>Upcoming Events Preview</h3>
                    {events.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No events are currently scheduled.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.slice(0, 3).map(evt => (
                          <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{evt.title}</h4>
                              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>📍 {evt.location} | 📅 {evt.date ? new Date(evt.date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setActiveTab('events'); setEventSearch(evt.title); }}>
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700 }}>Quick Navigation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button className="btn-primary" style={{ width: '100%' }} onClick={() => setActiveTab('events')}>
                        Book Ticket
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('organizers')}>
                        Explore Organizers
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('profile')}>
                        Manage Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: ORGANIZER EXPLORER ==================== */}
            {activeTab === 'organizers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <span className="section-badge">Verified Partners</span>
                    <h1 className="page-title">Organizer Explorer</h1>
                    <p className="page-desc">Discover the top hosting teams managing conferences, conventions, and festivals.</p>
                  </div>
                  <div style={{ width: '100%', maxWidth: '350px' }}>
                    <input 
                      type="text" 
                      placeholder="Search host organization..." 
                      value={orgSearch}
                      onChange={e => setOrgSearch(e.target.value)}
                      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </header>

                {filteredOrganizers.length === 0 ? (
                  <div className="empty-panel">
                    <p>No event organizers are currently registered.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {filteredOrganizers.map(org => {
                      // Generate some mock highlights for premium SaaS aesthetic
                      const mockYears = (org.organizationName.length % 5) + 3;
                      const mockEvents = (org.organizationName.length % 15) + 8;
                      return (
                        <div 
                          key={org.id} 
                          className="glass-panel hover-card" 
                          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                          onClick={() => setSelectedOrganizer(org)}
                        >
                          <div>
                            <span className="badge badge-indigo" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>Host Group</span>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-title)' }}>{org.organizationName}</h3>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <p style={{ margin: 0 }}><strong>Experience</strong>: {mockYears}+ Years Managed</p>
                            <p style={{ margin: 0 }}><strong>Managed events</strong>: {mockEvents}+ Successful Events</p>
                            <p style={{ margin: 0 }}><strong>Packages</strong>: Platinum, Gold, Executive</p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>📞 {org.contactNumber || 'No Phone'}</span>
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>View Details →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB: BROWSE EVENTS ==================== */}
            {activeTab === 'events' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <span className="section-badge">Live Event Listing</span>
                    <h1 className="page-title">Browse Events</h1>
                    <p className="page-desc">Reserve tickets for technical panels, virtual meetups, and live keynotes.</p>
                  </div>
                  <div style={{ width: '100%', maxWidth: '350px' }}>
                    <input 
                      type="text" 
                      placeholder="Search event name, location..." 
                      value={eventSearch}
                      onChange={e => setEventSearch(e.target.value)}
                      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </header>

                {filteredEvents.length === 0 ? (
                  <div className="empty-panel">
                    <p>No active events are scheduled at the moment.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {filteredEvents.map(evt => {
                      const isOffer = Number(evt.ticketPrice) > 50;
                      return (
                        <div 
                          key={evt.id} 
                          className="glass-panel hover-card" 
                          style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                          onClick={() => { setSelectedEvent(evt); setTicketQuantity(1); }}
                        >
                          {evt.image ? (
                            <img src={evt.image} alt={evt.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
                          ) : (
                            <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))', display: 'flex', alignItems: 'center', justifyEncoding: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '2.5rem', fontWeight: 850, color: 'rgba(255,255,255,0.05)' }}>XTOWN</span>
                            </div>
                          )}

                          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)' }}>{evt.title}</h3>
                                {isOffer && <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>10% OFF</span>}
                              </div>
                              <p style={{
                                color: 'var(--text-muted)', fontSize: '0.85rem', display: '-webkit-box',
                                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.6rem',
                                lineHeight: '1.2rem', margin: 0
                              }}>
                                {evt.description || "Agenda schedules will be updated by host organizer group shortly."}
                              </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <IconCalendar /> <span>{evt.date ? new Date(evt.date).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              {evt.time && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <IconClock /> <span>{evt.time}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <IconLocation /> <span>{evt.location}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Price</span>
                                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                                  {Number(evt.ticketPrice) === 0 ? 'FREE' : `$${Number(evt.ticketPrice).toFixed(2)}`}
                                </h4>
                              </div>
                              <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                                Details & Book
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

            {/* ==================== TAB: BOOKING HISTORY ==================== */}
            {activeTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <header className="page-header">
                  <div>
                    <span className="section-badge">Booking Ledger</span>
                    <h1 className="page-title">My Booked Events</h1>
                    <p className="page-desc">View verified ticket receipts, seat allocations, and event details.</p>
                  </div>
                </header>

                {bookings.length === 0 ? (
                  <div className="empty-panel">
                    <p>You have not booked any event tickets yet.</p>
                    <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => setActiveTab('events')}>
                      Browse Live Events
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Venue Location</th>
                          <th>Event Date</th>
                          <th>Ticket Type</th>
                          <th>Quantity</th>
                          <th>Total Paid</th>
                          <th>Registered Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(book => (
                          <tr key={book.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text-title)' }}>{book.Event?.title || 'Unknown Event'}</td>
                            <td>{book.Event?.location || 'N/A'}</td>
                            <td>{book.Event?.date ? new Date(book.Event.date).toLocaleDateString() : 'N/A'}</td>
                            <td><span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{book.ticketType || 'Standard'}</span></td>
                            <td style={{ fontWeight: 700 }}>{book.quantity || 1}</td>
                            <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                              {Number(book.totalPrice) === 0 ? 'FREE' : `$${Number(book.totalPrice).toFixed(2)}`}
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                {book.paymentStatus || 'Confirmed'}
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

            {/* ==================== TAB: PROFILE PROFILE ==================== */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <header className="page-header">
                  <div>
                    <span className="section-badge">Account Settings</span>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-desc">Update registration details, phone contact number, and update account password.</p>
                  </div>
                </header>

                <div className="glass-panel" style={{ maxWidth: '600px', padding: '3rem' }}>
                  {profileSuccess && (
                    <div className="dashboard-alert success-alert animate-fade">
                      <span>✔ Profile information updated successfully.</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="dashboard-alert error-alert animate-fade">
                      <span>⚠️ {profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label className="field-label">Full Name *</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName}
                        onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label className="field-label">Email Address *</label>
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label className="field-label">Phone Contact Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phoneNumber}
                        onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder="e.g. +1 (555) 123-4567"
                      />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-title)', fontWeight: 700 }}>Reset Password (Optional)</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Leave fields blank if you do not want to alter password</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label className="field-label">New Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={profileForm.password}
                            onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                            minLength={6}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label className="field-label">Confirm New Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={profileForm.confirmPassword}
                            onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem', padding: '0.8rem 2rem' }} disabled={profileLoading}>
                      {profileLoading ? 'Saving changes...' : 'Save Profile Details'}
                    </button>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ==================== MODAL: EVENT DETAILS & BOOKING ==================== */}
      {selectedEvent && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-card animate-scale" style={{ width: '100%', maxWidth: '640px', background: 'var(--modal-bg)', border: '1px solid var(--border-strong)' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Ticket Registry</span>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)' }}>{selectedEvent.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>&times;</button>
            </div>

            {bookingSuccess && (
              <div className="dashboard-alert success-alert animate-fade" style={{ margin: '1rem 0 0 0' }}>
                <span>✔ Tickets successfully booked! Checking history list...</span>
              </div>
            )}

            {bookingError && (
              <div className="dashboard-alert error-alert animate-fade" style={{ margin: '1rem 0 0 0' }}>
                <span>⚠️ {bookingError}</span>
              </div>
            )}

            <div className="modal-body" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Event overview fields */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {selectedEvent.image && (
                  <img src={selectedEvent.image} alt={selectedEvent.title} style={{ width: '180px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <p style={{ margin: 0 }}>📍 <strong>Venue Details</strong>: {selectedEvent.location}</p>
                  <p style={{ margin: 0 }}>📅 <strong>Date</strong>: {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'N/A'}</p>
                  {selectedEvent.time && <p style={{ margin: 0 }}>⏰ <strong>Time</strong>: {selectedEvent.time}</p>}
                  <p style={{ margin: 0 }}>🎟 <strong>Seat capacity limit</strong>: {selectedEvent.seatLimit || 'Unspecified'}</p>
                </div>
              </div>

              {/* Event Description */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-title)', fontWeight: 700 }}>About Event</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.45' }}>
                  {selectedEvent.description || "No description provided by the event manager."}
                </p>
              </div>

              {/* Event Highlights */}
              {selectedEvent.title === "Royal Wedding Reception 2026" && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-title)', fontWeight: 700 }}>✨ Event Highlights</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    <li style={{ marginBottom: '0.25rem' }}>Grand Wedding Ceremony Experience</li>
                    <li style={{ marginBottom: '0.25rem' }}>Live Music & Entertainment</li>
                    <li style={{ marginBottom: '0.25rem' }}>Premium Dinner & Refreshments</li>
                    <li style={{ marginBottom: '0.25rem' }}>Photography & Memorable Moments</li>
                  </ul>
                </div>
              )}

              {/* Event Schedule (If available) */}
              {selectedEvent.schedule && selectedEvent.schedule.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-title)', fontWeight: 700 }}>Event Schedule</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    {selectedEvent.schedule.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>⏱ {item.time || 'N/A'}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.activity || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Checkout section */}
              <form onSubmit={handleBookingConfirm} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Attendee Prefilled Details */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.fullName} 
                      disabled={true}
                      style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={profileForm.email} 
                      disabled={true}
                      style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Quantity</label>
                      <select 
                        value={ticketQuantity} 
                        onChange={e => setTicketQuantity(Number(e.target.value))}
                        style={{ padding: '0.5rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-title)' }}
                        disabled={bookingLoading || bookingSuccess}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                          <option key={val} value={val} style={{ background: 'var(--modal-bg)' }}>{val}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</span>
                      <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {Number(selectedEvent.ticketPrice) === 0 ? 'FREE' : `$${(Number(selectedEvent.ticketPrice) * ticketQuantity).toFixed(2)}`}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setSelectedEvent(null)} disabled={bookingLoading || bookingSuccess}>
                      Close
                    </button>
                    <button type="submit" className="btn-primary" disabled={bookingLoading || bookingSuccess}>
                      {bookingLoading ? 'Confirming...' : 'Book Ticket Now'}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ORGANIZER DETAILS ==================== */}
      {selectedOrganizer && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-card animate-scale" style={{ width: '100%', maxWidth: '480px', background: 'var(--modal-bg)', border: '1px solid var(--border-strong)' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Partner Profile</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-title)' }}>{selectedOrganizer.organizationName}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedOrganizer(null)}>&times;</button>
            </div>

            <div className="modal-body" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                This is a verified XTOWN event manager group. Feel free to contact them for customized booking adjustments or queries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: 0 }}>📧 <strong>Primary Email</strong>: <span style={{ color: 'var(--text-title)' }}>{selectedOrganizer.email}</span></p>
                <p style={{ margin: 0 }}>📞 <strong>Contact Number</strong>: <span style={{ color: 'var(--text-title)' }}>{selectedOrganizer.contactNumber || 'N/A'}</span></p>
                <p style={{ margin: 0 }}>💼 <strong>Available Packages</strong>: Gold Elite, Platinum Suite, Executive Event Pass</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => setSelectedOrganizer(null)}>
                  Close Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CORE DESIGN STYLESHEET */}
      <style>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: var(--bg-main);
          color: var(--text-main);
          font-family: var(--font-family, sans-serif);
          overflow-x: hidden;
        }

        /* Sidebar Styling */
        .sidebar {
          flex: 0 0 270px;
          background: linear-gradient(180deg, var(--sidebar-bg-start), var(--sidebar-bg-end));
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          gap: 2rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 0.5rem;
        }

        .sidebar-logo {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--accent-cyan, #06b6d4));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-on-primary, #fff);
        }

        .logo-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-title);
          letter-spacing: -0.5px;
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary-color, #6366f1);
          color: #fff;
          font-weight: 800;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-title);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--text-muted, #9ca3af);
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-muted, #9ca3af);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .menu-item svg {
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .menu-item:hover {
          color: var(--text-title);
          background: var(--icon-bg);
        }

        .menu-item:hover svg {
          opacity: 1;
        }

        .menu-item.active {
          background: var(--primary-color, #6366f1);
          color: var(--text-on-primary, #fff);
          box-shadow: 0 4px 15px var(--primary-glow);
        }

        .menu-item.active svg {
          opacity: 1;
        }

        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 1rem 0;
        }

        .menu-item-logout {
          color: #fca5a5;
        }

        .menu-item-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Content Area Styling */
        .content-area {
          flex: 1;
          padding: 3rem;
          overflow-y: auto;
          height: 100vh;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .section-badge {
          font-size: 0.75rem;
          color: var(--primary-color, #6366f1);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 850;
          letter-spacing: -0.75px;
          color: var(--text-title);
          margin: 0.25rem 0 0.5rem 0;
        }

        .page-desc {
          color: var(--text-muted, #9ca3af);
          font-size: 0.95rem;
          margin: 0;
        }

        /* Metrics grid and cards */
        .metrics-grid {
          display: grid;
          grid-templateColumns: repeat(auto-fit, minmax(220px, 1fr));
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .metric-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted, #9ca3af);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 850;
          margin: 0;
          color: var(--text-title);
        }

        .metric-footer {
          font-size: 0.75rem;
          color: var(--text-muted, #9ca3af);
        }

        .cyan-border { border-left: 4px solid var(--accent-cyan, #06b6d4); }
        .indigo-border { border-left: 4px solid var(--primary-color, #6366f1); }
        .pink-border { border-left: 4px solid var(--accent-pink, #ec4899); }
        .green-border { border-left: 4px solid #10b981; }

        /* General panels & grids */
        .cards-grid {
          display: grid;
          grid-templateColumns: repeat(auto-fill, minmax(320px, 1fr));
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .empty-panel {
          text-align: center;
          padding: 5rem 2rem;
          border: 2px dashed rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          color: var(--text-muted, #9ca3af);
        }

        .hover-card {
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
        }

        .hover-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.25) !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        }

        /* Error alert banner */
        .dashboard-error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .dashboard-alert {
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .success-alert {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }

        .field-label {
          font-size: 0.8rem;
          color: var(--label-color);
          font-weight: 600;
        }

        /* Table styles */
        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .dashboard-table th {
          padding: 1rem;
          background: var(--bg-main);
          border-bottom: 1px solid var(--border-strong);
          color: var(--text-title);
          font-weight: 700;
        }

        .dashboard-table td {
          padding: 1.1rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: var(--text-muted, #9ca3af);
        }

        .dashboard-table tr:hover td {
          background: var(--card-bg-hover);
          color: var(--text-title);
        }

        /* Loading / spinner */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10rem 0;
          gap: 1.5rem;
          color: var(--text-muted, #9ca3af);
        }

        .dashboard-spinner {
          width: 44px;
          height: 44px;
          border: 3.5px solid rgba(255, 255, 255, 0.05);
          border-top-color: var(--primary-color, #6366f1);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Modals & Backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(4, 5, 10, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-card {
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-muted, #9ca3af);
          font-size: 1.8rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .modal-close-btn:hover {
          color: var(--text-title);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fade {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-scale {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* ===== CAROUSEL STYLES ===== */
        .carousel-container {
          position: relative;
          width: 100%;
          height: 320px;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .carousel-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
        }

        .carousel-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .carousel-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .carousel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          opacity: 0.6;
        }

        .carousel-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          display: flex;
          align-items: center;
          padding: 0 4rem;
        }

        .carousel-text {
          max-width: 520px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .carousel-title {
          font-size: 2.2rem;
          font-weight: 850;
          color: #fff;
          margin: 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
          line-height: 1.15;
        }

        .carousel-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.88);
          margin: 0;
          line-height: 1.5;
          text-shadow: 0 1px 10px rgba(0,0,0,0.3);
          max-width: 420px;
        }

        .carousel-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 2rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          width: fit-content;
          margin-top: 0.5rem;
          box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.3px;
          font-family: inherit;
        }

        .carousel-cta-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 28px rgba(236, 72, 153, 0.55);
          background: linear-gradient(135deg, #f43f5e, #ec4899);
        }

        .carousel-cta-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Carousel Navigation Arrows */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .carousel-arrow:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-arrow-left {
          left: 16px;
        }

        .carousel-arrow-right {
          right: 16px;
        }

        /* Carousel Dot Indicators */
        .carousel-dots {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          background: transparent;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .carousel-dot.active {
          background: #fff;
          border-color: #fff;
          transform: scale(1.3);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .carousel-dot:hover:not(.active) {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(255, 255, 255, 0.7);
        }

        /* Responsiveness */
        @media (max-width: 900px) {
          .dashboard-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            padding: 1.5rem;
          }
          .sidebar-menu {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .menu-item {
            width: auto;
            flex: 1 1 auto;
          }
          .content-area {
            padding: 2rem;
            height: auto;
          }
          .carousel-container {
            height: 220px;
            border-radius: 12px;
          }
          .carousel-content {
            padding: 0 1.5rem;
          }
          .carousel-title {
            font-size: 1.4rem;
          }
          .carousel-subtitle {
            font-size: 0.8rem;
            max-width: 280px;
          }
          .carousel-cta-btn {
            padding: 0.55rem 1.4rem;
            font-size: 0.8rem;
          }
          .carousel-arrow {
            width: 32px;
            height: 32px;
          }
          .carousel-arrow svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AttenderDashboard;
