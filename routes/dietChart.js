const express = require('express');
const router = express.Router();
const DietChart = require('../models/DietChart');
const authMiddleware = require('../middleware/authMiddleware');

// Create a diet chart for a patient (Manager or Pantry roles only)
router.post('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const dietChart = new DietChart(req.body);
        await dietChart.save();
        res.status(201).json(dietChart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const dietCharts = await DietChart.find()
            .populate('patientId', 'name') // Populate only the 'name' field from Patient model
            .exec();

        res.json(dietCharts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get diet chart for a specific patient (Manager, Pantry, and Delivery roles)
router.get('/:patientId', authMiddleware(['Manager', 'Pantry', 'Delivery']), async (req, res) => {
    try {
        const dietChart = await DietChart.findOne({ patientId: req.params.patientId });
        if (!dietChart) {
            return res.status(404).json({ error: 'Diet chart not found' });
        }
        res.json(dietChart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a diet chart (Manager or Pantry roles only)
router.put('/:id', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const updatedDietChart = await DietChart.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDietChart) {
            return res.status(404).json({ error: 'Diet chart not found' });
        }
        res.json(updatedDietChart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a diet chart (Manager only)
router.delete('/:id', authMiddleware(['Manager']), async (req, res) => {
    try {
        const deletedDietChart = await DietChart.findByIdAndDelete(req.params.id);
        if (!deletedDietChart) {
            return res.status(404).json({ error: 'Diet chart not found' });
        }
        res.json({ message: 'Diet chart deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
