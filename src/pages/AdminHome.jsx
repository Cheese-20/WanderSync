import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function AdminHome() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userJson);
      if (user.role !== 'admin') {
        navigate('/home');
      } else {
        setAdminUser(user);
      }
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);



  if (!adminUser) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <main>
        <h1 style={{ marginBottom: '2rem' }}>WanderSync Admin Dashboard</h1>
        <div style={{ padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2>Welcome, {adminUser.email}</h2>
          <p>You have successfully logged into the restricted Admin portal.</p>
          <p>System metrics and administrative controls will appear here.</p>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
