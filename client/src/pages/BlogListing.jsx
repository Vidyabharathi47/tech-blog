
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './BlogListing.css';

function BlogListing() {
  const [posts, setPosts] = useState([]);

  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Website URL for SEO
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || window.location.origin
  ).replace(/\/$/, '');

  // Fetch published articles
  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts', {
          params: {
            category: category || undefined,
            search: search || undefined,
            page,
            limit: 6
          }
        });

        if (active) {
          setPosts(response.data.posts || []);
          setTotalPages(
            Math.max(1, response.data.totalPages || 1)
          );
          setError('');
        }

      } catch (err) {
        console.error('Error fetching articles:', err);

        if (active) {
          setError('Unable to load articles. Please try again.');
          setPosts([]);
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
  }, [category, search, page]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    setLoading(true);
    setCategory(e.target.value);
    setPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();

    const newSearch = searchTerm.trim();

    if (newSearch === search && page === 1) {
      return;
    }

    setLoading(true);
    setSearch(newSearch);
    setPage(1);
  };

  // Handle pagination
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setLoading(true);
    setPage(newPage);
  };

  return (
    <div className="listing-page">

      {/* Blog Listing SEO */}
      <Helmet>

        <title>Technology Articles | TechBlog</title>

        <meta
          name="description"
          content="Browse technology articles covering artificial intelligence, cybersecurity, cloud computing and the latest innovations."
        />

        <meta
          name="keywords"
          content="Technology Articles, AI, Cybersecurity, Cloud Computing, TechBlog"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`${siteUrl}/articles`}
        />

        {/* Open Graph Metadata */}
        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content={`${siteUrl}/articles`}
        />

        <meta
          property="og:title"
          content="Technology Articles | TechBlog"
        />

        <meta
          property="og:description"
          content="Explore informative articles about technology and innovation."
        />

        {/* Twitter Metadata */}
        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="Technology Articles | TechBlog"
        />

        <meta
          name="twitter:description"
          content="Browse articles about technology, AI, cybersecurity and cloud computing."
        />

      </Helmet>

      {/* Navbar */}
      <nav className="listing-navbar">

        <Link to="/" className="listing-logo">
          TECH<span>BLOG.</span>
        </Link>

        <div className="listing-nav-links">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/login">Admin Login</Link>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="listing-hero">

        <p>EXPLORE OUR CONTENT</p>

        <h1>Technology Articles</h1>

        <span>
          Discover articles about technology, AI,
          cybersecurity and cloud computing.
        </span>

      </section>

      {/* Article Listing */}
      <section className="listing-container">

        {/* Search and Category Filter */}
        <div className="listing-toolbar">

          <form
            onSubmit={handleSearch}
            className="listing-search"
          >

            <input
              type="search"
              placeholder="Search articles by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button type="submit">
              Search
            </button>

          </form>

          {/* Category Filter */}
          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-filter"
          >

            <option value="">
              All Categories
            </option>

            <option value="Technology">
              Technology
            </option>

            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>

            <option value="Cybersecurity">
              Cybersecurity
            </option>

            <option value="Cloud Computing">
              Cloud Computing
            </option>

          </select>

        </div>

        {/* Section Heading */}
        <div className="listing-heading">

          <h2>Latest Articles</h2>

          <span>
            {posts.length} articles on this page
          </span>

        </div>

        {/* Loading */}
        {loading && (
          <p className="listing-message">
            Loading articles...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="listing-error">
            {error}
          </p>
        )}

        {/* Empty Result */}
        {!loading && !error && posts.length === 0 && (
          <p className="listing-message">
            No published articles found.
            Try another category or search.
          </p>
        )}

        {/* Article Cards */}
        {!loading && !error && (

          <div className="listing-grid">

            {posts.map((post) => (

              <Link
                to={`/blog/${encodeURIComponent(post.slug || post._id)}`}
                className="listing-card"
                key={post._id}
              >

                <img
                  src={post.image}
                  alt={post.title}
                  className="listing-image"
                />

                <div className="listing-card-content">

                  <span className="listing-category">
                    {post.category}
                  </span>

                  <h3>{post.title}</h3>

                  <p>{post.excerpt}</p>

                  <div className="listing-card-footer">

                    <span>
                      By {post.author}
                    </span>

                    <span>
                      Read article →
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (

          <div className="listing-pagination">

            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>

          </div>

        )}

      </section>

      {/* Footer */}
      <footer className="listing-footer">
        © 2026 TECHBLOG. All rights reserved.
      </footer>

    </div>
  );
}

export default BlogListing;
