const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');
const DietChart = require('../models/DietChart');
// Create a new patient (Manager only)
router.post('/', authMiddleware(['Manager']), async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/:id', authMiddleware(['Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find the patient by ID and update their details
        const updatedPatient = await Patient.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updates against the schema
        });

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Get all patients (Manager and Pantry staff can view)
router.get('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const patients = await Patient.find();
        const charts = await DietChart.find();
        res.json({patients,charts});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
