import { useState } from 'react';

const interestOptions = ['Hiking', 'Culinary', 'Art & Culture', 'Photography', 'Wellness'];

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState({
    email: '',
    fullName: '',
    role: 'explorer',
    profileComplete: false,
    interests: [],
  });
  const [verificationMessage, setVerificationMessage] = useState('');
  const [profileInfo, setProfileInfo] = useState({
    bio: '',
    location: '',
    timezone: 'GMT',
  });

  const handleLogin = ({ email, password, role }) => {
    if (!email || !password) {
      return;
    }

    setUser(prev => ({
      ...prev,
      email,
      role,
      profileComplete: false,
    }));
    setVerificationMessage('Your account has been verified and accepted. Please complete your profile.');
    setPage('profile');
  };

  const handleRegister = ({ fullName, email, password, role, interests }) => {
    if (!fullName || !email || !password) {
      return;
    }

    setUser({
      email,
      fullName,
      role,
      profileComplete: false,
      interests,
    });
    setVerificationMessage('Thanks for registering. Your account is verified and accepted. Complete your profile to continue.');
    setPage('profile');
  };

  const handleProfileSubmit = ({ bio, location, timezone }) => {
    setProfileInfo({ bio, location, timezone });
    setUser(prev => ({
      ...prev,
      profileComplete: true,
    }));
    setPage(user.role === 'guide' ? 'guideHome' : 'explorerHome');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">WanderSync</div>
        <div className="header-actions">
          {page !== 'login' && page !== 'register' && (
            <button className="header-button" onClick={() => setPage('login')}>Logout</button>
          )}
          {page === 'login' && (
            <button className="header-button" onClick={() => setPage('register')}>Create account</button>
          )}
          {page === 'register' && (
            <button className="header-button" onClick={() => setPage('login')}>Back to login</button>
          )}
        </div>
      </header>

      <main className="page-container">
        {page === 'login' && (
          <LoginPage onLogin={handleLogin} onGoToRegister={() => setPage('register')} />
        )}

        {page === 'register' && (
          <RegisterPage onRegister={handleRegister} onBack={() => setPage('login')} />
        )}

        {page === 'profile' && (
          <ProfileSetupPage
            user={user}
            verificationMessage={verificationMessage}
            onCompleteProfile={handleProfileSubmit}
          />
        )}

        {page === 'explorerHome' && <ExplorerHomePage user={user} />}
        {page === 'guideHome' && <GuideHomePage user={user} />}
      </main>
    </div>
  );
}

function LoginPage({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('explorer');

  return (
    <div className="auth-card">
      <div className="auth-hero">
        <h1>Your journey begins here.</h1>
        <p>Discover hidden gems, plan unforgettable itineraries, and sync your adventures seamlessly with WanderSync.</p>
      </div>
      <div className="auth-form">
        <h2>Welcome back</h2>
        <p className="subtext">Please enter your details to sign in.</p>

        <div className="role-toggle">
          <button className={role === 'explorer' ? 'toggle-button active' : 'toggle-button'} onClick={() => setRole('explorer')}>Explorer</button>
          <button className={role === 'guide' ? 'toggle-button active' : 'toggle-button'} onClick={() => setRole('guide')}>Local Guide</button>
        </div>

        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" type="email" />

        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" />

        <div className="remember-row">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <button className="link-button">Forgot Password?</button>
        </div>

        <button className="primary-button" onClick={() => onLogin({ email, password, role })}>Sign In</button>
        <div className="divider">Or continue with</div>
        <button className="secondary-button">Sign in with Google</button>
        <button className="secondary-button">Sign in with Apple</button>

        <div className="bottom-note">
          Don't have an account? <button className="link-button" onClick={onGoToRegister}>Sign up</button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onBack }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('explorer');
  const [interests, setInterests] = useState([]);
  const [agreed, setAgreed] = useState(false);

  const toggleInterest = interest => {
    setInterests(prev => prev.includes(interest) ? prev.filter(item => item !== interest) : [...prev, interest]);
  };

  return (
    <div className="auth-card register-card">
      <div className="register-form">
        <h2>Create Account</h2>
        <p className="subtext">Step 1: Your details</p>

        <label>Full Name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Alex Explorer" />

        <label>Email Address</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" type="email" />

        <label>I want to be a...</label>
        <div className="role-toggle">
          <button className={role === 'explorer' ? 'toggle-button active' : 'toggle-button'} onClick={() => setRole('explorer')}>Explorer</button>
          <button className={role === 'guide' ? 'toggle-button active' : 'toggle-button'} onClick={() => setRole('guide')}>Local Guide</button>
        </div>

        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" />

        <div className="section-title">Step 2: Your interests</div>
        <p className="subtext">Select at least one to personalize your compass.</p>
        <div className="interest-grid">
          {interestOptions.map(interest => (
            <button
              type="button"
              key={interest}
              className={interests.includes(interest) ? 'chip active' : 'chip'}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>

        <label className="terms-row">
          <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
          I agree to the <span className="link-text">Terms of Service</span> and <span className="link-text">Privacy Policy</span>.
        </label>

        <button className="primary-button" onClick={() => onRegister({ fullName, email, password, role, interests })}>Create Account</button>

        <div className="bottom-note">
          Already have an account? <button className="link-button" onClick={onBack}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupPage({ user, verificationMessage, onCompleteProfile }) {
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('GMT');

  return (
    <div className="setup-card">
      <h2>Complete your profile</h2>
      <p className="confirmation">{verificationMessage}</p>
      <p className="subtext">Add a few details so we can personalize your experience.</p>

      <div className="profile-fields">
        <label>Display Name</label>
        <input value={user.fullName} disabled placeholder="Your name" />

        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Cape Town, South Africa" />

        <label>Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us a little about yourself." rows="4" />

        <label>Preferred timezone</label>
        <select value={timezone} onChange={e => setTimezone(e.target.value)}>
          <option>GMT</option>
          <option>UTC+1</option>
          <option>UTC+2</option>
          <option>UTC-5</option>
          <option>UTC+8</option>
        </select>
      </div>

      <button className="primary-button" onClick={() => onCompleteProfile({ bio, location, timezone })}>
        Finish setup
      </button>
    </div>
  );
}

function ExplorerHomePage({ user }) {
  const cards = [
    { title: 'Sunset Hike', subtitle: 'Join local guides for evening ascent with panoramic views.', tag: 'Trending', rating: '4.8' },
    { title: 'Coffee Tour', subtitle: 'Explore hidden roasteries and learn brewing secrets in the old town.', tag: 'Verified', rating: '4.9' },
    { title: 'Paddleboard', subtitle: 'Find your center with a morning session on calm waters.', tag: 'Outdoor', rating: '4.7' },
  ];

  return (
    <div className="home-grid">
      <section className="hero-panel">
        <div>
          <div className="eyebrow">Explore</div>
          <h1>Begin Your Journey</h1>
          <p>Join WanderSync and discover the world with a compass built for modern explorers. Uncover hidden gems, plan seamlessly, and find your next quiet thrill.</p>
        </div>
        <div className="hero-preview">WanderSync</div>
      </section>

      <section className="content-panel">
        <div className="section-header">
          <h2>Happening Today</h2>
          <button className="small-button">Filter</button>
        </div>
        <div className="activity-grid">
          {cards.map(card => (
            <article key={card.title} className="activity-card">
              <div className="activity-tag">{card.tag}</div>
              <h3>{card.title}</h3>
              <p>{card.subtitle}</p>
              <div className="activity-meta">{card.rating} ★</div>
            </article>
          ))}
        </div>

        <div className="community-card">
          <div className="community-header">
            <div>
              <h3>Anna Hathaway</h3>
              <span>Cape Town, South Africa • 2 hours ago</span>
            </div>
          </div>
          <p>Just spent the most incredible weekend exploring the coastline near Cape Town. The wind was fierce, but the views were absolutely worth it.</p>
          <div className="community-footer">245 likes · 42 comments</div>
        </div>
      </section>

      <aside className="sidebar-panel">
        <div className="sidebar-card">
          <h3>Local Favourites</h3>
          <div className="sidebar-item">Jack's Bagels</div>
          <div className="sidebar-item">Modern Art Gallery</div>
          <button className="secondary-button">See All</button>
        </div>
        <div className="sidebar-card small-card">
          <h3>Saved Routes</h3>
          <p>3 pending itineraries</p>
        </div>
        <div className="sidebar-card small-card">
          <h3>Travel Buddies</h3>
          <p>Find companions</p>
        </div>
      </aside>
    </div>
  );
}

function GuideHomePage({ user }) {
  const stats = [
    { label: 'Active', value: '5' },
    { label: 'Pending', value: '3' },
    { label: 'Rating', value: '4.9★' },
  ];

  return (
    <div className="guide-grid">
      <aside className="guide-sidebar">
        <div className="profile-panel">
          <div className="avatar">AG</div>
          <div>
            <strong>{user.fullName || 'Alex Explorer'}</strong>
            <span>Verified Guide</span>
          </div>
        </div>
        <nav className="guide-nav">
          <button className="nav-button active">Dashboard</button>
          <button className="nav-button">Bookings</button>
          <button className="nav-button">Spot Verification</button>
          <button className="nav-button">Itineraries</button>
          <button className="nav-button">Analytics</button>
        </nav>
      </aside>

      <section className="guide-main">
        <div className="guide-hero">
          <div>
            <p className="eyebrow">Guide Hub</p>
            <h1>Welcome back, {user.fullName || 'Alex'}!</h1>
            <p>Ready for another day of exploration? Here's what's on your plate.</p>
          </div>
        </div>

        <div className="stats-row">
          {stats.map(item => (
            <div key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="bookings-panel">
          <div className="bookings-header">
            <h2>Upcoming Bookings</h2>
            <button className="link-button">View Schedule</button>
          </div>
          <div className="booking-item">
            <div>
              <strong>Hidden Gems Walking Tour</strong>
              <span>Today, 2:00 PM — Client: Sarah Jenkins</span>
            </div>
            <button className="secondary-button">Manage</button>
          </div>
          <div className="booking-item">
            <div>
              <strong>Culinary Explorers</strong>
              <span>Tomorrow, 10:00 AM — Pending request</span>
            </div>
            <div>
              <button className="secondary-button outline">Decline</button>
              <button className="secondary-button">Accept</button>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <div className="action-card">
            <h3>New itinerary</h3>
            <p>Design a new local experience.</p>
          </div>
          <div className="action-card">
            <h3>Edit profile</h3>
            <p>Update your bio and guide profile.</p>
          </div>
          <div className="action-card">
            <h3>Client chat</h3>
            <p>Respond to new messages.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
