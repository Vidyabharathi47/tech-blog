
const express = require('express');
const router = express.Router();

const Post = require('../models/Post');

// Escape special characters for XML
const escapeXml = (value) => {
  return String(value).replace(/[<>&'"]/g, (char) => {
    const entities = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;'
    };

    return entities[char];
  });
};

// Format date for sitemap
const formatDate = (date) => {
  if (!date) return '';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().split('T')[0];
};

// Generate Dynamic Sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = (
      process.env.SITE_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    // Fetch only published posts
    const posts = await Post.find({
      status: 'published'
    })
      .select('slug _id createdAt updatedAt')
      .sort({ createdAt: -1 });

    // Static website pages
    const staticUrls = [
      `${siteUrl}/`,
      `${siteUrl}/articles`
    ];

    // Convert static pages into XML
    const staticXml = staticUrls.map((url) => `
      <url>
        <loc>${escapeXml(url)}</loc>
      </url>
    `).join('');

    // Convert published articles into XML
    const articleXml = posts.map((post) => {
      const identifier = post.slug || post._id.toString();

      const articleUrl =
        `${siteUrl}/blog/${encodeURIComponent(identifier)}`;

      const lastModified = formatDate(
        post.updatedAt || post.createdAt
      );

      return `
        <url>
          <loc>${escapeXml(articleUrl)}</loc>
          ${lastModified
            ? `<lastmod>${lastModified}</lastmod>`
            : ''}
        </url>
      `;
    }).join('');

    // Complete XML document
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticXml}
        ${articleXml}
      </urlset>
    `;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'no-cache');

    res.status(200).send(sitemap);

  } catch (err) {
    console.error('Sitemap generation error:', err);

    res.status(500).json({
      message: 'Unable to generate sitemap.'
    });
  }
});

module.exports = router;
