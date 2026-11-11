
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './SingleBlog.css';

function SingleBlog() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loadedSlug, setLoadedSlug] = useState('');
  const [error, setError] = useState('');

  // Website URL for SEO
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || window.location.origin
  ).replace(/\/$/, '');

  // Check whether article has loaded
  const loading = loadedSlug !== slug;

  // Fetch individual blog post using slug or MongoDB ID
  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      try {
        const response = await api.get(
          `/posts/${encodeURIComponent(slug)}`
        );

        if (active) {
          setPost(response.data);
          setError('');
        }

      } catch (err) {
        console.error('Error fetching article:', err);

        if (active) {
          setPost(null);

          setError(
            err.response?.data?.message ||
            'Unable to load this article.'
          );
        }

      } finally {
        if (active) {
          setLoadedSlug(slug);
        }
      }
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [slug]);

  // Update browser title dynamically
  useEffect(() => {
    if (loading) {
      document.title = 'Loading Article | TechBlog';
    } else if (error || !post) {
      document.title = 'Article Not Found | TechBlog';
    } else {
      document.title = `${post.title} | TechBlog`;
    }
  }, [loading, error, post]);

  // Loading screen
  if (loading) {
    return (
      <div className="single-blog">

        <Helmet>
          <title>Loading Article | TechBlog</title>

          <meta
            name="robots"
            content="noindex, nofollow"
          />
        </Helmet>

        <p>Loading article...</p>

      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="single-blog">

        <Helmet>
          <title>Article Not Found | TechBlog</title>

          <meta
            name="robots"
            content="noindex, nofollow"
          />
        </Helmet>

        <p>{error}</p>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="single-blog">

        <Helmet>
          <title>Article Not Found | TechBlog</title>

          <meta
            name="robots"
            content="noindex, nofollow"
          />
        </Helmet>

        <p>Article not found.</p>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

      </div>
    );
  }

  // SEO description
  const seoDescription = (
    post.excerpt ||
    post.content ||
    'Read the latest technology articles on TechBlog.'
  ).slice(0, 160);

  // Canonical article URL
  const articleUrl =
    `${siteUrl}/blog/${encodeURIComponent(
      post.slug || post._id
    )}`;

  return (
    <div className="single-blog">

      {/* Individual Article SEO Metadata */}
      <Helmet>

        <title>{post.title} | TechBlog</title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta
          name="keywords"
          content={`${post.title}, ${post.category}, Technology Blog, TechBlog`}
        />

        <meta
          name="robots"
          content="index, follow"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={articleUrl}
        />

        {/* Open Graph Metadata */}
        <meta
          property="og:type"
          content="article"
        />

        <meta
          property="og:url"
          content={articleUrl}
        />

        <meta
          property="og:title"
          content={`${post.title} | TechBlog`}
        />

        <meta
          property="og:description"
          content={seoDescription}
        />

        {post.image && (
          <meta
            property="og:image"
            content={post.image}
          />
        )}

        {/* Twitter Metadata */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={`${post.title} | TechBlog`}
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        {post.image && (
          <meta
            name="twitter:image"
            content={post.image}
          />
        )}

      </Helmet>

      {/* Back to Home */}
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>

      {/* Blog Article */}
      <article className="blog-article">

        {/* Category */}
        <span className="post-category">
          {post.category}
        </span>

        {/* Article Title */}
        <h1>{post.title}</h1>

        {/* Author and Date */}
        <div className="blog-meta">

          <span>
            By {post.author}
          </span>

          <span>
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : ''}
          </span>

        </div>

        {/* Article Image */}
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="blog-banner"
          />
        )}

        {/* Short Description */}
        <p className="blog-excerpt">
          {post.excerpt}
        </p>

        {/* Full Article Content */}
        <div className="blog-content">
          {post.content}
        </div>

      </article>

    </div>
  );
}

export default SingleBlog;


