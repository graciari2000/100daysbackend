const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
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
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
        maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    currentDay: {
        type: Number,
        required: true,
        min: [0, 'Current day cannot be negative'],
        max: [100, 'Current day cannot exceed 100'],
        default: 0
    },
    completedDays: [{
        type: Boolean,
        default: false
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

challengeSchema.index({ author: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ createdAt: -1 });
challengeSchema.index({ currentDay: 1 });

challengeSchema.virtual('progress').get(function () {
    return (this.currentDay / 100) * 100;
});

challengeSchema.virtual('completedCount').get(function () {
    return this.completedDays.filter(day => day).length;
});

challengeSchema.virtual('daysRemaining').get(function () {
    return 100 - this.currentDay;
});

challengeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Challenge', challengeSchema);