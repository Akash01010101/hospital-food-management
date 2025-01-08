const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

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

// Get all patients (Manager and Pantry staff can view)
router.get('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
