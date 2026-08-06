import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';
import '../styles/explorer.css';

export default function ExplorerHome() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    fetchPosts();
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setLoggedInUserId(user.id || user.userID);
      }
    } catch (e) {
      console.warn('Failed to parse user from local storage', e);
    }
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

  const handlePostCreated = (newOrUpdatedPost, isEdit) => {
    if (isEdit) {
      setPosts(posts.map(p => p.postID === newOrUpdatedPost.postID ? { ...p, ...newOrUpdatedPost } : p));
    } else {
      setPosts([newOrUpdatedPost, ...posts]);
    }
    setEditingPost(null);
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleOpenNewPostModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
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
          <button className="btn-primary" onClick={handleOpenNewPostModal}>Post Experience</button>
        </div>

        <div className="posts-container">
          {posts.map(post => (
            <div key={post.postID || Math.random()} className="post">
              <div className="post-header">
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
                <div className="post-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="action-icon" title="Like">❤️</span>
                  <span className="action-icon" title="Comment">💬</span>
                  <span className="action-icon" title="Share">↗️</span>
                  {loggedInUserId === post.userID && (
                    <span 
                      className="action-icon edit-icon" 
                      title="Edit Post" 
                      onClick={() => handleEditClick(post)} 
                      style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      ✏️
                    </span>
                  )}
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
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
        editPost={editingPost}
      />
    </div>
  );
}
