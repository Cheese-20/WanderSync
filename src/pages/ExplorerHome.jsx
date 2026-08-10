import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';
import '../styles/explorer.css';

export default function ExplorerHome() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5200/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const toggleMenu = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  const handleReport = (type, post) => {
    setOpenMenuId(null);
    navigate('/report', { state: { reportType: type, reportedUserID: post.userID, postID: post.postID } });
  };

  return (
    <div className="explorer-page">
      <NavBar />
      <header className="explorer-hero">
        <h1>Happening Today</h1>
        <p>Discover activities around you</p>
      </header>

      <section className="explorer-grid">
        <article className="card">Sunset Hike</article>
        <article className="card">Coffee Tour</article>
        <article className="card">Paddleboard Yoga</article>
      </section>

      <section className="community-feed">
        <div className="feed-header">
          <h2>Live from the Community</h2>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Post Experience</button>
        </div>

        <div className="posts-container">
          {posts.map(post => (
            <div key={post.postID || Math.random()} className="post">
              <div className="post-header">
                <div className="post-menu-wrapper">
                  <button className="post-ellipsis-btn" onClick={() => toggleMenu(post.postID)}>⋯</button>
                  {openMenuId === post.postID && (
                    <div className="post-ellipsis-menu">
                      <button onClick={() => handleReport('account', post)}>Report Account</button>
                      <button onClick={() => handleReport('content', post)}>Report Content</button>
                    </div>
                  )}
                </div>
                <div className="post-user-info">
                  <div className="post-avatar"></div>
                  <span className="post-username">{post.firstName ? `${post.firstName} ${post.lastName}` : `Explorer ${post.userID}`}</span>
                </div>
                <span className="experience-badge">{post.experienceType}</span>
              </div>
              
              {post.pictureURL && (
                <div className="post-image-container">
                  <img src={post.pictureURL} alt="Experience" className="post-image" />
                </div>
              )}

              <div className="post-body">
                <div className="post-actions">
                  <span className="action-icon">❤️</span>
                  <span className="action-icon">💬</span>
                  <span className="action-icon">↗️</span>
                </div>
                <p className="post-content">
                  <strong>{post.firstName ? `${post.firstName} ${post.lastName}` : `Explorer ${post.userID}`}</strong> {post.content}
                </p>
                <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p>No posts yet. Be the first to share an experience!</p>}
        </div>
      </section>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
