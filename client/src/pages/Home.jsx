
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Website URL for SEO
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || window.location.origin
  ).replace(/\/$/, '');

  // Fetch published blog posts
  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts', {
          params: {
            page: 1,
            limit: 6
          }
        });

        if (active) {
          setPosts(response.data.posts || []);
          setError('');
        }

      } catch (err) {
        console.error('Error fetching posts:', err);

        if (active) {
          setError('Unable to load blog posts. Please try again.');
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      active = false;
    };
  }, []);

  // Search blog posts
  const filteredPosts = posts.filter((post) =>
    `${post.title} ${post.category} ${post.excerpt}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="home-page">

      {/* Homepage SEO Metadata */}
      <Helmet>
        <title>TechBlog | Explore Technology and Innovation</title>

        <meta
          name="description"
          content="Explore the latest articles about technology, artificial intelligence, cybersecurity and cloud computing on TechBlog."
        />

        <meta
          name="keywords"
          content="Technology Blog, Artificial Intelligence, Cybersecurity, Cloud Computing, Tech Articles"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`${siteUrl}/`}
        />

        {/* Open Graph Metadata */}
        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content={`${siteUrl}/`}
        />

        <meta
          property="og:title"
          content="TechBlog | Explore Technology and Innovation"
        />

        <meta
          property="og:description"
          content="Discover informative articles about technology, AI, cybersecurity and cloud computing."
        />

        {/* Twitter Metadata */}
        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="TechBlog | Explore Technology"
        />

        <meta
          name="twitter:description"
          content="Explore technology articles, AI, cybersecurity and cloud computing."
        />
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">

        <Link to="/" className="logo">
          TECH<span>BLOG.</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/login">Admin Login</Link>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="hero">

        <p className="hero-tag">
          WELCOME TO TECH BLOG
        </p>

        <h1>
          Explore Technology.
          <br />
          <span>Discover Something New.</span>
        </h1>

        <p className="hero-description">
          Read interesting articles about technology,
          cybersecurity, cloud computing and more.
        </p>

        <a href="#articles" className="hero-button">
          Explore Articles →
        </a>

      </section>

      {/* Latest Articles */}
      <section className="articles-section" id="articles">

        <div className="section-heading">

          <div>
            <p className="section-tag">OUR CONTENT</p>
            <h2>Latest Articles</h2>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

        </div>

        {/* Loading */}
        {loading && (
          <p>Loading articles...</p>
        )}

        {/* Error */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* No Results */}
        {!loading && !error && filteredPosts.length === 0 && (
          <p className="empty-message">
            No published articles found.
          </p>
        )}

        {/* Blog Cards */}
        <div className="posts-grid">

          {!loading && !error && filteredPosts.map((post) => (

            <Link
              to={`/blog/${encodeURIComponent(post.slug || post._id)}`}
              className="post-card"
              key={post._id}
            >

              <img
                src={post.image}
                alt={post.title}
                className="post-image"
              />

              <div className="post-content">

                <span className="post-category">
                  {post.category}
                </span>

                <h3>{post.title}</h3>

                <p className="post-excerpt">
                  {post.excerpt}
                </p>

                <div className="post-footer">

                  <span>
                    By {post.author}
                  </span>

                  <span>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : ''}
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

        {/* View All Articles */}
        {!loading && !error && posts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '35px' }}>

            <Link to="/articles" className="hero-button">
              View All Articles →
            </Link>

          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 TECHBLOG. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Home;
