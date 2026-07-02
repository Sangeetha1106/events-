import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookTickets } from '../api/attender.api';
import { generateInvoice } from '../utils/invoiceGenerator';
import '../styles/global.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState('UPI / QR');
  const [showQR, setShowQR] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [upiId, setUpiId] = useState('');
  
  // Card Details State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Wallet State
  const [walletType, setWalletType] = useState('Paytm');
  const [walletNumber, setWalletNumber] = useState('');

  // Net Banking State
  const [bankName, setBankName] = useState('HDFC Bank');
  const [customerId, setCustomerId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bookingDetails = location.state;

  if (!bookingDetails) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-title)' }}>
        <p>No booking details found. Please return to the dashboard and try again.</p>
        <button className="btn-primary" onClick={() => navigate('/attender/dashboard')} style={{ marginLeft: '1rem' }}>Go Back</button>
      </div>
    );
  }

  const amountPayable = (Number(bookingDetails.eventDetails?.ticketPrice || 0) * bookingDetails.ticketQuantity).toFixed(2);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=m.sangeetha8760@okicici&pn=EventPro&am=${amountPayable}&cu=INR`;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation based on method
    if (selectedMethod === 'UPI / QR' && !transactionId) {
      setError('UPI Transaction ID is required.');
      return;
    }
    if (selectedMethod === 'Debit / Credit Card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      setError('Please fill in all card details.');
      return;
    }
    if (selectedMethod === 'Mobile Wallets' && !walletNumber) {
      setError('Mobile number is required for wallet payment.');
      return;
    }
    if (selectedMethod === 'Net Banking' && !customerId) {
      setError('Customer ID / User ID is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        eventId: bookingDetails.eventId,
        ticketQuantity: bookingDetails.ticketQuantity,
        attendeeName: bookingDetails.attendeeName,
        attendeeEmail: bookingDetails.attendeeEmail
      };

      const res = await bookTickets(payload);
      if (res.success) {
        generateInvoice(bookingDetails, transactionId || `${selectedMethod} Payment`);
        
        alert("Payment Successful! Your invoice has been generated.");
        navigate('/attender/dashboard');
      } else {
        setError(res.message || "Failed to finalize booking.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment processing error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '3rem 5%', fontFamily: 'var(--font-family)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '2rem' }}>Complete Your Payment</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Left and Center: Payment Options & Details */}
        <div className="glass-panel" style={{ flex: '1 1 600px', display: 'flex', padding: 0, overflow: 'hidden' }}>
          
          {/* Sidebar */}
          <div style={{ flex: '0 0 200px', background: 'var(--card-bg-hover)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Options</div>
            
            {['UPI / QR', 'Debit / Credit Card', 'Mobile Wallets', 'Net Banking', 'Gift Voucher', 'Pay Later'].map(method => (
              <div 
                key={method}
                onClick={() => { setSelectedMethod(method); setError(null); }}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: selectedMethod === method ? 'rgba(255, 255, 255, 0.05)' : 'transparent', 
                  borderLeft: selectedMethod === method ? '3px solid #FBBF24' : '3px solid transparent', 
                  color: selectedMethod === method ? 'var(--text-title)' : 'var(--text-muted)', 
                  fontWeight: selectedMethod === method ? 600 : 400, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                {method}
              </div>
            ))}
          </div>

          {/* Center Content */}
          <div style={{ flex: 1, padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '1.5rem' }}>Pay by {selectedMethod}</h3>
            
            <form onSubmit={handlePaymentSubmit}>
              {error && <div className="dashboard-error-banner" style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

              {selectedMethod === 'UPI / QR' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', border: '1px solid #FBBF24', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.05)', marginBottom: '2rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowQR(!showQR)}
                      style={{ background: 'transparent', border: '1px solid #FBBF24', color: '#FBBF24', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>⊞</span> {showQR ? 'Hide QR Code' : 'Scan QR Code to Pay'}
                    </button>
                    
                    {showQR && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                        <img src={qrUrl} alt="UPI QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px', background: 'white', padding: '10px' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>UPI ID: m.sangeetha8760@okicici</p>
                      </div>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '1rem' }}>I Have Completed Payment</h4>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>UPI Transaction ID *</label>
                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter 12-digit transaction ID" required />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your UPI ID Used (Optional)</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. name@upi" />
                  </div>
                </>
              )}

              {selectedMethod === 'Debit / Credit Card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Card Number *</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" maxLength="19" required />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expiry Date *</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength="5" required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CVV *</label>
                      <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="***" maxLength="4" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cardholder Name *</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" required />
                  </div>
                </div>
              )}

              {selectedMethod === 'Mobile Wallets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Wallet *</label>
                    <select value={walletType} onChange={(e) => setWalletType(e.target.value)} required>
                      <option value="Paytm">Paytm</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                      <option value="MobiKwik">MobiKwik</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Mobile Number linked to Wallet *</label>
                    <input type="tel" value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)} placeholder="Enter 10-digit mobile number" maxLength="10" required />
                  </div>
                </div>
              )}

              {selectedMethod === 'Net Banking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Bank *</label>
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} required>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Customer ID / User ID *</label>
                    <input type="text" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Enter Customer ID" required />
                  </div>
                </div>
              )}

              {(selectedMethod === 'Gift Voucher' || selectedMethod === 'Pay Later') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>This payment method is currently unavailable for this event. Please select another method.</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || selectedMethod === 'Gift Voucher' || selectedMethod === 'Pay Later'}
                style={{ width: '100%', background: '#10B981', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 700, cursor: (loading || selectedMethod === 'Gift Voucher' || selectedMethod === 'Pay Later') ? 'not-allowed' : 'pointer', opacity: (selectedMethod === 'Gift Voucher' || selectedMethod === 'Pay Later') ? 0.5 : 1 }}>
                {loading ? 'Processing...' : (selectedMethod === 'UPI / QR' ? 'Submit Proof' : `Pay $${amountPayable}`)}
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Booking Summary */}
        <div className="glass-panel" style={{ flex: '1 1 350px', padding: '2.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '2rem' }}>Booking Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FBBF24', margin: 0, marginBottom: '0.25rem' }}>{bookingDetails.eventDetails?.title || 'Event Ticket'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{bookingDetails.eventDetails?.date || 'N/A'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tickets</span>
              <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>{bookingDetails.ticketQuantity}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Amount Payable</span>
              <span style={{ fontWeight: 800, color: '#10B981', fontSize: '1.5rem' }}>${amountPayable}</span>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
              Please scan the QR code and complete the payment. Your invoice will be generated upon successful verification.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
