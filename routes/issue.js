const express = require('express');
const Issue = require('../models/Issue');
const { verifyToken } = require('./auth');

const router = express.Router();

// Create issue
router.post('/', verifyToken, async (req, res) => {
    const { title, description, projectId } = req.body;

    try {
        const newIssue = new Issue({
            title,
            description,
            projectId,
            userId: req.user.id
        });

        await newIssue.save();

        res.status(201).json(newIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all issues
router.get('/', verifyToken, async (req, res) => {
    try {
        const issues = await Issue.find().populate('projectId', 'name').populate('userId', 'username');
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get issue by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).populate('projectId', 'name').populate('userId', 'username');
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update issue
router.put('/:id', verifyToken, async (req, res) => {
    const { title, description } = req.body;

    try {
        let issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        // Only the owner or admin can update the issue
        if (issue.userId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        issue.title = title;
        issue.description = description;

        await issue.save();

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete issue
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        let issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        // Only the owner or admin can delete the issue
        if (issue.userId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        await issue.remove();

        res.json({ message: 'Issue removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
