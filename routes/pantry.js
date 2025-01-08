const express = require('express');
const router = express.Router();
const PantryStaff = require('../models/PantryStaff');
const DietChart = require('../models/DietChart');
const authMiddleware = require('../middleware/authMiddleware');

// Add a new pantry staff member (Manager only)
router.post('/', authMiddleware(['Manager']), async (req, res) => {
    try {
        const staff = new PantryStaff(req.body);
        await staff.save();
        res.status(201).json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all pantry staff (Manager and Pantry roles can view)
router.get('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const staffList = await PantryStaff.find().populate('assignedTasks.dietChartId');
        res.json(staffList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign a diet chart to pantry staff (Manager only)
router.put('/assign-task/:staffId', authMiddleware(['Manager']), async (req, res) => {
    try {
        const { staffId } = req.params;
        const { dietChartId } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        staff.assignedTasks.push({ dietChartId });
        await staff.save();

        res.json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update task status (Pantry staff only)
router.put('/update-task/:staffId/:taskId', authMiddleware(['Pantry']), async (req, res) => {
    try {
        const { staffId, taskId } = req.params;
        const { status } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        const task = staff.assignedTasks.id(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.status = status;
        await staff.save();

        res.json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
