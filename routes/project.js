const express = require('express');
const Project = require('../models/Project');
const { verifyToken } = require('./auth');

const router = express.Router();

// Create project
router.post('/', verifyToken, async (req, res) => {
    const { name, description } = req.body;

    try {
        const newProject = new Project({
            name,
            description
        });

        await newProject.save();

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all projects
router.get('/', verifyToken, async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get project by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project
router.put('/:id', verifyToken, async (req, res) => {
    const { name, description } = req.body;

    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.name = name;
        project.description = description;

        await project.save();

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete project
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.remove();

        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
