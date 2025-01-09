const express = require('express');
const router = express.Router();
const DietChart = require('../models/DietChart');
const authMiddleware = require('../middleware/authMiddleware');


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
            .populate('patientId', 'name') 
            .exec();

        res.json(dietCharts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


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
