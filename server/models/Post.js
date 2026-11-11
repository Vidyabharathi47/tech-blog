const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    title: {type: String, required: true},
    slug: {type: String, required: true, unique: true},
    excerpt: {type: String, required: true},
    content: {type: String, required: true},
    image: {type: String, required: true},
    category: {type: String, required: true},
    author: {type: String, required: true},
    status: {type: String, default: 'draft', required: true},
    featured: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
  
  
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;

