const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: [300, 'Excerpt cannot be more than 300 characters']
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
        maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ author: 1 });

blogPostSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);