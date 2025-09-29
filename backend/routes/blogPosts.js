const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// GET all blog posts
router.get('/', async (req, res, next) => {
    try {
        const { search, tag, author, sort = '-createdAt', page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        if (tag) {
            query.tags = { $in: [tag] };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        const posts = await BlogPost.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BlogPost.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                results: posts.length,
                totalResults: total
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET single blog post by ID
router.get('/:id', async (req, res, next) => {
    try {
        const post = await BlogPost.findOne({ id: req.params.id });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
});

// CREATE new blog post
router.post('/', async (req, res, next) => {
    try {
        const { id, title, content, excerpt, author, tags } = req.body;

        if (!title || !content || !author) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and author are required'
            });
        }

        const newPost = new BlogPost({
            id,
            title,
            content,
            excerpt: excerpt || content.slice(0, 200) + (content.length > 200 ? '...' : ''),
            author,
            tags: tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: savedPost
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Blog post with this ID already exists'
            });
        }
        next(error);
    }
});

// UPDATE blog post
router.put('/:id', async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;

        const updatedPost = await BlogPost.findOneAndUpdate(
            { id: req.params.id },
            {
                $set: {
                    ...(title && { title }),
                    ...(content && {
                        content,
                        excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : '')
                    }),
                    ...(tags && { tags }),
                    updatedAt: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: updatedPost
        });
    } catch (error) {
        next(error);
    }
});

// DELETE blog post
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedPost = await BlogPost.findOneAndDelete({ id: req.params.id });

        if (!deletedPost) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully',
            data: deletedPost
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;