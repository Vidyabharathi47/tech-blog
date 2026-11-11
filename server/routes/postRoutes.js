
const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// ==========================================
// 1. GET ALL PUBLISHED POSTS (PUBLIC)
// Search, Category Filter and Pagination
// ==========================================

router.get('/', async (req, res) => {
  try {
    const filter = {
      status: 'published'
    };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      const searchTerm = req.query.search.trim();

      if (searchTerm) {
        const escapedSearch = searchTerm.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

        filter.$or = [
          {
            title: {
              $regex: escapedSearch,
              $options: 'i'
            }
          },
          {
            excerpt: {
              $regex: escapedSearch,
              $options: 'i'
            }
          },
          {
            category: {
              $regex: escapedSearch,
              $options: 'i'
            }
          }
        ];
      }
    }

    // Pagination
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 5)
    );

    const skip = (page - 1) * limit;

    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      page,
      total,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Error fetching posts:', err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ==========================================
// 2. GET ALL POSTS FOR ADMIN (PROTECTED)
// Includes Draft and Published Posts
// ==========================================

router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
      total: posts.length
    });

  } catch (err) {
    console.error('Error fetching admin posts:', err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ==========================================
// 3. CREATE NEW POST (ADMIN ONLY)
// ==========================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const status = req.body.status || 'draft';

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid publishing status.'
      });
    }

    const post = new Post({
      ...req.body,
      status
    });

    const savedPost = await post.save();

    res.status(201).json({
      message: 'Blog post created successfully!',
      post: savedPost
    });

  } catch (err) {
    console.error('Error creating post:', err);

    res.status(400).json({
      message: err.message
    });
  }
});


// ==========================================
// 4. GET SINGLE PUBLISHED POST
// Supports MongoDB ID OR SEO SLUG
// ==========================================

router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;

    let post;

    // Check whether identifier is a 24-character MongoDB ID
    const isMongoId = /^[a-fA-F0-9]{24}$/.test(identifier);

    if (isMongoId && mongoose.isValidObjectId(identifier)) {

      // Find using MongoDB ID
      post = await Post.findOne({
        _id: identifier,
        status: 'published'
      });

    } else {

      // Find using SEO-friendly slug
      post = await Post.findOne({
        slug: identifier,
        status: 'published'
      });

    }

    if (!post) {
      return res.status(404).json({
        message: 'Published post not found.'
      });
    }

    res.status(200).json(post);

  } catch (err) {
    console.error('Error fetching single post:', err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ==========================================
// 5. UPDATE POST (ADMIN ONLY)
// Supports Draft / Published Status
// ==========================================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    if (
      req.body.status &&
      !['draft', 'published'].includes(req.body.status)
    ) {
      return res.status(400).json({
        message: 'Invalid publishing status.'
      });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    res.status(200).json({
      message: 'Blog post updated successfully!',
      post
    });

  } catch (err) {
    console.error('Error updating post:', err);

    res.status(400).json({
      message: err.message
    });
  }
});


// ==========================================
// 6. DELETE POST (ADMIN ONLY)
// ==========================================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    res.status(200).json({
      message: 'Blog post deleted successfully!'
    });

  } catch (err) {
    console.error('Error deleting post:', err);

    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
