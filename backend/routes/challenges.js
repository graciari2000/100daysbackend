const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// GET all challenges
router.get('/', async (req, res, next) => {
    try {
        const { status, author, sort = '-createdAt' } = req.query;

        let query = {};

        if (status === 'active') {
            query.isActive = true;
            query.currentDay = { $lt: 100 };
        } else if (status === 'completed') {
            query.currentDay = { $gte: 100 };
        } else if (status === 'paused') {
            query.isActive = false;
            query.currentDay = { $lt: 100 };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        const challenges = await Challenge.find(query).sort(sort);

        res.json({
            success: true,
            data: challenges
        });
    } catch (error) {
        next(error);
    }
});

// GET single challenge by ID
router.get('/:id', async (req, res, next) => {
    try {
        const challenge = await Challenge.findOne({ id: req.params.id });

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        res.json({
            success: true,
            data: challenge
        });
    } catch (error) {
        next(error);
    }
});

// CREATE new challenge
router.post('/', async (req, res, next) => {
    try {
        const { id, title, description, author, startDate } = req.body;

        if (!title || !description || !author) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and author are required'
            });
        }

        const newChallenge = new Challenge({
            id,
            title,
            description,
            author,
            startDate: startDate ? new Date(startDate) : new Date(),
            currentDay: 0,
            completedDays: new Array(100).fill(false),
            isActive: true,
            createdAt: new Date()
        });

        const savedChallenge = await newChallenge.save();

        res.status(201).json({
            success: true,
            message: 'Challenge created successfully',
            data: savedChallenge
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Challenge with this ID already exists'
            });
        }
        next(error);
    }
});

// UPDATE challenge
router.put('/:id', async (req, res, next) => {
    try {
        const { title, description, currentDay, completedDays, isActive } = req.body;

        const updatedChallenge = await Challenge.findOneAndUpdate(
            { id: req.params.id },
            {
                $set: {
                    ...(title && { title }),
                    ...(description && { description }),
                    ...(currentDay !== undefined && { currentDay }),
                    ...(completedDays && { completedDays }),
                    ...(isActive !== undefined && { isActive })
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedChallenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        res.json({
            success: true,
            message: 'Challenge updated successfully',
            data: updatedChallenge
        });
    } catch (error) {
        next(error);
    }
});

// DELETE challenge
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedChallenge = await Challenge.findOneAndDelete({ id: req.params.id });

        if (!deletedChallenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        res.json({
            success: true,
            message: 'Challenge deleted successfully',
            data: deletedChallenge
        });
    } catch (error) {
        next(error);
    }
});

// TOGGLE day completion
router.patch('/:id/toggle-day/:day', async (req, res, next) => {
    try {
        const challenge = await Challenge.findOne({ id: req.params.id });
        const day = parseInt(req.params.day);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (day < 1 || day > 100) {
            return res.status(400).json({
                success: false,
                message: 'Day must be between 1 and 100'
            });
        }

        const dayIndex = day - 1;
        challenge.completedDays[dayIndex] = !challenge.completedDays[dayIndex];
        challenge.currentDay = Math.max(challenge.currentDay, day);

        await challenge.save();

        res.json({
            success: true,
            message: `Day ${day} toggled successfully`,
            data: challenge
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;