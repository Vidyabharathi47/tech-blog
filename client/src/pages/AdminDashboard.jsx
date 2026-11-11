
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Blog post form
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    author: 'Admin',
    status: 'draft'
  });

  // Fetch all posts for admin
  const fetchPosts = useCallback(async () => {
    const response = await api.get('/posts/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.posts || [];
  }, [token]);

  // Load posts when dashboard opens
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let active = true;

    fetchPosts()
      .then((data) => {
        if (active) {
          setPosts(data);
          setError('');
        }
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);

        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load blog posts. Please login again.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, navigate, fetchPosts]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: '',
      author: 'Admin',
      status: 'draft'
    });

    setEditingId(null);
  };

  // Create or update blog post
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      if (editingId) {
        await api.put(
          `/posts/${editingId}`,
          form,
          config
        );

        setMessage('Blog post updated successfully!');
      } else {
        await api.post(
          '/posts',
          form,
          config
        );

        setMessage('Blog post created successfully!');
      }

      resetForm();

      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);

    } catch (err) {
      console.error('Error saving post:', err);

      setError(
        err.response?.data?.message ||
        'Unable to save blog post.'
      );
    }
  };

  // Edit blog post
  const handleEdit = (post) => {
    setEditingId(post._id);

    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      category: post.category || '',
      author: post.author || 'Admin',
      status: post.status || 'draft'
    });

    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Delete blog post
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this blog post?'
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Blog post deleted successfully!');

      if (editingId === id) {
        resetForm();
      }

      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);

    } catch (err) {
      console.error('Error deleting post:', err);

      setError(
        err.response?.data?.message ||
        'Unable to delete blog post.'
      );
    }
  };

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard">

      {/* Dashboard Navbar */}
      <nav className="dashboard-navbar">

        <h2>
          TECH<span>BLOG.</span>
        </h2>

        <div>
          <button
            className="home-button"
            onClick={() => navigate('/')}
          >
            View Website
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </nav>

      {/* Dashboard Heading */}
      <section className="dashboard-heading">

        <p>ADMIN PANEL</p>

        <h1>Welcome to Dashboard</h1>

        <span>
          Manage your technology blog articles here.
        </span>

      </section>

      {/* Dashboard Statistics */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <h3>{posts.length}</h3>
          <p>Total Blog Posts</p>
        </div>

        <div className="stat-card">
          <h3>
            {posts.filter(
              (post) => post.status === 'published'
            ).length}
          </h3>
          <p>Published Posts</p>
        </div>

        <div className="stat-card">
          <h3>
            {posts.filter(
              (post) => post.status === 'draft'
            ).length}
          </h3>
          <p>Draft Posts</p>
        </div>

      </div>

      {/* Create / Edit Blog Form */}
      <section className="dashboard-section">

        <h2>
          {editingId
            ? 'Edit Blog Post'
            : 'Create New Blog Post'}
        </h2>

        <form
          className="post-form"
          onSubmit={handleSubmit}
        >

          <label>Blog Title</label>

          <input
            type="text"
            name="title"
            placeholder="Enter blog title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Slug</label>

          <input
            type="text"
            name="slug"
            placeholder="example-blog-title"
            value={form.slug}
            onChange={handleChange}
            required
          />

          <label>Short Description</label>

          <textarea
            name="excerpt"
            placeholder="Enter short description"
            value={form.excerpt}
            onChange={handleChange}
            required
          />

          <label>Blog Content</label>

          <textarea
            name="content"
            placeholder="Write your complete blog content"
            rows="6"
            value={form.content}
            onChange={handleChange}
            required
          />

          <label>Image URL</label>

          <input
            type="url"
            name="image"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={handleChange}
            required
          />

          <label>Category</label>

          <input
            type="text"
            name="category"
            placeholder="Technology"
            value={form.category}
            onChange={handleChange}
            required
          />

          <label>Author</label>

          <input
            type="text"
            name="author"
            placeholder="Author name"
            value={form.author}
            onChange={handleChange}
            required
          />

          {/* Publishing Status */}
          <label>Publishing Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          {/* Form Buttons */}
          <div className="form-buttons">

            <button
              type="submit"
              className="save-button"
            >
              {editingId
                ? 'Update Post'
                : 'Create Post'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </section>

      {/* Manage Existing Posts */}
      <section className="dashboard-section">

        <h2>Manage Blog Posts</h2>

        {loading && <p>Loading posts...</p>}

        {!loading && !error && posts.length === 0 && (
          <p>No blog posts available.</p>
        )}

        <div className="admin-post-list">

          {posts.map((post) => (

            <div
              className="admin-post-card"
              key={post._id}
            >

              <div className="admin-post-info">

                <h3>{post.title}</h3>

                <p>
                  {post.category} | By {post.author}
                </p>

                <span
                  className={`status-label ${
                    post.status === 'published'
                      ? 'published-status'
                      : 'draft-status'
                  }`}
                >
                  {post.status || 'draft'}
                </span>

              </div>

              <div className="admin-post-actions">

                <button
                  className="edit-button"
                  onClick={() => handleEdit(post)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(post._id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;
