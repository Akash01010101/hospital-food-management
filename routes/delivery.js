const express = require('express');
const router = express.Router();
const PantryStaff = require('../models/PantryStaff');
const authMiddleware = require('../middleware/authMiddleware');

// Add a new delivery staff member (Manager only)
router.post('/', authMiddleware(['Manager']), async (req, res) => {
    try {
        const staff = new PantryStaff(req.body);
        staff.role = "Delivery";
        await staff.save();
        res.status(201).json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Assign a delivery task (Manager or Pantry roles only)
router.put('/assign-delivery/:staffId', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const { staffId } = req.params;
        const { dietChartId, patientId } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        staff.assignedDeliveries.push({ dietChartId, patientId, status: "Pending" });
        await staff.save();

        res.json({ message: "Delivery assigned successfully", staff });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update delivery status (Delivery role only)
router.put('/update-delivery/:staffId/:deliveryId', authMiddleware(['Delivery']), async (req, res) => {
    try {
        const { staffId, deliveryId } = req.params;
        const { status, deliveryNotes } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        const delivery = staff.assignedDeliveries.id(deliveryId);
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

        delivery.status = status;
        if (status === "Delivered") delivery.deliveredAt = new Date();
        if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;

        await staff.save();

        res.json({ message: "Delivery updated successfully", staff });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all deliveries for a staff member (Delivery role only)
router.get('/:staffId/deliveries', authMiddleware(['Delivery']), async (req, res) => {
    try {
        const { staffId } = req.params;

        const staff = await PantryStaff.findById(staffId).populate('assignedDeliveries.dietChartId');
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        res.json(staff.assignedDeliveries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
