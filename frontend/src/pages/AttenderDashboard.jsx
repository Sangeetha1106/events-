import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicEvents, createBooking } from '../api/event.api';

// Inline Icons
const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const IconTicket = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path><line x1="13" y1="5" x2="13" y2="19"></line></svg>
);

const AttenderDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null); // for booking modal
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
    paymentStatus: 'Pending'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const navigate = useNavigate();

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPublicEvents();
      if (res.success) {
        setEvents(res.data || []);
      } else {
        setError(res.message || "Failed to retrieve public events.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenBooking = (evt) => {
    setSelectedEvent(evt);
    setBookingForm({
      fullName: '',
      email: '',
      password: '',
      location: '',
      paymentStatus: 'Pending'
    });
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleCloseBooking = () => {
    setSelectedEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload = {
        ...bookingForm,
        eventId: selectedEvent.id
      };

      const res = await createBooking(payload);
      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSelectedEvent(null);
          loadEvents(); // reload list
        }, 1500);
      } else {
        setSubmitError(res.message || "Failed to create booking.");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "Error submitting booking");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(evt => {
    const term = searchQuery.toLowerCase();
    return (
      evt.title?.toLowerCase().includes(term) ||
      evt.location?.toLowerCase().includes(term) ||
      evt.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f101d, #05060b)',
      color: '#f3f4f6',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Navigation Header */}
      <nav style={{
        padding: '1.25rem 3rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(15, 16, 29, 0.7)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-color)',
            boxShadow: '0 0 12px var(--primary-glow)'
          }}></span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            XTOWN Event Hub
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Customer Portal</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/login')}
            style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}
          >
            Portal Login
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Discover & Register for Events
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Explore the latest technical symposia, concerts, workshops, and meetups in XTOWN.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '380px' }}>
            <input 
              type="text" 
              placeholder="Search event name, location or tags..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.8rem 1.2rem',
                borderRadius: '10px',
                width: '100%',
                color: '#fff'
              }}
            />
          </div>
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
            padding: '8rem 0', gap: '1rem', color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)',
              borderTopColor: 'var(--primary-color)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Fetching live event schedules...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '6rem 2rem', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '16px'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No events are currently scheduled or matching your search.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem'
          }}>
            {filteredEvents.map(evt => (
              <div 
                key={evt.id} 
                className="glass-panel" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(26, 27, 46, 0.45)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {evt.image ? (
                  <img src={evt.image} alt={evt.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                       onError={e => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div style={{
                    width: '100%', height: '170px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)' }}>XTOWN</span>
                  </div>
                )}

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>{evt.title}</h3>
                      <span className="badge badge-indigo" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {Number(evt.ticketPrice) === 0 ? 'FREE' : `$${Number(evt.ticketPrice).toFixed(2)}`}
                      </span>
                    </div>
                    <p style={{
                      color: 'var(--text-muted)', fontSize: '0.875rem', display: '-webkit-box',
                      WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.6rem',
                      lineHeight: '1.2rem', margin: 0
                    }}>
                      {evt.description || "Join us for an exciting experience. Detailed agendas and schedules will be updated soon."}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)',
                    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: 'auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconCalendar /> <strong>Date</strong>: {evt.date}
                    </div>
                    {evt.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IconClock /> <strong>Time</strong>: {evt.time}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconLocation /> <strong>Venue</strong>: {evt.location}
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => handleOpenBooking(evt)}
                  >
                    <IconTicket /> Book Event Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{
            width: '100%', maxWidth: '500px', padding: '2.5rem',
            background: '#121324', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Booking Checkout</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{selectedEvent.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Enter details to register attender account and book tickets
                </p>
              </div>
              <button 
                onClick={handleCloseBooking}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem',
                  cursor: 'pointer', transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                &times;
              </button>
            </div>

            {submitError && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                ✔ Tickets booked successfully! Have a great event!
              </div>
            )}

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={bookingForm.fullName} 
                  onChange={handleInputChange} 
                  placeholder="e.g. John Doe"
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={bookingForm.email} 
                  onChange={handleInputChange} 
                  placeholder="e.g. johndoe@gmail.com"
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Account Password * <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>(Used to register account if email new)</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={bookingForm.password} 
                  onChange={handleInputChange} 
                  placeholder="••••••••"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location / Address</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={bookingForm.location} 
                    onChange={handleInputChange} 
                    placeholder="e.g. New York, USA"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Status *</label>
                  <select 
                    name="paymentStatus" 
                    value={bookingForm.paymentStatus} 
                    onChange={handleInputChange}
                    style={{
                      padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                      color: '#fff', fontSize: '0.9rem', width: '100%'
                    }}
                  >
                    <option value="Pending" style={{ background: '#121324' }}>Pending</option>
                    <option value="Paid" style={{ background: '#121324' }}>Paid</option>
                  </select>
                </div>
              </div>

              {/* Hidden Event ID field */}
              <input type="hidden" name="eventId" value={selectedEvent.id} />

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket Price:</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--accent-cyan)' }}>
                    {Number(selectedEvent.ticketPrice) === 0 ? 'FREE' : `$${Number(selectedEvent.ticketPrice).toFixed(2)}`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" onClick={handleCloseBooking} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Confirming...' : 'Register & Book'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttenderDashboard;
