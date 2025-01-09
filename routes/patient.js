const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');
const DietChart = require('../models/DietChart');

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

        
        const updatedPatient = await Patient.findByIdAndUpdate(id, updates, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const patients = await Patient.find();
        const charts = await DietChart.find();
        res.json({patients,charts});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', authMiddleware(['Manager']), async (req, res) => {
    try {
        const { id } = req.params;

        
        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        
        await DietChart.deleteMany({ patientId: id });

        res.json({ message: 'Patient and associated diet charts deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
