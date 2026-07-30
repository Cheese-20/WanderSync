import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (activeTab === 'bookings') {
      const fetchBookings = async () => {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            const response = await fetch(`http://localhost:5033/api/bookings/user/${user.id}`);
            if (response.ok) {
              const data = await response.json();
              setBookings(data);
            } else {
              console.error("Failed to fetch bookings");
            }
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      };
      fetchBookings();
    }
  }, [activeTab]);

  return (
    <div>
      <NavBar />
      <main className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2>User Profile</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'info' ? 'bold' : 'normal',
              color: activeTab === 'info' ? '#007BFF' : '#333'
            }}
            onClick={() => setActiveTab('info')}
          >
            Profile Info
          </button>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
              color: activeTab === 'bookings' ? '#007BFF' : '#333'
            }}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>

        {activeTab === 'info' && (
          <div>
            <h3>Your Information</h3>
            <p>Welcome to your WanderSync profile!</p>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3>Your Reservations</h3>
            {bookings.length === 0 ? (
              <p>You have no bookings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                  <div 
                    key={booking.bookingID} 
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0' }}>Booking #{booking.bookingID}</h4>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: booking.status === 'Confirmed' ? '#d4edda' : '#fff3cd',
                        color: booking.status === 'Confirmed' ? '#155724' : '#856404',
                        fontSize: '0.9rem'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Type: {booking.bookingType}</p>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                      Date: {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for detailed booking view */}
        {selectedBooking && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: '#fff', 
              padding: '2rem', 
              borderRadius: '12px', 
              width: '90%', 
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Booking Details</h3>
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer',
                    lineHeight: 1 
                  }}
                >
                  &times;
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Booking ID:</strong>
                  <span>{selectedBooking.bookingID}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Status:</strong>
                  <span style={{ fontWeight: 'bold', color: selectedBooking.status === 'Confirmed' ? '#28a745' : '#ffc107' }}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Type:</strong>
                  <span>{selectedBooking.bookingType}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <strong style={{ color: '#555' }}>Date:</strong>
                  <span>{new Date(selectedBooking.bookingDate).toLocaleString()}</span>
                </div>
                {selectedBooking.tourID !== 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <strong style={{ color: '#555' }}>Tour ID:</strong>
                    <span>{selectedBooking.tourID}</span>
                  </div>
                )}
                {selectedBooking.curatedSpotID !== 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                    <strong style={{ color: '#555' }}>Curated Spot ID:</strong>
                    <span>{selectedBooking.curatedSpotID}</span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
