import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/admin.css';

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
    <div className="admin-dashboard-container">
      <main>
        <h1 className="admin-title">WanderSync Admin Dashboard</h1>
        <div className="admin-content-box">
          <h2>Welcome, {adminUser.email}</h2>
          <p>You have successfully logged into the restricted Admin portal.</p>
          <p>System metrics and administrative controls will appear here.</p>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
